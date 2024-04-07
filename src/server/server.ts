// https://www.youtube.com/watch?v=i7OWJwsU_WA -- tutorial on express/react app setup
import os from 'os';
import config from 'config';
import fs from 'fs';
import express from 'express';
export const app = express();
import http from 'http';
const server = http.createServer(app);
import { Server } from 'socket.io';
import cors from 'cors';
import TransparentTcpLink from './transparent-tcp-link';
import NtripTransport from './ntrip-transport';
import uBloxSerial from './ublox-serial';

const eth0Interface = os.networkInterfaces().eth0;
const wlan0Interface = os.networkInterfaces().wlan0;

const ethIP = eth0Interface ? eth0Interface[0].address : '127.0.0.1';
const wifiIP = wlan0Interface ? wlan0Interface[0].address : '127.0.0.1';

let configObject = config.util.toObject(); // mutable in case of config updates

const ubxSerial = new uBloxSerial();
const tcpRepeater = new TransparentTcpLink();
const ntrip = new NtripTransport();

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

function connectSerialPort(path: string, baud: number) {
    const onConnect = () => {
        console.log(`${ubxSerial.path} opened`);
        io.emit('portConnected', ubxSerial.path);
    };

    const onDisconnect = () => {
        console.log(`${ubxSerial.path} closed`);
        io.emit('portDisconnected', ubxSerial.path);
    };

    const onUbxMsg = (data: Uint8Array) => {
        
        if (connectedSockets.size > 0) {
            io.emit('data', data);
        }
        tcpRepeater.write(data);
    };

    const onRtcm3Msg = (data: Uint8Array) => {
        onUbxMsg(data); // forward to websocket and tcpRepeater
        ntrip.write(data);
    };

    const onNmeaMsg = (data: Uint8Array) => {
        onUbxMsg(data);
        // no need to forward to ntrip
    };

    ubxSerial.create(path, baud, onConnect, onDisconnect, onUbxMsg, onRtcm3Msg, onNmeaMsg);
}

function connectTcpRepeater(port: number) {
    if (tcpRepeater.isActive) {
        tcpRepeater.close();
    }
    tcpRepeater.create(port, (data) => {
        ubxSerial.write(data);
    });
}

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
            newConfig.serial.baud !== configObject.serial.baud
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
                tcpRepeater.close();
            }
        }

        if (
            newConfig.ntrip.enable !== configObject.ntrip.enable ||
            newConfig.ntrip.host !== configObject.ntrip.host ||
            newConfig.ntrip.port !== configObject.ntrip.port ||
            newConfig.ntrip.mountPoint !== configObject.ntrip.mountPoint ||
            newConfig.ntrip.password !== configObject.ntrip.password
        ) {
            if (newConfig.ntrip.enable) {
                ntrip.connect(
                    newConfig.ntrip.host,
                    newConfig.ntrip.port,
                    newConfig.ntrip.mountpoint,
                    newConfig.ntrip.password,
                );
            } else {
                ntrip.close();
            }
        }

        // save new config file
        configObject = { ...newConfig };
        fs.writeFileSync('config/default.json', JSON.stringify(configObject, null, 2));
    };

    const handleWrite = (data: Uint8Array) => {
        ubxSerial.write(data);
    };

    socket.on('getConfig', getConfig);
    socket.on('getPorts', getPorts);
    socket.on('config', updateConfig);
    socket.on('write', handleWrite);

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

if (configObject.ntrip.enable) {
    ntrip.connect(
        configObject.ntrip.host,
        configObject.ntrip.port,
        configObject.ntrip.mountpoint,
        configObject.ntrip.password,
    );
}

server.listen(configObject.websocket.port, () => {
    console.log(`Websocket server listening on     *:${configObject.websocket.port}`);
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
        await tcpRepeater.close();
        await ubxSerial.close();
        console.log('Shutdown complete, exiting');
        process.exit(0);
    } catch (error) {
        console.error('Error during shutdown:', error);
        process.exit(1);
    }
});

// TODO: make sure this works for production build (define PORT, for example)
if (!process.env['VITE']) {
    const frontendFiles = process.cwd() + '/dist';
    app.use(express.static(frontendFiles));
    app.get('/*', (_, res) => {
        res.send(frontendFiles + '/index.html');
    });
    app.listen(process.env['PORT']);
}
