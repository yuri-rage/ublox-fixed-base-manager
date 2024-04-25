// some methods ported from Mission Planner source:
// https://github.com/ArduPilot/MissionPlanner/blob/master/ExtLibs/Utilities/ubx_m8p.cs

import { uBloxParser } from './ublox-parser';
import { uBloxGenerator } from './ublox-generator';
import { Rtcm3Parser } from './rtcm3-parser';
import { EventEmitter } from 'eventemitter3';
import { NmeaParser } from './nmea-parser';

const BUFFER_SIZE = 4096; // 4KB should be plenty even for large RTCM3 and RXM-RAWX messages

export class uBloxGps extends EventEmitter {
    private _pollMsg: number[][] = [];
    private _pollInterval = 30; // seconds
    private _pollTaskTimer: NodeJS.Timeout | null = null;
    private _buffer: Uint8Array = new Uint8Array(BUFFER_SIZE);
    private _bufferLength = 0;
    private _writeBuffer: Uint8Array = new Uint8Array(BUFFER_SIZE);
    private _writeBufferLength = 0;
    private _ubxGenerator = new uBloxGenerator();
    private _ubxParser = new uBloxParser();
    private _rtcm3Parser = new Rtcm3Parser();
    private _nmeaParser = new NmeaParser();

    constructor() {
        super();
        this._pollTaskTimer = setTimeout(() => {
            this.pollTask();
        }, 1000);
    }

    destroy() {
        if (this._pollTaskTimer) {
            clearTimeout(this._pollTaskTimer);
        }
    }

    public update(data: Uint8Array) {
        if (this._bufferLength + data.length > this._buffer.length) {
            this._bufferLength = 0;
            return;
        }
        this._buffer.set(data, this._bufferLength);
        this._bufferLength += data.length;
        this.parse();
    }

    public get generate() {
        return this._ubxGenerator;
    }

    private pollTask() {
        for (const msg of this._pollMsg) {
            this.write(this.generate.poll(msg[0], msg[1]));
        }
        this._pollTaskTimer = setTimeout(() => {
            this.pollTask();
        }, this._pollInterval * 1000);
    }

    // identical logic to update
    public write(data: Uint8Array) {
        if (this._writeBufferLength + data.length > this._writeBuffer.length) {
            this._writeBufferLength = 0;
            return;
        }
        this._writeBuffer.set(data, this._writeBufferLength);
        this._writeBufferLength += data.length;
        this.processWriteBuffer();
    }

    // essentially same logic as parse, but without processing the data
    private processWriteBuffer() {
        if (this._writeBufferLength < 8) {
            return;
        }

        let msgLen = 0;

        switch (this._writeBuffer[0]) {
            case 0xb5:
                msgLen = this._ubxParser.getUbxLength(this._writeBuffer, this._writeBufferLength);
                break;
            case 0xd3:
                msgLen = this._rtcm3Parser.getRtcm3Length(this._writeBuffer, this._writeBufferLength);
                break;
            case 0x21: // NMEA message start character '!'
            case 0x24: // NMEA message start character '$'
                msgLen = this._nmeaParser.getNmeaLength(this._writeBuffer, this._writeBufferLength);
                break;
            default:
                const s = Array.from(this._writeBuffer.slice(0, this._writeBufferLength), (byte) =>
                    byte.toString(16).padStart(2, '0'),
                ).join(' ');
                console.log('Write failed on msg: ', s);
                this._writeBufferLength = 0;
        }

        // if nothing was written, await more data
        if (msgLen === 0) {
            return;
        }

        if (msgLen > 0) {
            this.emit('write', this._writeBuffer.slice(0, msgLen));
            this._writeBuffer.copyWithin(0, msgLen);
            this._writeBufferLength -= msgLen;
        }

        if (this._writeBufferLength > 0) {
            this.processWriteBuffer();
        }
    }

    private parse() {
        if (this._bufferLength < 8) {
            return;
        }

        const oldBufferLength = this._bufferLength;

        switch (this._buffer[0]) {
            case 0xb5:
                this._bufferLength = this._ubxParser.parse(this._buffer, this._bufferLength);
                break;
            case 0xd3:
                this._bufferLength = this._rtcm3Parser.parse(this._buffer, this._bufferLength);
                break;
            case 0x21: // NMEA message start character '!'
            case 0x24: // NMEA message start character '$'
                this._bufferLength = this._nmeaParser.parse(this._buffer, this._bufferLength);
                break;
            default:
                const s = Array.from(this._buffer.slice(0, this._bufferLength), (byte) =>
                    byte.toString(16).padStart(2, '0'),
                ).join(' ');
                console.log('Parse failed on msg: ', s);
                this._bufferLength = 0;
        }

        // if nothing was parsed, await more data
        if (this._bufferLength === oldBufferLength) {
            return;
        }

        if (this._bufferLength > 0) {
            this.parse();
        }
    }

    public addPollMsg(msgClass: number, msgId: number) {
        this._pollMsg.push([msgClass, msgId]);
    }

    public delPollMsg(msgClass: number, msgId: number) {
        this._pollMsg = this._pollMsg.filter((msg) => msg[0] !== msgClass && msg[1] !== msgId);
    }

    public get pollInterval() {
        return this._pollInterval;
    }

    // seconds
    public set pollInterval(interval: number) {
        if (this._pollTaskTimer) {
            clearTimeout(this._pollTaskTimer);
        }
        this._pollInterval = interval;
        this.pollTask();
    }

    public get ubxParser() {
        return this._ubxParser;
    }

    public get rtcm3Parser() {
        return this._rtcm3Parser;
    }

    public get nmeaParser() {
        return this._nmeaParser;
    }
}
