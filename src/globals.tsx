import { signal, effect, computed, Signal } from '@preact/signals-react';
import io from 'socket.io-client';
import { setProperty } from 'dot-prop';
import { uBloxGps } from '@/core/ublox-gps';
import { UBX } from '@/core/ublox-interface';
import { CoordinateTranslator } from '@/core/coordinate-translator';
import { BATT_TYPE, RenogyData } from '@/core/renogy-data';
import { RenogyLogData } from '@/core/renogy-log';
import { toast } from 'sonner';

const NMEA_MSG_HISTORY = 100;

export const BAUD_RATES = [4800, 9600, 19200, 38400, 57600, 115200, 230400, 460800, 921600];

export const MIN_SVIN_TIME = 60; // default to 1 min svin time

// port 5173 is used during development (socket.io requires a separate port in that environment)
export const socket = io(window.location.origin.replace(':5173', ':8080'));

export const ubx = new uBloxGps();
export const renogy = new RenogyData();
export const renogyLog = signal<RenogyLogData | null>(null);

// signals
export const rtcm3Count = signal(0);
export const ubxMsgCount = signal(0);
export const nmeaMsgCount = signal(0);
export const nmeaMessages = signal(['']);
export const ubxCfgPrtCount = signal(0);
export const ubxCfgMsgCount = signal(0);
export const ubxCfgTmode3Count = signal(0);
export const ubxMonVerCount = signal(0);
export const ubxNavPvtCount = signal(0);
export const ubxNavSvinCount = signal(0);
export const ubxRxmRawxCount = signal(0);
export const renogyUpdateCount = signal(0);

export type ServiceStartTimes = {
    server: Date | null;
    os: Date | null;
    tcpRepeater: Date | null;
    ntrip: Date | null;
    logger: Date | null;
};

export const systemStartTime: Signal<ServiceStartTimes> = signal({
    server: null,
    os: null,
    tcpRepeater: null,
    ntrip: null,
    logger: null,
});

export const appConfig = signal({
    serial: { device: '', baud: 0 },
    ntrip: { enable: false, host: '', port: 0, mountpoint: '', password: '' },
    tcpRepeater: { enable: false, port: 0 },
    savedLocation: { ecefXOrLat: 0, ecefYOrLon: 0, ecefZOrAlt: 0, fixedPosAcc: 0 },
    logging: { enable: false },
    renogySolar: { enable: false, port: '', lowVoltageCutoff: 0 },
    advanced: {
        useMSM7: false,
        rate1005: { usb: 0, uart1: 0, uart2: 0 },
        rate1230: { usb: 0, uart1: 0, uart2: 0 },
        enableUbxNavSat: { usb: false, uart1: false, uart2: false },
    },
});

export const location = computed(() => {
    // @ts-ignore
    const _count = ubxCfgTmode3Count.value + ubxNavPvtCount.value + ubxNavSvinCount.value; // simply to trigger reactivity

    const useTmode3 = ubx.ubxParser.ubxNavPvt.fixType === 5;

    const useSvin = ubx.ubxParser.ubxNavSvin.meanXHP + ubx.ubxParser.ubxNavSvin.meanYHP > 0;

    let x = 0;
    let y = 0;
    let z = 0;
    if (useTmode3) {
        x = ubx.ubxParser.ubxCfgTmode3.ecefXOrLatHP;
        y = ubx.ubxParser.ubxCfgTmode3.ecefYOrLonHP;
        z = ubx.ubxParser.ubxCfgTmode3.ecefZOrAltHP;
    } else if (useSvin) {
        x = ubx.ubxParser.ubxNavSvin.meanXHP;
        y = ubx.ubxParser.ubxNavSvin.meanYHP;
        z = ubx.ubxParser.ubxNavSvin.meanZHP;
    } else {
        x = ubx.ubxParser.ubxNavPvt.lat;
        y = ubx.ubxParser.ubxNavPvt.lon;
        z = ubx.ubxParser.ubxNavPvt.height;
    }

    return new CoordinateTranslator(x.toString(), y.toString(), z.toString());
});

export const serialPorts = signal([]);

export const requestStartTime = () => {
    socket.emit('getStartTime');
};

export const requestPorts = () => {
    socket.emit('getPorts');
};

export const requestConfig = () => {
    socket.emit('getConfig');
};

export const sendConfig = () => {
    socket.emit('config', appConfig.value);
};

export const updateAppConfig = (path: string, value: any) => {
    const newConfig = { ...appConfig.value };
    try {
        setProperty(newConfig, path, value);
    } catch (e) {
        toast(`Error updating config: ${path} not set to ${value}`);
    }
    appConfig.value = newConfig;
};

// set up listeners for socket.io and uBloxGps
effect(() => {
    const onData = (value: any) => {
        const data = new Uint8Array(value);
        ubx.update(data);
    };

    const onStartTime = (data: ServiceStartTimes) => {
        systemStartTime.value = data;
    };

    const updateConfig = (config: any) => {
        appConfig.value = config;
    };

    const updatePorts = (ports: any) => {
        serialPorts.value = ports;
    };

    const handleWrite = (data: any) => {
        socket.emit('write', data);
    };

    const onUbxUpdate = (count: number) => {
        ubxMsgCount.value = count;
        ubxCfgPrtCount.value = ubx.ubxParser.ubxCfgPrt.count;
        ubxCfgMsgCount.value = ubx.ubxParser.ubxCfgMsg.count;
        ubxCfgTmode3Count.value = ubx.ubxParser.ubxCfgTmode3.count;
        ubxMonVerCount.value = ubx.ubxParser.ubxMonVer.count;
        ubxNavPvtCount.value = ubx.ubxParser.ubxNavPvt.count;
        ubxNavSvinCount.value = ubx.ubxParser.ubxNavSvin.count;
        ubxRxmRawxCount.value = ubx.ubxParser.ubxRxmRawx.count;
    };

    const onRtcm3Update = (count: number) => {
        rtcm3Count.value = count;
    };

    const onNmeaUpdate = (count: number) => {
        nmeaMsgCount.value = count;
    };

    const onNmeaMessage = (message: Uint8Array) => {
        nmeaMessages.value.push(String.fromCharCode.apply(null, Array.from(message)));
        if (nmeaMessages.value.length > NMEA_MSG_HISTORY) {
            nmeaMessages.value.shift();
        }
    };

    const onPortStatus = (data: boolean) => {
        if (data) {
            toast.success(`${appConfig.value.serial.device} opened for GPS communication`);
            return;
        }
        toast.error(`${appConfig.value.serial.device} closed, GPS communication stopped`);
    };

    const onTcpRepeaterStatus = (data: boolean) => {
        if (data) {
            toast.success(`TCP repeater listening on server port ${appConfig.value.tcpRepeater.port}`);
            return;
        }
        toast.error('TCP repeater stopped');
    };

    const onNtripStatus = (data: boolean) => {
        if (data) {
            toast.success(`NTRIP service started on mountpoint ${appConfig.value.ntrip.mountpoint}`);
            return;
        }
        toast.error('NTRIP service stopped');
    };

    const onNtripError = (text: string) => {
        toast.error(`NTRIP service error: ${text}`, {
            duration: 10000,
            closeButton: true,
        });
    };

    const onLogStatus = (data: boolean) => {
        if (data) {
            toast.success('Started logging GPS data');
            return;
        }
        toast.error('Stopped logging GPS data');
    };

    const onRenogyStatus = (data: boolean) => {
        if (data) {
            toast.success(`Renogy device connected on ${appConfig.value.renogySolar.port}`);
            return;
        }
        toast.error('Renogy device disconnected');
    };

    const onRenogyBattType = (battType: number | null) => {
        if (battType === null) {
            toast.error('Failed to set Renogy battery type');
            return;
        }
        toast.success(`Renogy battery type set to '${BATT_TYPE[battType]}'`);
    };

    const onRenogyData = (raw: number[]) => {
        renogy.rawData = raw;
    };

    const onRenogyInfo = (raw: number[]) => {
        renogy.rawControllerInfo = raw;
    };

    const onRenogyParams = (raw: number[]) => {
        renogy.rawChargerParams = raw;
        renogyUpdateCount.value++;
    };

    const onRenogyLog = (data: RenogyLogData) => {
        renogyLog.value = data;
    };

    const onRenogyHistoryCleared = (success: boolean) => {
        if (success) {
            toast.success('Renogy device history cleared');
            return;
        }
        toast.error('Failed to clear Renogy device history');
    };

    socket.on('startTime', onStartTime);
    socket.on('data', onData);
    socket.on('config', updateConfig);
    socket.on('ports', updatePorts);
    socket.on('portStatus', onPortStatus);
    socket.on('tcpRepeaterStatus', onTcpRepeaterStatus);
    socket.on('ntripStatus', onNtripStatus);
    socket.on('ntripError', onNtripError);
    socket.on('logStatus', onLogStatus);
    socket.on('renogyStatus', onRenogyStatus);
    socket.on('renogyBattType', onRenogyBattType);
    socket.on('renogyData', onRenogyData);
    socket.on('renogyInfo', onRenogyInfo);
    socket.on('renogyParams', onRenogyParams);
    socket.on('renogyLog', onRenogyLog);
    socket.on('renogyHistoryCleared', onRenogyHistoryCleared);
    ubx.on('write', handleWrite);
    ubx.ubxParser.on('update', onUbxUpdate);
    ubx.rtcm3Parser.on('update', onRtcm3Update);
    ubx.nmeaParser.on('update', onNmeaUpdate);
    ubx.nmeaParser.on('message', onNmeaMessage);

    ubx.addPollMsg(UBX.CFG.CLASS, UBX.CFG.TMODE3);
    ubx.addPollMsg(UBX.MON.CLASS, UBX.MON.VER);

    requestPorts();
    requestConfig();

    return () => {
        socket.removeAllListeners();
        ubx.ubxParser.removeAllListeners();
        ubx.rtcm3Parser.removeAllListeners();
        ubx.removeAllListeners();
    };
});

