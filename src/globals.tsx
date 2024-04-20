import { signal, effect, computed, Signal } from '@preact/signals-react';
import io from 'socket.io-client';
import { setProperty } from 'dot-prop';
import { uBloxGps } from '@/core/ublox-gps';
import { UBX } from '@/core/ublox-interface';
import { CoordinateTranslator } from '@/core/coordinate-translator';
import { RenogyData } from '@/core/renogy-data';

const originRoot = window.location.origin.split(':').slice(0, 2).join(':');

const NMEA_MSG_HISTORY = 100;

export const BAUD_RATES = [4800, 9600, 19200, 38400, 57600, 115200, 230400, 460800, 921600];

export const MIN_SVIN_TIME = 60; // default to 1 min svin time

// u-Blox GPS handling
export const socket = io(`${originRoot}:3001`);
export const ubx = new uBloxGps();
export const renogy = new RenogyData();

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
export const loggingStatus = signal(false);

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
    webserver: { port: 0 },
    websocket: { port: 0 },
    ntrip: { enable: false, host: '', port: 0, mountpoint: '', password: '' },
    tcpRepeater: { enable: false, port: 0 },
    savedLocation: { ecefXOrLat: 0, ecefYOrLon: 0, ecefZOrAlt: 0, fixedPosAcc: 0 },
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
export const connectedPort = signal('');

export function updateAppConfig(path: string, value: any) {
    const newConfig = { ...appConfig.value };
    try {
        setProperty(newConfig, path, value);
    } catch (e) {
        console.error(`Error updating config: ${path} not set to ${value}`, e);
    }
    appConfig.value = newConfig;
}

// set up listeners for socket.io and uBloxGps
effect(() => {
    function onData(value: any) {
        const data = new Uint8Array(value);
        ubx.update(data);
    }

    function onStartTime(data: ServiceStartTimes) {
        systemStartTime.value = data;
    }

    function updateConfig(config: any) {
        appConfig.value = config;
    }

    function updatePorts(ports: any) {
        serialPorts.value = ports;
    }

    function handleWrite(data: any) {
        socket.emit('write', data);
    }

    function onLogStatus(data: any) {
        loggingStatus.value = data as boolean;
    }

    function onUbxUpdate(count: number) {
        ubxMsgCount.value = count;
        ubxCfgPrtCount.value = ubx.ubxParser.ubxCfgPrt.count;
        ubxCfgMsgCount.value = ubx.ubxParser.ubxCfgMsg.count;
        ubxCfgTmode3Count.value = ubx.ubxParser.ubxCfgTmode3.count;
        ubxMonVerCount.value = ubx.ubxParser.ubxMonVer.count;
        ubxNavPvtCount.value = ubx.ubxParser.ubxNavPvt.count;
        ubxNavSvinCount.value = ubx.ubxParser.ubxNavSvin.count;
        ubxRxmRawxCount.value = ubx.ubxParser.ubxRxmRawx.count;
    }

    function onRtcm3Update(count: number) {
        rtcm3Count.value = count;
    }

    function onNmeaUpdate(count: number) {
        nmeaMsgCount.value = count;
    }

    function onNmeaMessage(message: Uint8Array) {
        nmeaMessages.value.push(String.fromCharCode.apply(null, Array.from(message)));
        if (nmeaMessages.value.length > NMEA_MSG_HISTORY) {
            nmeaMessages.value.shift();
        }
    }

    function onPortConnected(port: string) {
        connectedPort.value = port;
    }

    function onRenogyData(raw: number[]) {
        renogy.rawData = raw;
    }

    function onRenogyInfo(raw: number[]) {
        renogy.rawControllerInfo = raw;
        renogyUpdateCount.value++;
    }

    socket.on('startTime', onStartTime);
    socket.on('data', onData);
    socket.on('config', updateConfig);
    socket.on('ports', updatePorts);
    socket.on('portConnected', onPortConnected);
    socket.on('logStatus', onLogStatus);
    socket.on('renogyData', onRenogyData);
    socket.on('renogyInfo', onRenogyInfo);
    ubx.on('write', handleWrite);
    ubx.ubxParser.on('update', onUbxUpdate);
    ubx.rtcm3Parser.on('update', onRtcm3Update);
    ubx.nmeaParser.on('update', onNmeaUpdate);
    ubx.nmeaParser.on('message', onNmeaMessage);

    ubx.addPollMsg(UBX.CFG.CLASS, UBX.CFG.TMODE3);
    ubx.addPollMsg(UBX.MON.CLASS, UBX.MON.VER);

    requestPorts();
    requestConfig();
    requestLogStatus();

    return () => {
        socket.removeAllListeners();
        ubx.ubxParser.removeAllListeners();
        ubx.rtcm3Parser.removeAllListeners();
        ubx.removeAllListeners();
    };
});

export function requestStartTime() {
    socket.emit('getStartTime');
}

export function requestPorts() {
    socket.emit('getPorts');
}

export function requestConfig() {
    socket.emit('getConfig');
}

export function sendConfig() {
    socket.emit('config', appConfig.value);
}

export function requestLogStatus() {
    socket.emit('getLogStatus');
}

export function setLogStatus(requestedStatus: boolean) {
    socket.emit('setLogStatus', requestedStatus);
}
