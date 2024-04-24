// https://www.youtube.com/watch?v=i7OWJwsU_WA -- tutorial on express/react app setup
import { version } from '../../package.json';
import os from 'os';
import config from 'config';
import fs from 'fs';
import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { Renogy } from '@/core/renogy2';
import { RenogyLog } from '@/core/renogy-log';
import { TransparentTcpLink } from './transparent-tcp-link';
import { NtripTransport } from './ntrip-transport';
import { uBloxSerial } from './ublox-serial';
import { exec } from 'child_process';
import { StreamLogger } from './stream-logger';

const serverStartTime = new Date();
const osBootTime = new Date(serverStartTime.getTime() - os.uptime() * 1000);

console.log(`\nFixed Base Server v${version}\n`);

const LOG_DIR = './logs';
const LOG_IN_PREFIX = 'EXTERN-IN';
const LOG_RTCM3_OUT_PREFIX = 'RTCM3-OUT';
const LOG_UBX_OUT_PREFIX = 'UBX-OUT--';
const LOG_UBX_OUT_EXTENSION = 'ubx';
const NTRIP_BOOT_DELAY = 10000; // 10 seconds to allow network services to start

export const app = express();
const server = http.createServer(app);

const eth0Interface = os.networkInterfaces().eth0;
const wlan0Interface = os.networkInterfaces().wlan0;

const ethIP = eth0Interface ? eth0Interface[0].address : '127.0.0.1';
const wifiIP = wlan0Interface ? wlan0Interface[0].address : '127.0.0.1';

let configObject = config.util.toObject(); // mutable in case of config updates

const ubxSerial = new uBloxSerial();
const tcpRepeater = new TransparentTcpLink();
const ntrip = new NtripTransport();
const externInLog = new StreamLogger();
const rtcm3OutLog = new StreamLogger();
const ubxOutLog = new StreamLogger();
const renogy = new Renogy();
const renogyLog = new RenogyLog();

const io = new Server(server, {
    cors: {
        origin: function (origin, callback) {
            if (origin) {
                const ip = origin.split('//')[1];
                if (
                    ip.startsWith(ethIP.substring(0, ethIP.lastIndexOf('.'))) ||
                    ip.startsWith(wifiIP.substring(0, wifiIP.lastIndexOf('.'))) ||
                    os.hostname()
                ) {
                    callback(null, true);
                } else {
                    callback(new Error('Not allowed by CORS'));
                }
            } else {
                callback(new Error('Origin is undefined'));
            }
        },
        methods: ['GET', 'POST'],
    },
});

app.use(cors());

const connectedSockets = new Set(); // keep track of connected sockets

ntrip.on('connected', () => {
    io.emit('ntripStatus', true);
});

ntrip.on('disconnected', () => {
    io.emit('ntripStatus', false);
});

ntrip.on('error', (text) => {
    // delay sending the error so it doesn't get overshadowed by a disconnect message
    setTimeout(() => io.emit('ntripError', text), 2000);
});

async function connectSerialPort(path: string, baud: number) {
    const onConnect = () => {
        console.log(`Opened serial port              ${ubxSerial.path}`);

        io.emit('portStatus', true);

        if (configObject.ntrip.enable) {
            ntrip.connect(
                configObject.ntrip.host,
                configObject.ntrip.port,
                configObject.ntrip.mountpoint,
                configObject.ntrip.password,
                NTRIP_BOOT_DELAY,
            );
        }
    };

    const onDisconnect = () => {
        console.log(`Serial port closed`);
        io.emit('portStatus', false);
        ntrip.close();
    };

    const onUbxMsg = (data: Uint8Array) => {
        if (connectedSockets.size > 0) {
            io.emit('data', data);
        }
        tcpRepeater.write(data);
        ubxOutLog.write(data);
    };

    const onRtcm3Msg = (data: Uint8Array) => {
        if (connectedSockets.size > 0) {
            io.emit('data', data);
        }
        tcpRepeater.write(data);
        ntrip.write(data);
        rtcm3OutLog.write(data);
    };

    const onNmeaMsg = (data: Uint8Array) => {
        if (connectedSockets.size > 0) {
            io.emit('data', data);
        }
        tcpRepeater.write(data);
        // no need to forward to ntrip
    };

    const ports = await ubxSerial.portList();
    if (!ports.find((port) => port.path === path)) {
        console.error(`Serial port does not exist      ${path}`);
        return;
    }
    ubxSerial.create(path, baud, onConnect, onDisconnect, onUbxMsg, onRtcm3Msg, onNmeaMsg);
}

const connectTcpRepeater = (port: number) => {
    if (tcpRepeater.isActive) tcpRepeater.close();

    tcpRepeater
        .create(port, (data) => {
            ubxSerial.write(data);
            externInLog.write(data);
        })
        .then(() => {
            io.emit('tcpRepeaterStatus', true);
        });
};

const disconnectTcpRepeater = () => {
    tcpRepeater.close().then(() => {
        io.emit('tcpRepeaterStatus', false);
    });
};

const startLogging = () => {
    const emitStatus = () => {
        if (externInLog.isOpen && rtcm3OutLog.isOpen && ubxOutLog.isOpen) {
            io.emit('logStatus', true);
        }
    };
    externInLog.open(LOG_DIR, LOG_IN_PREFIX).then(emitStatus);
    rtcm3OutLog.open(LOG_DIR, LOG_RTCM3_OUT_PREFIX).then(emitStatus);
    ubxOutLog.open(LOG_DIR, LOG_UBX_OUT_PREFIX, LOG_UBX_OUT_EXTENSION).then(emitStatus);
};

const stopLogging = () => {
    const emitStatus = () => {
        if (!externInLog.isOpen && !rtcm3OutLog.isOpen && !ubxOutLog.isOpen) {
            io.emit('logStatus', false);
        }
    };
    externInLog.close().then(emitStatus);
    rtcm3OutLog.close().then(emitStatus);
    ubxOutLog.close().then(emitStatus);
};

const connectRenogy = (port: string) => {
    renogy.begin(port).then(() => {
        io.emit('renogyStatus', true);
    });
};

const disconnectRenogy = () => {
    renogy.close().then(() => {
        io.emit('renogyStatus', false);
    });
};

io.on('connect', (socket) => {
    connectedSockets.add(socket.id);
    console.log(`New websocket connection (${connectedSockets.size} total)`);

    const getConfig = () => {
        socket.emit('config', configObject);
    };

    const getPorts = async () => {
        const ports = await ubxSerial.portList();
        socket.emit('ports', ports);
    };

    const updateConfig = (newConfig: any) => {
        if (
            newConfig.serial.device !== configObject.serial.device ||
            newConfig.serial.baud !== configObject.serial.baud ||
            !ubxSerial.isConnected
        ) {
            connectSerialPort(newConfig.serial.device, newConfig.serial.baud);
        }

        if (
            newConfig.tcpRepeater.enable !== configObject.tcpRepeater.enable ||
            newConfig.tcpRepeater.port !== tcpRepeater.port
        ) {
            if (newConfig.tcpRepeater.enable) {
                connectTcpRepeater(newConfig.tcpRepeater.port);
            } else {
                disconnectTcpRepeater();
            }
        }

        if (
            newConfig.ntrip.enable !== configObject.ntrip.enable ||
            newConfig.ntrip.host !== configObject.ntrip.host ||
            newConfig.ntrip.port !== configObject.ntrip.port ||
            newConfig.ntrip.mountPoint !== configObject.ntrip.mountPoint ||
            newConfig.ntrip.password !== configObject.ntrip.password
        ) {
            if (newConfig.ntrip.enable && ubxSerial.isConnected) {
                ntrip.connect(
                    newConfig.ntrip.host,
                    newConfig.ntrip.port,
                    newConfig.ntrip.mountpoint,
                    newConfig.ntrip.password,
                    0,
                );
            } else {
                ntrip.close();
            }
        }

        if (newConfig.logging.enable !== configObject.logging.enable) {
            if (newConfig.logging.enable) {
                startLogging();
            } else {
                stopLogging();
            }
        }

        if (
            newConfig.renogySolar.enable !== configObject.renogySolar.enable ||
            newConfig.renogySolar.port !== configObject.renogySolar.port
        ) {
            if (newConfig.renogySolar.enable) {
                connectRenogy(newConfig.renogySolar.port);
            } else {
                disconnectRenogy();
            }
        }

        // save new config file
        configObject = { ...newConfig };
        fs.writeFileSync('config/default.json', JSON.stringify(configObject, null, 2));
    };

    const handleWrite = (data: Uint8Array) => {
        ubxSerial.write(data);
    };

    const handleShutdown = () => {
        exec('sudo shutdown now');
    };

    const handleReboot = () => {
        exec('sudo reboot');
    };

    const handleGetStartTime = () => {
        socket.emit('startTime', {
            os: osBootTime,
            server: serverStartTime,
            tcpRepeater: tcpRepeater.startTime,
            ntrip: ntrip.startTime,
            logger: ubxOutLog.startTime,
        });
    };

    const handleSetBattType = (battType: number) => {
        renogy.setBatteryType(battType);
    };

    const handleGetRenogyLog = () => {
        renogyLog.emitUpdate();
    };

    socket.on('getConfig', getConfig);
    socket.on('getPorts', getPorts);
    socket.on('config', updateConfig);
    socket.on('write', handleWrite);
    socket.on('shutdown', handleShutdown);
    socket.on('reboot', handleReboot);
    socket.on('getStartTime', handleGetStartTime);
    socket.on('renogySetBattType', handleSetBattType);
    socket.on('getRenogyLog', handleGetRenogyLog);
    socket.on('disconnect', () => {
        connectedSockets.delete(socket.id);
        socket.removeAllListeners();
        console.log(`Lost websocket connection (${connectedSockets.size} remain)`);
    });
});

connectSerialPort(config.get('serial.device'), config.get('serial.baud'));

if (configObject.tcpRepeater.enable) {
    connectTcpRepeater(configObject.tcpRepeater.port);
}

renogy.on('connected', () => {
    // this may be slightly optimistic, as the port gets opened if
    // it exists and is available, but that alone is not indicative
    // of a successful Renogy device connection
    console.log(`Renogy device connected on      ${configObject.renogySolar.port}`);
    renogy.startPolling();
    io.emit('renogyConnected');
});

renogy.on('disconnected', () => {
    console.log('Renogy device disconnected');
    io.emit('renogyDisconnected');
});

renogy.on('data', (raw) => {
    io.emit('renogyData', raw);
    renogyLog.update(renogy.data);

    // TODO: just make renogySolar.lowVoltageCutoff a boolean and use the modbus cutoff value to determine when to shut down

    if (renogy.data.battV && renogy.data.battV < configObject.renogySolar.lowVoltageCutoff + 0.1) {
        console.log('Renogy battery voltage below cutoff, shutting down!');
        exec('sudo shutdown now');
    }
});

renogyLog.on('data', (data) => {
    io.emit('renogyLog', data);
});

renogy.on('info', (raw) => {
    io.emit('renogyInfo', raw);
});

renogy.on('params', (raw) => {
    io.emit('renogyParams', raw);
});

renogy.on('battType', (battType) => {
    io.emit('renogyBattType', battType);
});

if (configObject.renogySolar.enable) {
    connectRenogy(configObject.renogySolar.port);
}

// never automatically start logging (to avoid disk space issues)
if (configObject.logging.enable) {
    configObject.logging.enable = false;
    fs.writeFileSync('config/default.json', JSON.stringify(configObject, null, 2));
}

server.listen(configObject.websocket.port, () => {
    console.log(`Websocket server started on     *:${configObject.websocket.port}`);
});

// handle SIGINT (Ctrl+C)
process.on('SIGINT', async () => {
    console.log('\nSIGINT (Ctrl-C), shutting down...');

    try {
        await new Promise<void>((resolve, reject) => {
            io.close((err) => {
                if (err) reject(err);
                else resolve();
            });
        });
        console.log('Socket.io (websocket) closed');
        ntrip.close();
        await tcpRepeater.close();
        await ubxSerial.close();
        await renogy.close();
        console.log('Shutdown complete, exiting');
        process.exit(0);
    } catch (error) {
        console.error('Error during shutdown:', error);
        process.exit(1);
    }
});

if (!process.env['VITE']) {
    const frontendFiles = process.cwd() + '/dist';
    app.use(express.static(frontendFiles));
    app.get('/*', (_, res) => {
        res.send(frontendFiles + '/index.html');
    });
    app.listen(configObject.webserver.port);
    console.log(`Express web server started on   *:${configObject.webserver.port}`);
}
