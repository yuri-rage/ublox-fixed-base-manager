import { uBloxGps } from './ublox-gps';
import { NMEA, RTCM_3X, UBX } from './ublox-interface';

// somewhat generic type to group uart data
export type uBloxPortOptions = {
    usb: boolean | number;
    uart1: boolean | number;
    uart2: boolean | number;
};

export const writeFixedBaseConfig = (
    ubx: uBloxGps,
    nmeaEnabled: uBloxPortOptions,
    enableUbxNavSat: uBloxPortOptions,
    rate1005: uBloxPortOptions,
    rate1230: uBloxPortOptions,
    useMSM7: boolean,
) => {
    // configure standard fixed base settings
    ubx.write(ubx.generate.configRate(1000));
    ubx.write(ubx.generate.configNavStationary());
    // completely turning off NMEA is probably not the right answer
    // GPS modules seem to act up if NMEA is disabled when other protocols are active
    for (const msgId of [
        // these messages are enabled by default for NMEA
        // they will be sent at 1Hz if NMEA is user enabled
        // otherwise, the rates are zeroed, but the protocol remains active
        NMEA.STANDARD.GGA,
        NMEA.STANDARD.GLL,
        NMEA.STANDARD.GSA,
        NMEA.STANDARD.GSV,
        NMEA.STANDARD.RMC,
        NMEA.STANDARD.VTG,
    ]) {
        ubx.write(
            ubx.generate.configMsgRate(
                NMEA.STANDARD.CLASS,
                msgId,
                0,
                nmeaEnabled.uart1 ? 1 : 0,
                nmeaEnabled.uart2 ? 1 : 0,
                nmeaEnabled.usb ? 1 : 0,
                0,
            ),
        );
    }
    for (const msgId of [
        // these messages are disabled by default for NMEA
        NMEA.STANDARD.GRS,
        NMEA.STANDARD.GST,
        NMEA.STANDARD.ZDA,
        NMEA.STANDARD.GBS,
        NMEA.STANDARD.DTM,
        NMEA.STANDARD.GNS,
        NMEA.STANDARD.VLW,
    ]) {
        ubx.write(ubx.generate.turnOff(NMEA.STANDARD.CLASS, msgId));
    }
    ubx.write(ubx.generate.configMsgRate(UBX.NAV.CLASS, UBX.NAV.SVIN, 0, 1, 1, 1, 0));
    ubx.write(ubx.generate.configMsgRate(UBX.NAV.CLASS, UBX.NAV.PVT, 0, 1, 1, 1, 0));
    ubx.write(
        ubx.generate.configMsgRate(
            RTCM_3X.CLASS,
            RTCM_3X.TYPE1005, // 1005 can be sent at a slower rate
            0,
            rate1005.uart1 as number,
            rate1005.uart2 as number,
            rate1005.usb as number,
            0,
        ),
    );
    ubx.write(
        ubx.generate.configMsgRate(
            RTCM_3X.CLASS,
            RTCM_3X.TYPE1074,
            0,
            useMSM7 ? 0 : 1,
            useMSM7 ? 0 : 1,
            useMSM7 ? 0 : 1,
            0,
        ),
    );
    ubx.write(
        ubx.generate.configMsgRate(
            RTCM_3X.CLASS,
            RTCM_3X.TYPE1084,
            0,
            useMSM7 ? 0 : 1,
            useMSM7 ? 0 : 1,
            useMSM7 ? 0 : 1,
            0,
        ),
    );
    ubx.write(
        ubx.generate.configMsgRate(
            RTCM_3X.CLASS,
            RTCM_3X.TYPE1094,
            0,
            useMSM7 ? 0 : 1,
            useMSM7 ? 0 : 1,
            useMSM7 ? 0 : 1,
            0,
        ),
    );
    ubx.write(
        ubx.generate.configMsgRate(
            RTCM_3X.CLASS,
            RTCM_3X.TYPE1124,
            0,
            useMSM7 ? 0 : 1,
            useMSM7 ? 0 : 1,
            useMSM7 ? 0 : 1,
            0,
        ),
    );
    ubx.write(
        ubx.generate.configMsgRate(
            RTCM_3X.CLASS,
            RTCM_3X.TYPE1077,
            0,
            useMSM7 ? 1 : 0,
            useMSM7 ? 1 : 0,
            useMSM7 ? 1 : 0,
            0,
        ),
    );
    ubx.write(
        ubx.generate.configMsgRate(
            RTCM_3X.CLASS,
            RTCM_3X.TYPE1087,
            0,
            useMSM7 ? 1 : 0,
            useMSM7 ? 1 : 0,
            useMSM7 ? 1 : 0,
            0,
        ),
    );
    ubx.write(
        ubx.generate.configMsgRate(
            RTCM_3X.CLASS,
            RTCM_3X.TYPE1097,
            0,
            useMSM7 ? 1 : 0,
            useMSM7 ? 1 : 0,
            useMSM7 ? 1 : 0,
            0,
        ),
    );
    ubx.write(
        ubx.generate.configMsgRate(
            RTCM_3X.CLASS,
            RTCM_3X.TYPE1127,
            0,
            useMSM7 ? 1 : 0,
            useMSM7 ? 1 : 0,
            useMSM7 ? 1 : 0,
            0,
        ),
    );
    ubx.write(
        ubx.generate.configMsgRate(
            RTCM_3X.CLASS,
            RTCM_3X.TYPE1230, // 1230 can be sent at a slower rate
            0,
            rate1230.uart1 as number,
            rate1230.uart2 as number,
            rate1230.usb as number,
            0,
        ),
    );
    ubx.write(ubx.generate.configMsgRate(UBX.NAV.CLASS, UBX.NAV.VELNED, 0, 1, 1, 1, 0));
    ubx.write(ubx.generate.configMsgRate(UBX.RXM.CLASS, UBX.RXM.RAWX, 0, 1, 1, 1, 0));
    ubx.write(ubx.generate.configMsgRate(UBX.RXM.CLASS, UBX.RXM.SFRBX, 0, 2, 2, 2, 0));
    ubx.write(ubx.generate.configMsgRate(UBX.MON.CLASS, UBX.MON.HW, 0, 2, 2, 2, 0));
    ubx.write(
        ubx.generate.configMsgRate(
            UBX.NAV.CLASS,
            UBX.NAV.SAT,
            0,
            enableUbxNavSat.uart1 ? 1 : 0,
            enableUbxNavSat.uart2 ? 1 : 0,
            enableUbxNavSat.usb ? 1 : 0,
            0,
        ),
    );
    ubx.addPollMsg(UBX.CFG.CLASS, UBX.CFG.TMODE3);
    ubx.addPollMsg(UBX.MON.CLASS, UBX.MON.VER);
    ubx.pollInterval = 30;
};
