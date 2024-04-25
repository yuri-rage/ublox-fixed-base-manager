import { getUbxChecksum } from './ublox-parser';
import { UBX } from './ublox-interface';

const packUint32 = (num: number) => {
    const buffer = new ArrayBuffer(4); // Assuming 4 bytes for a 32-bit integer
    const view = new DataView(buffer);
    view.setUint32(0, num, true); // Set the unsigned integer value
    return new Uint8Array(buffer);
};

const packInt32 = (num: number) => {
    const buffer = new ArrayBuffer(4); // Assuming 4 bytes for a 32-bit integer
    const view = new DataView(buffer);
    view.setInt32(0, num, true); // Set the integer value
    return new Uint8Array(buffer);
};

export const generateMessage = (msgClass: number, msgId: number, payload: any[] | ArrayLike<number>) => {
    const data = new Uint8Array(2 + 2 + 2 + payload.length + 2);
    data[0] = 0xb5;
    data[1] = 0x62;
    data[2] = msgClass;
    data[3] = msgId;
    data[4] = payload.length & 0xff;
    data[5] = (payload.length >> 8) & 0xff;

    data.set(payload, 6);

    const checksum = getUbxChecksum(data, data.length - 2);

    data[data.length - 2] = checksum[0];
    data[data.length - 1] = checksum[1];

    return data;
};

export class uBloxGenerator {
    public resetToDefaults() {
        const payload = new Uint8Array([
            0xff, 0xfb, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xff, 0xff, 0x00, 0x00, 0x17,
        ]);
        return generateMessage(UBX.CFG.CLASS, UBX.CFG.CFG, payload);
    }

    public revertToSaved() {
        const payload = new Uint8Array([
            0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xff, 0xff, 0x00, 0x00, 0x17,
        ]);
        return generateMessage(UBX.CFG.CLASS, UBX.CFG.CFG, payload);
    }

    public reboot(
        resetType: number = UBX.MASK.RESET_TYPE.HOT_START,
        resetMode: number = UBX.MASK.RESET_MODE.CONTROLLED_GNSS_ONLY,
    ) {
        const payload = new Uint8Array([resetType >> 8, resetType & 0xff, resetMode, 0x00]);
        return generateMessage(UBX.CFG.CLASS, UBX.CFG.RST, payload);
    }

    public saveConfig() {
        const payload = new Uint8Array([
            0x00, 0x00, 0x00, 0x00, 0xff, 0xff, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x17,
        ]);
        return generateMessage(UBX.CFG.CLASS, UBX.CFG.CFG, payload);
    }

    public pollPort(portId: number = UBX.MASK.PORTID.USB) {
        return generateMessage(UBX.CFG.CLASS, UBX.CFG.PRT, [portId]);
    }

    public pollMsgRate(msgClass: number, msgId: number) {
        return generateMessage(UBX.CFG.CLASS, UBX.CFG.MSG, [msgClass, msgId]);
    }

    public configPort(
        portId: number = UBX.MASK.PORTID.UART1,
        protocolIn: number = UBX.MASK.PROTO.UBX | UBX.MASK.PROTO.NMEA | UBX.MASK.PROTO.RTCM3,
        protocolOut: number = UBX.MASK.PROTO.UBX | UBX.MASK.PROTO.NMEA | UBX.MASK.PROTO.RTCM3,
        baud: number = 0,
    ) {
        // ! sending a non-zero baud rate to usb may cause issues
        if (portId === UBX.MASK.PORTID.USB) baud = 0;
        const payload = new Uint8Array(20);
        payload[0] = portId;
        payload[4] = 0xd0; // 8N1
        payload[5] = 0x08; // 8N1
        payload[8] = baud & 0xff;
        payload[9] = (baud >> 8) & 0xff;
        payload[10] = (baud >> 16) & 0xff;
        payload[11] = (baud >> 24) & 0xff;
        payload[12] = protocolIn;
        payload[14] = protocolOut;

        return generateMessage(UBX.CFG.CLASS, UBX.CFG.PRT, payload);
    }

    public configRate(rate: number = 1000) {
        const payload = new Uint8Array(6);
        payload[0] = rate & 0xff;
        payload[1] = (rate >> 8) & 0xff;
        payload[2] = 0x01; // nav rate
        payload[3] = 0x00;
        payload[4] = 0x01; // gps time
        payload[5] = 0x00;

        return generateMessage(UBX.CFG.CLASS, UBX.CFG.RATE, payload);
    }

    // send ubx-cfg-nav5 message to set stationary mode
    public configNavStationary(dgnssEnable = true) {
        const flag = dgnssEnable ? 0x3c : 0x00; // 0x3c = 60s, 0x00 = 0s
        const payload = new Uint8Array([
            0xff,
            0xff,
            0x02,
            0x03,
            0x00,
            0x00,
            0x00,
            0x00,
            0x10,
            0x27,
            0x00,
            0x00,
            0x0f,
            0x00,
            0xfa,
            0x00,
            0xfa,
            0x00,
            0x64,
            0x00,
            0x2c,
            0x01,
            0x00,
            flag,
            0x00,
            0x23,
            0x10,
            0x27,
            0x00,
            0x00,
            0x00,
            0x00,
            0x00,
            0x00,
            0x00,
            0x00,
        ]);

        // ! this is the original message used by Mission Planner
        // ! it includes a 0s DGNSS timeout, which precludes RTK fix states during SVIN
        // ! u-Blox default is a 60s timeout
        // const payload = new Uint8Array([
        //     0xff, 0xff, 0x02, 0x03, 0x00, 0x00, 0x00, 0x00, 0x10, 0x27, 0x00, 0x00, 0x0f, 0x00, 0xfa, 0x00,
        //     0xfa, 0x00, 0x64, 0x00, 0x2c, 0x01, 0x00, 0x00, 0x00, 0x23, 0x10, 0x27, 0x00, 0x00, 0x00, 0x00,
        //     0x00, 0x00, 0x00, 0x00,
        // ]);

        return generateMessage(UBX.CFG.CLASS, UBX.CFG.NAV5, payload);
    }

    public startSurveyIn(duration: number, minAccuracy: number) {
        const payload = new Uint8Array(40);
        payload[2] = 0x01; // Survey-in mode
        payload[24] = duration & 0xff;
        payload[25] = (duration >> 8) & 0xff;
        payload[26] = (duration >> 16) & 0xff;
        payload[27] = (duration >> 24) & 0xff;
        payload[28] = minAccuracy & 0xff;
        payload[29] = (minAccuracy >> 8) & 0xff;
        payload[30] = (minAccuracy >> 16) & 0xff;
        payload[31] = (minAccuracy >> 24) & 0xff;
        return generateMessage(UBX.CFG.CLASS, UBX.CFG.TMODE3, payload);
    }

    public configFixedModeECEF(ecefX: number, ecefY: number, ecefZ: number, fixedPosAcc: number) {
        const payload = new Uint8Array(40);
        const x = Math.trunc(ecefX * 1e2);
        const y = Math.trunc(ecefY * 1e2);
        const z = Math.trunc(ecefZ * 1e2);
        const xHP = Math.trunc((ecefX - x * 1e-2) * 1e4);
        const yHP = Math.trunc((ecefY - y * 1e-2) * 1e4);
        const zHP = Math.trunc((ecefZ - z * 1e-2) * 1e4);
        payload[2] = 0x02; // Fixed mode
        payload.set(packInt32(x), 4);
        payload.set(packInt32(y), 8);
        payload.set(packInt32(z), 12);
        payload[16] = xHP;
        payload[17] = yHP;
        payload[18] = zHP;
        payload.set(packUint32(Math.trunc(fixedPosAcc * 1e4)), 20);
        return generateMessage(UBX.CFG.CLASS, UBX.CFG.TMODE3, payload);
    }

    public disableTmode3() {
        return generateMessage(UBX.CFG.CLASS, UBX.CFG.TMODE3, new Uint8Array(40));
    }

    public configFixedModeLLA(lat: number, lng: number, alt: number, fixedPosAcc: number) {
        const payload = new Uint8Array(40);
        const iLat = Math.trunc(lat * 1e7);
        const iLng = Math.trunc(lng * 1e7);
        const iAlt = Math.trunc(alt * 1e2);
        const latHP = Math.trunc((lat - iLat * 1e-7) * 1e9);
        const lngHP = Math.trunc((lng - iLng * 1e-7) * 1e9);
        const altHP = Math.trunc((alt - iAlt * 1e-2) * 1e4);
        payload[2] = 0x02; // Fixed mode
        payload[3] = 0x01; // LLA
        payload.set(packInt32(iLat), 4);
        payload.set(packInt32(iLng), 8);
        payload.set(packInt32(iAlt), 12);
        payload[16] = latHP;
        payload[17] = lngHP;
        payload[18] = altHP;
        payload.set(packUint32(Math.trunc(fixedPosAcc * 1e4)), 20);
        return generateMessage(UBX.CFG.CLASS, UBX.CFG.TMODE3, payload);
    }

    public configMsgRate(
        msgClass: number,
        msgId: number,
        i2cRate: number,
        uart1Rate: number,
        uart2Rate: number,
        usbRate: number,
        spiRate: number,
    ) {
        const payload = new Uint8Array(8);
        payload[0] = msgClass;
        payload[1] = msgId;
        payload[2] = i2cRate;
        payload[3] = uart1Rate;
        payload[4] = uart2Rate;
        payload[5] = usbRate;
        payload[6] = spiRate;

        return generateMessage(UBX.CFG.CLASS, UBX.CFG.MSG, payload);
    }

    public turnOff(msgClass: number, msgId: number) {
        return this.configMsgRate(msgClass, msgId, 0, 0, 0, 0, 0);
    }

    public poll(msgClass: number, msgId: number) {
        return generateMessage(msgClass, msgId, []);
    }
}
