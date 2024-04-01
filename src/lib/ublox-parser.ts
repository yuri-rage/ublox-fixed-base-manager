import { EventEmitter } from 'eventemitter3';
import { UBX } from './ublox-interface';

// TODO: import UBX and use enums in place of fixed constants

export const UBX_GNSS_ID = ['G', 'S', 'E', 'B', 'I', 'Q', 'R', 'N'];

export const UBX_SIG_ID = [
    ['L1C/A', '', '', 'L2CL', 'L2CM', '', 'L5I', 'L5Q'], // GPS
    ['L1C/A'], // SBAS
    ['E1C', 'E1B', '', 'E5aI', 'E5aQ', 'E5bI', 'E5bQ'], // Galileo
    ['B1ID1', 'B1ID2', 'B2ID1', 'B2ID2', '', 'B1Cp', 'B1Cd', 'B2ap', 'B2ad'], // BeiDou
    [''], // IMES
    ['L1C/A', 'L1S', '', '', 'L2CM', 'L2CL', '', '', 'L5I', 'L5Q'], // QZSS
    ['L1OF', '', 'L2OF'], // GLONASS
    ['L5A'], // NavIC
];

function getString(data: Uint8Array, length: number): string {
    const nullTerminatedData = data.slice(0, length);
    const firstNullIndex = nullTerminatedData.findIndex((byte) => byte === 0);
    const trimmedData =
        firstNullIndex === -1 ? nullTerminatedData : nullTerminatedData.slice(0, firstNullIndex);
    const s = String.fromCharCode.apply(null, Array.from(trimmedData));
    data.set(data.subarray(length));
    return s;
}

function getUint(data: Uint8Array, length: number): number {
    let u = 0;
    for (let i = length - 1; i >= 0; i--) {
        u = (u << 8) | data[i];
    }
    data.set(data.subarray(length));
    return u;
}

function getInt8(data: Uint8Array): number {
    const i = new DataView(data.buffer).getInt8(0);
    data.set(data.subarray(1));
    return i;
}

function getInt32(data: Uint8Array): number {
    const sub = data.subarray(0, 4);
    const i = new DataView(sub.buffer).getInt32(0, true);
    data.set(data.subarray(4));
    return i;
}

function getFloat32(data: Uint8Array): number {
    const sub = data.subarray(0, 4);
    const f = new DataView(sub.buffer).getFloat32(0, true);
    data.set(data.subarray(4));
    return f;
}

function getFloat64(data: Uint8Array): number {
    const sub = data.subarray(0, 8);
    const f = new DataView(sub.buffer).getFloat64(0, true);
    data.set(data.subarray(8));
    return f;
}

export function getUbxChecksum(packet: Uint8Array | number[], size: number, offset = 2) {
    let a = 0x00;
    let b = 0x00;
    let i = offset;
    while (i < size) {
        a += packet[i++];
        b += a;
    }

    const checksum = new Uint8Array(2);

    checksum[0] = a & 0xff;
    checksum[1] = b & 0xff;

    return checksum;
}

class ubxMsg {
    private _msgClass: number;
    private _msgId: number;
    protected _count = 0;
    constructor(msgClass: number, msgId: number) {
        this._msgClass = msgClass;
        this._msgId = msgId;
    }

    public get msgClass() {
        return this._msgClass;
    }
    public get msgId() {
        return this._msgId;
    }

    public get msgPreamble() {
        return (this._msgClass << 8) | this._msgId;
    }

    public get count() {
        return this._count;
    }

    public update(_data: Uint8Array): void {}
}

export class ubxNavSvinMsg extends ubxMsg {
    private _version: number = 0;
    private _reserved0: number = 0;
    private _iTOW: number = 0;
    private _dur: number = 0;
    private _meanX: number = 0;
    private _meanY: number = 0;
    private _meanZ: number = 0;
    private _meanXHP: number = 0;
    private _meanYHP: number = 0;
    private _meanZHP: number = 0;
    private _reserved1: number = 0;
    private _meanAcc: number = 0;
    private _obs: number = 0;
    private _valid: number = 0;
    private _active: number = 0;
    private _reserved2: number = 0;

    constructor() {
        super(0x01, 0x3b);
    }

    public update(data: Uint8Array) {
        this._version = getUint(data, 1);
        this._reserved0 = getUint(data, 3);
        this._iTOW = getUint(data, 4) * 1e-3;
        this._dur = getUint(data, 4);
        this._meanX = getInt32(data) * 1e-2;
        this._meanY = getInt32(data) * 1e-2;
        this._meanZ = getInt32(data) * 1e-2;
        this._meanXHP = this._meanX + getInt8(data) * 1e-4;
        this._meanYHP = this._meanY + getInt8(data) * 1e-4;
        this._meanZHP = this._meanZ + getInt8(data) * 1e-4;
        this._reserved1 = getUint(data, 1);
        this._meanAcc = getUint(data, 4) * 1e-4;
        this._obs = getUint(data, 4);
        this._valid = getUint(data, 1);
        this._active = getUint(data, 1);
        this._reserved2 = getUint(data, 2);
        this._count++;
    }

    public get version() {
        return this._version;
    }
    public get reserved0() {
        return this._reserved0;
    }
    public get iTOW() {
        return this._iTOW;
    }
    public get dur() {
        return this._dur;
    }
    public get meanX() {
        return this._meanX;
    }
    public get meanY() {
        return this._meanY;
    }
    public get meanZ() {
        return this._meanZ;
    }
    public get meanXHP() {
        return this._meanXHP;
    }
    public get meanYHP() {
        return this._meanYHP;
    }
    public get meanZHP() {
        return this._meanZHP;
    }
    public get reserved1() {
        return this._reserved1;
    }
    public get meanAcc() {
        return this._meanAcc;
    }
    public get obs() {
        return this._obs;
    }
    public get valid() {
        return this._valid === 1;
    }
    public get active() {
        return this._active === 1;
    }
    public get reserved2() {
        return this._reserved2;
    }

    public toString() {
        return `Time Of Week: ${this._iTOW.toFixed(3).toString().padStart(12, ' ')}\nStatus: ${(this._active
            ? 'In progress'
            : 'Not started yet'
        ).padStart(18, ' ')}\nMean Position Valid: ${(this._valid ? 'Yes' : 'No').padStart(
            5,
            ' ',
        )}\nObservation Time: ${this._dur.toString().padStart(8, ' ')}\nPositions Used: ${this._obs
            .toString()
            .padStart(10, ' ')}\nMean ECEF X: ${this._meanXHP
            .toFixed(4)
            .toString()
            .padStart(13, ' ')}\nMean ECEF Y: ${this._meanYHP
            .toFixed(4)
            .toString()
            .padStart(13, ' ')}\nMean ECEF Z: ${this._meanZHP
            .toFixed(4)
            .toString()
            .padStart(13, ' ')}\nMean 3D StdDev: ${this._meanAcc.toFixed(4).toString().padStart(10, ' ')}`;
    }
}

export class ubxCfgTmode3Msg extends ubxMsg {
    private _version: number = 0;
    private _reserved0: number = 0;
    private _flags: number = 0;
    private _mode: number = 0;
    private _lla: number = 0;
    private _ecefXOrLat: number = 0;
    private _ecefYOrLon: number = 0;
    private _ecefZOrAlt: number = 0;
    private _ecefXOrLatHP: number = 0;
    private _ecefYOrLonHP: number = 0;
    private _ecefZOrAltHP: number = 0;
    private _reserved1: number = 0;
    private _fixedPosAcc: number = 0;
    private _svinMinDur: number = 0;
    private _svinAccLimit: number = 0;
    private _reserved2: number = 0;

    constructor() {
        super(0x06, 0x71);
    }

    public update(data: Uint8Array) {
        this._version = getUint(data, 1);
        this._reserved0 = getUint(data, 1);
        this._flags = getUint(data, 2);
        this._mode = this._flags & 0xff;
        this._lla = (this._flags & 0x100) >> 8;
        const coordScale = this._lla === 0 ? 1e-2 : 1e-7;
        this._ecefXOrLat = getInt32(data) * coordScale;
        this._ecefYOrLon = getInt32(data) * coordScale;
        this._ecefZOrAlt = getInt32(data) * 1e-2;
        const coordHPScale = this._lla === 0 ? 1e-4 : 1e-9;
        this._ecefXOrLatHP = this._ecefXOrLat + getInt8(data) * coordHPScale;
        this._ecefYOrLonHP = this._ecefYOrLon + getInt8(data) * coordHPScale;
        this._ecefZOrAltHP = this._ecefZOrAlt + getInt8(data) * 1e-4;
        this._reserved1 = getUint(data, 1);
        this._fixedPosAcc = getUint(data, 4) * 1e-4;
        this._svinMinDur = getUint(data, 4);
        this._svinAccLimit = getUint(data, 4) * 1e-4;
        this._reserved2 = getUint(data, 8);
        this._count++;
    }

    public get version() {
        return this._version;
    }
    public get reserved0() {
        return this._reserved0;
    }
    public get mode() {
        return this._mode;
    }
    public get lla() {
        return this._lla;
    }
    public get ecefXOrLat() {
        return this._ecefXOrLat;
    }
    public get ecefYOrLon() {
        return this._ecefYOrLon;
    }
    public get ecefZOrAlt() {
        return this._ecefZOrAlt;
    }
    public get ecefXOrLatHP() {
        return this._ecefXOrLatHP;
    }
    public get ecefYOrLonHP() {
        return this._ecefYOrLonHP;
    }
    public get ecefZOrAltHP() {
        return this._ecefZOrAltHP;
    }
    public get reserved1() {
        return this._reserved1;
    }
    public get fixedPosAcc() {
        return this._fixedPosAcc;
    }
    public get svinMinDur() {
        return this._svinMinDur;
    }
    public get svinAccLimit() {
        return this._svinAccLimit;
    }
    public get reserved2() {
        return this._reserved2;
    }

    public toString() {
        const decHP = this._lla === 0 ? 4 : 9;
        return `Mode: ${['Disabled', 'Survey-in', 'Fixed Mode'][this._mode].padStart(
            14,
            ' ',
        )}\nMin Obs Time: ${this._svinMinDur.toString().padStart(6, ' ')}\nReq Accuracy: ${this._svinAccLimit
            .toString()
            .padStart(6, ' ')}\nX: ${this._ecefXOrLatHP
            .toFixed(decHP)
            .toString()
            .padStart(17, ' ')}\nY: ${this._ecefYOrLonHP
            .toFixed(decHP)
            .toString()
            .padStart(17, ' ')}\nZ: ${this._ecefZOrAltHP
            .toFixed(4)
            .toString()
            .padStart(17, ' ')}\nAccuracy: ${this._fixedPosAcc.toFixed(4).toString().padStart(10, ' ')}`;
    }
}

export class ubxCfgPrt extends ubxMsg {
    private _portId: number = 0;
    private _reserved0: number = 0;
    private _txReady: number = 0;
    private _mode: number = 0;
    private _baudRate: number = 0;
    private _inProtoMask: number = 0;
    private _outProtoMask: number = 0;
    private _flags: number = 0;
    private _reserved1: number = 0;

    constructor() {
        super(0x06, 0x00);
    }

    public update(data: Uint8Array) {
        this._portId = getUint(data, 1);
        this._reserved0 = getUint(data, 1);
        this._txReady = getUint(data, 2);
        this._mode = getUint(data, 4);
        this._baudRate = getUint(data, 4);
        this._inProtoMask = getUint(data, 2);
        this._outProtoMask = getUint(data, 2);
        this._flags = getUint(data, 2);
        this._reserved1 = getUint(data, 2);
        this._count++;
    }

    public get portId() {
        return this._portId;
    }
    public get reserved0() {
        return this._reserved0;
    }
    public get txReady() {
        return this._txReady;
    }
    public get mode() {
        return this._mode;
    }
    public get baudRate() {
        return this._baudRate;
    }
    public get inProtoMask() {
        return this._inProtoMask;
    }
    public get inUbx() {
        return (this._inProtoMask & 0x01) === 0x01;
    }
    public get inNmea() {
        return (this._inProtoMask & 0x02) === 0x02;
    }
    public get inRtcm2() {
        return (this._inProtoMask & 0x04) === 0x04;
    }
    public get inRtcm3() {
        return (this._inProtoMask & 0x20) === 0x20;
    }
    public get outProtoMask() {
        return this._outProtoMask;
    }
    public get outUbx() {
        return (this._outProtoMask & 0x01) === 0x01;
    }
    public get outNmea() {
        return (this._outProtoMask & 0x02) === 0x02;
    }
    public get outRtcm2() {
        return (this._outProtoMask & 0x04) === 0x04;
    }
    public get outRtcm3() {
        return (this._outProtoMask & 0x20) === 0x20;
    }
    public get flags() {
        return this._flags;
    }
    public get reserved1() {
        return this._reserved1;
    }

    public toString() {
        return `Port: ${['I2C', 'UART1', 'UART2', 'USB', 'SPI'][this._portId]}\nBaud Rate: ${
            this._baudRate
        }\nInput Protocols : ${this.inUbx ? ' UBX ' : ''}${this.inNmea ? ' NMEA ' : ''}${
            this.inRtcm2 ? ' RTCM2 ' : ''
        }${this.inRtcm3 ? ' RTCM3 ' : ''}\nOutput Protocols: ${this.outUbx ? ' UBX ' : ''}${
            this.outNmea ? ' NMEA ' : ''
        }${this.outRtcm2 ? ' RTCM2 ' : ''}${this.outRtcm3 ? ' RTCM3 ' : ''}`;
    }
}

export class ubxCfgMsg extends ubxMsg {
    private _cfgMsgClass: number = 0;
    private _cfgMsgId: number = 0;
    private _rateI2C: number = 0;
    private _rateUART1: number = 0;
    private _rateUART2: number = 0;
    private _rateUSB: number = 0;
    private _rateSPI: number = 0;

    constructor() {
        super(UBX.CFG.CLASS, UBX.CFG.MSG);
    }

    public update(data: Uint8Array) {
        this._cfgMsgClass = getUint(data, 1);
        this._cfgMsgId = getUint(data, 1);
        this._rateI2C = getUint(data, 1);
        this._rateUART1 = getUint(data, 1);
        this._rateUART2 = getUint(data, 1);
        this._rateUSB = getUint(data, 1);
        this._rateSPI = getUint(data, 1);
        this._count++;
    }

    public get cfgMsgClass() {
        return this._cfgMsgClass;
    }
    public get cfgMsgId() {
        return this._cfgMsgId;
    }
    public get rateI2C() {
        return this._rateI2C;
    }
    public get rateUART1() {
        return this._rateUART1;
    }
    public get rateUART2() {
        return this._rateUART2;
    }
    public get rateUSB() {
        return this._rateUSB;
    }
    public get rateSPI() {
        return this._rateSPI;
    }

    public toString() {
        return `Message: 0x${this.cfgMsgClass.toString(16).padStart(2, '0')} 0x${this.cfgMsgId
            .toString(16)
            .padStart(2, '0')}\nI2C  : ${this._rateI2C}\nUART1: ${this._rateUART1}\nUART2: ${
            this._rateUART2
        }\nUSB  : ${this._rateUSB}\nSPI  : ${this._rateSPI}`;
    }
}

export class ubxMonVerMsg extends ubxMsg {
    private _swVersion: string = '';
    private _hwVersion: string = '';
    private _romBase: string = '';
    private _fwVer: string = '';
    private _protVer: string = '';
    private _mod: string = '';
    private _gnss: string = '';

    constructor() {
        super(0x0a, 0x04);
    }

    public update(data: Uint8Array) {
        this._swVersion = getString(data, 30);
        this._hwVersion = getString(data, 10);
        this._romBase = getString(data, 30);
        this._fwVer = getString(data, 30);
        this._protVer = getString(data, 30);
        this._mod = getString(data, 30);
        this._gnss = getString(data, 30).trim() + ';';
        this._gnss += getString(data, 30).trim();
        this._count++;
    }

    public get swVersion() {
        return this._swVersion;
    }
    public get hwVersion() {
        return this._hwVersion;
    }
    public get romBase() {
        return this._romBase;
    }
    public get fwVer() {
        return this._fwVer;
    }
    public get protVer() {
        return this._protVer;
    }
    public get mod() {
        return this._mod;
    }
    public get gnss() {
        return this._gnss;
    }

    public toString() {
        return `swVersion: ${this._swVersion}\nhwVersion: ${this._hwVersion}\nromBase  : ${this._romBase}\nfwVer    : ${this._fwVer}\nprotVer  : ${this._protVer}\nmod      : ${this._mod}\ngnss     : ${this._gnss}`;
    }
}

export class ubxMonHwMsg extends ubxMsg {
    private _pinSel: number = 0;
    private _pinBank: number = 0;
    private _pinDir: number = 0;
    private _pinVal: number = 0;
    private _noisePerMS: number = 0;
    private _agcCnt: number = 0;
    private _aStatus: number = 0;
    private _aPower: number = 0;
    private _flags: number = 0;
    private _reserved0: number = 0;
    private _usedMask: number = 0;
    private _VP: number = 0;
    private _cwSuppression: number = 0;
    private _reserved1: number = 0;
    private _pinIrq: number = 0;
    private _pullH: number = 0;
    private _pullL: number = 0;

    constructor() {
        super(0x0a, 0x09);
    }

    public update(data: Uint8Array) {
        this._pinSel = getUint(data, 4);
        this._pinBank = getUint(data, 4);
        this._pinDir = getUint(data, 4);
        this._pinVal = getUint(data, 4);
        this._noisePerMS = getUint(data, 2);
        this._agcCnt = getUint(data, 2) / 81.91;
        this._aStatus = getUint(data, 1);
        this._aPower = getUint(data, 1);
        this._flags = getUint(data, 1);
        this._reserved0 = getUint(data, 1);
        this._usedMask = getUint(data, 4);
        this._VP = getUint(data, 17);
        this._cwSuppression = getUint(data, 1) / 2.55;
        this._reserved1 = getUint(data, 1);
        this._pinIrq = getUint(data, 4);
        this._pullH = getUint(data, 4);
        this._pullL = getUint(data, 4);
        this._count++;
    }

    public get pinSel() {
        return this._pinSel;
    }
    public get pinBank() {
        return this._pinBank;
    }
    public get pinDir() {
        return this._pinDir;
    }
    public get pinVal() {
        return this._pinVal;
    }
    public get noisePerMS() {
        return this._noisePerMS;
    }
    public get agcCnt() {
        return this._agcCnt;
    }
    public get aStatus() {
        return this._aStatus;
    }
    public get aPower() {
        return this._aPower;
    }
    public get flags() {
        return this._flags;
    }
    public get reserved0() {
        return this._reserved0;
    }
    public get usedMask() {
        return this._usedMask;
    }
    public get VP() {
        return this._VP;
    }
    public get cwSuppression() {
        return this._cwSuppression;
    }
    public get reserved1() {
        return this._reserved1;
    }
    public get pinIrq() {
        return this._pinIrq;
    }
    public get pullH() {
        return this._pullH;
    }
    public get pullL() {
        return this._pullL;
    }
    public get rtcCalib() {
        return (this._flags & 0x01) === 0x01;
    }
    public get safeBoot() {
        return (this._flags & 0x02) === 0x02;
    }
    public get jammingState() {
        return (this._flags & 0x0c) >> 2;
    }
    public get xtalAbsent() {
        return (this._flags & 0x10) === 0x10;
    }

    public toString() {
        return `RTC Status: ${this.rtcCalib ? 'calibrated' : 'uncalibrated'}\nAntenna State Status: ${
            ['INIT', 'DONTKNOW', 'OK', 'SHORT', 'OPEN'][this.aStatus]
        }\nAntenna Power Status: ${['OFF', 'ON', 'DONTKNOW'][this.aPower]}\nsafeBoot Mode: ${
            this.safeBoot ? 'active' : 'inactive'
        }\nNoise Level: ${this.noisePerMS}\nAGC Monitor: ${this.agcCnt.toFixed(
            1,
        )}%\nCW Jamming Indicator: ${this.cwSuppression.toFixed(1)}%\nJamming Status: ${
            [
                'unknown or feature disabled or flag unavailable',
                'OK (no significant jamming)',
                'Warning (interference visible but fix OK)',
                'Critical (interference visible and no fix)',
            ][this.jammingState]
        }`;
    }
}

export class ubxMeas {
    private _prMes: number = 0;
    private _cpMes: number = 0;
    private _doMes: number = 0;
    private _gnssId: number = 0;
    private _svId: number = 0;
    private _sigId: number = 0;
    private _freqId: number = 0;
    private _locktime: number = 0;
    private _cno: number = 0;
    private _prStd: number = 0;
    private _cpStd: number = 0;
    private _doStd: number = 0;
    private _trkStat: number = 0;
    private _reserved1: number = 0;

    constructor(data: Uint8Array) {
        this._prMes = getFloat64(data);
        this._cpMes = getFloat64(data);
        this._doMes = getFloat32(data);
        this._gnssId = getUint(data, 1);
        this._svId = getUint(data, 1);
        this._sigId = getUint(data, 1);
        this._freqId = getUint(data, 1) - 7;
        this._locktime = getUint(data, 2);
        this._cno = getUint(data, 1);
        this._prStd = 0.01 * Math.pow(2, getUint(data, 1) & 0x0f);
        this._cpStd = 0.004 * (getUint(data, 1) & 0x0f);
        this._doStd = 0.002 * Math.pow(2, getUint(data, 1) & 0x0f);
        this._trkStat = getUint(data, 1);
        this._reserved1 = getUint(data, 1);
    }

    public get prMes() {
        return this._prMes;
    }
    public get cpMes() {
        return this._cpMes;
    }
    public get doMes() {
        return this._doMes;
    }
    public get gnssId() {
        return this._gnssId;
    }
    public get svId() {
        return this._svId;
    }
    public get sigId() {
        return this._sigId;
    }
    public get freqId() {
        return this._freqId;
    }
    public get locktime() {
        return this._locktime;
    }
    public get cno() {
        return this._cno;
    }
    public get prStd() {
        return this._prStd;
    }
    public get cpStd() {
        return this._cpStd;
    }
    public get doStd() {
        return this._doStd;
    }
    public get trkStat() {
        return this._trkStat;
    }
    public get reserved1() {
        return this._reserved1;
    }
    public get prValid() {
        return (this._trkStat & 0x01) === 0x01;
    }
    public get crValid() {
        return (this._trkStat & 0x02) === 0x02;
    }
    public get halfCyc() {
        return (this._trkStat & 0x04) === 0x04;
    }
    public get subHalfCyc() {
        return (this._trkStat & 0x08) === 0x08;
    }

    public toString() {
        return `${(UBX_GNSS_ID[this.gnssId] + this.svId.toString().padStart(2, '0')).padEnd(
            4,
            ' ',
        )} ${UBX_SIG_ID[this.gnssId][this.sigId].padEnd(5, ' ')} ${
            this.gnssId === 6 ? this.freqId.toString().padStart(5, ' ') : '     '
        } ${this.prMes.toFixed(2)} ${this.cpMes.toFixed(2).padStart(12, ' ')} ${this.doMes
            .toFixed(1)
            .padStart(7, ' ')} ${this.locktime.toString().padStart(8, ' ')} ${this.cno
            .toString()
            .padStart(3, ' ')} ${this.prStd.toFixed(2).padStart(5, ' ')} ${
            this.cpStd < 0.06 ? this.cpStd.toFixed(3) : '  -  '
        } ${this.doStd.toFixed(3).padStart(6, ' ')} ${
            this.prValid ? '   Y   ' : '   N   '
        } ${this.crValid ? '   Y   ' : '   N   '} ${this.halfCyc ? '   Y   ' : '   N   '}`;
    }
}

export class ubxRxmRawxMsg extends ubxMsg {
    private _rcvTow: number = 0;
    private _week: number = 0;
    private _leapS: number = 0;
    private _numMeas: number = 0;
    private _recStat: number = 0;
    private _version: number = 0;
    private _reserved0: number = 0;
    private _meas: Array<ubxMeas>;

    constructor() {
        super(0x02, 0x15);
        this._meas = [];
    }

    public update(data: Uint8Array) {
        this._rcvTow = getFloat64(data);
        this._week = getUint(data, 2);
        this._leapS = getInt8(data);
        this._numMeas = getUint(data, 1);
        this._recStat = getUint(data, 1);
        this._version = getUint(data, 1);
        this._reserved0 = getUint(data, 2);
        this._meas.length = 0;
        for (let i = 0; i < this._numMeas; i++) {
            const meas = new ubxMeas(data);
            this._meas.push(meas);
        }
        this._count++;
    }

    public get rcvTow() {
        return this._rcvTow;
    }
    public get week() {
        return this._week;
    }
    public get leapS() {
        return this._leapS;
    }
    public get numMeas() {
        return this._numMeas;
    }
    public get recStat() {
        return this._recStat;
    }
    public get leapSec() {
        return (this._recStat & 0x01) === 0x01;
    }
    public get clkReset() {
        return (this._recStat & 0x02) === 0x02;
    }
    public get version() {
        return this._version;
    }
    public get reserved0() {
        return this._reserved0;
    }
    public get meas() {
        return this._meas;
    }

    public toString() {
        let sMeas =
            'SV   SigId  Freq PseudoRange CarrierPhase Doppler LockTime SNR prStd cpStd  doStd prValid crValid halfCyc\n' +
            '---------------------------------------------------------------------------------------------------------';
        for (let i = 0; i < this._meas.length; i++) {
            sMeas += '\n' + this._meas[i].toString();
        }
        return `Time: ${this.week}:${this.rcvTow.toFixed(3)} (s)\nLeap seconds: ${this.leapS} (${
            this.leapSec ? 'VALID' : 'INVALID'
        })\nClock reset: ${this.clkReset ? 'YES' : 'NO'}\nnMeas: ${this.numMeas}\n${sMeas}`;
    }
}

export class ubxAckAckMsg extends ubxMsg {
    private _lastAckClass: number = 0;
    private _lastAckId: number = 0;

    constructor() {
        super(0x05, 0x01);
    }

    public update(data: Uint8Array) {
        this._lastAckClass = data[0];
        this._lastAckId = data[1];
        this._count++;
    }

    public get lastAckClass() {
        return this._lastAckClass;
    }
    public get lastAckId() {
        return this._lastAckId;
    }
}

export class ubxAckNakMsg extends ubxMsg {
    private _lastNakClass: number = 0;
    private _lastNakId: number = 0;

    constructor() {
        super(0x05, 0x00);
    }

    public update(data: Uint8Array) {
        this._lastNakClass = data[0];
        this._lastNakId = data[1];
        this._count++;
    }

    public get lastAckClass() {
        return this._lastNakClass;
    }
    public get lastAckId() {
        return this._lastNakId;
    }
}

export class uBloxParser extends EventEmitter {
    private _ubxCfgPrt: ubxCfgPrt = new ubxCfgPrt();
    private _ubxCfgMsg: ubxCfgMsg = new ubxCfgMsg();
    private _ubxNavSvin: ubxNavSvinMsg = new ubxNavSvinMsg();
    private _ubxCfgTmode3: ubxCfgTmode3Msg = new ubxCfgTmode3Msg();
    private _ubxMonVer: ubxMonVerMsg = new ubxMonVerMsg();
    private _ubxMonHw: ubxMonHwMsg = new ubxMonHwMsg();
    private _ubxRxmRawx: ubxRxmRawxMsg = new ubxRxmRawxMsg();
    private _ubxAckAck: ubxAckAckMsg = new ubxAckAckMsg();
    private _ubxAckNak: ubxAckNakMsg = new ubxAckNakMsg();
    private _unhandledMessages = new Map();
    private _count = 0;

    constructor() {
        super();
    }

    public isUbx(data: Uint8Array): boolean {
        if (data.length < 8) {
            return false;
        }

        if (data[0] !== 0xb5 || data[1] !== 0x62) {
            return false;
        }

        const msgLength = data[4] | (data[5] << 8);

        if (data.length !== msgLength + 8) {
            return false;
        }

        const checksum = getUbxChecksum(data, msgLength + 6);

        if (checksum[0] !== data[msgLength + 6] || checksum[1] !== data[msgLength + 7]) {
            return false;
        }

        return true;
    }

    // parse first message from buffer
    // modify the buffer in place to remove the parsed message
    public parse(buffer: Uint8Array, length: number): number {
        if (length < 8) {
            return length;
        }

        if (buffer[0] !== 0xb5 || buffer[1] !== 0x62) {
            return length;
        }

        const msgLength = buffer[4] | (buffer[5] << 8);

        if (length < msgLength + 8) {
            return length;
        }

        const msgClass = buffer[2];
        const msgId = buffer[3];
        const checksum = getUbxChecksum(buffer, msgLength + 6);

        if (checksum[0] !== buffer[msgLength + 6] || checksum[1] !== buffer[msgLength + 7]) {
            console.log(
                `UBX 0x${msgClass.toString(16).padStart(2, '0')} 0x${msgId
                    .toString(16)
                    .padStart(2, '0')}: bad checksum.`,
            );
            buffer.copyWithin(0, msgLength + 8);
            return length - (msgLength + 8);
        }

        const fullMsg = buffer.slice(0, msgLength + 8);
        const payload = buffer.slice(6, msgLength + 6);

        switch ((msgClass << 8) | msgId) {
            case 0x0501:
                this._ubxAckAck.update(payload);
                break;
            case 0x0500:
                this._ubxAckNak.update(payload);
                break;
            case this._ubxCfgMsg.msgPreamble:
                this._ubxCfgMsg.update(payload);
                // console.log(this._ubxCfgMsg.toString());
                break;
            case this._ubxCfgPrt.msgPreamble:
                this._ubxCfgPrt.update(payload);
                // console.log(this._ubxCfgPrt.toString());
                break;
            case this._ubxNavSvin.msgPreamble:
                this._ubxNavSvin.update(payload);
                // console.log(this._ubxNavSvin.toString());
                break;
            case this._ubxCfgTmode3.msgPreamble:
                this._ubxCfgTmode3.update(payload);
                // console.log(this._ubxCfgTmode3.toString());
                break;
            case this._ubxMonVer.msgPreamble:
                this._ubxMonVer.update(payload);
                // console.log(this._ubxMonVer.toString());
                break;
            case this._ubxMonHw.msgPreamble:
                this._ubxMonHw.update(payload);
                // console.log(this._ubxMonHw.toString());
                break;
            case this._ubxRxmRawx.msgPreamble:
                this._ubxRxmRawx.update(payload);
                // console.log(this._ubxRxmRawx.toString());
                break;
            default:
                const key = (msgClass << 8) | msgId;
                if (!this._unhandledMessages.has(key)) {
                    this._unhandledMessages.set(key, 0);
                }
                this._unhandledMessages.set(key, this._unhandledMessages.get(key) + 1);
                break;
        }
        this._count++;
        this.emit('update', this._count);
        this.emit('message', fullMsg);
        buffer.copyWithin(0, msgLength + 8);
        return length - (msgLength + 8);
    }

    public get ubxCfgPrt() {
        return this._ubxCfgPrt;
    }
    public get ubxCfgMsg() {
        return this._ubxCfgMsg;
    }
    public get ubxNavSvin() {
        return this._ubxNavSvin;
    }
    public get ubxCfgTmode3() {
        return this._ubxCfgTmode3;
    }
    public get ubxMonVer() {
        return this._ubxMonVer;
    }
    public get ubxMonHw() {
        return this._ubxMonHw;
    }
    public get ubxRxmRawx() {
        return this._ubxRxmRawx;
    }
    public get ubxAckAck() {
        return this._ubxAckAck;
    }
    public get ubxAckNak() {
        return this._ubxAckNak;
    }
    public get unhandledMessages() {
        return this._unhandledMessages;
    }
    public get count() {
        return this._count;
    }
}
