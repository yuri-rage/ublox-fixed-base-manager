// https://github.com/cturvey/RandomNinjaChef/blob/main/RTCM3Wrapper.c

import { EventEmitter } from 'eventemitter3';

// CRC should sum to zero if the message is valid
export const crc24Quick = (data: Uint8Array) => {
    let crc = 0;
    let size = data.length;
    let buffer = Array.from(data);

    const crcTable = [
        // Nibble lookup for Qualcomm CRC-24Q
        0x00000000, 0x01864cfb, 0x038ad50d, 0x020c99f6, 0x0793e6e1, 0x0615aa1a, 0x041933ec, 0x059f7f17,
        0x0fa18139, 0x0e27cdc2, 0x0c2b5434, 0x0dad18cf, 0x083267d8, 0x09b42b23, 0x0bb8b2d5, 0x0a3efe2e,
    ];

    while (size--) {
        const byte = buffer.shift() as number;
        crc ^= byte << 16; // Apply byte
        // Process 8-bits, 4 at a time, or 2 rounds
        crc = (crc << 4) ^ crcTable[(crc >> 20) & 0x0f];
        crc = (crc << 4) ^ crcTable[(crc >> 20) & 0x0f];
    }

    return crc & 0xffffff; // Mask to 24-bit, as above optimized for 32-bit
};

export class Rtcm3Parser extends EventEmitter {
    private _messages = new Map();
    private _count = 0;

    public getRtcm3Length(buffer: Uint8Array, length: number): number {
        if (length < 8) {
            return 0;
        }

        if (buffer[0] !== 0xd3) {
            return 0;
        }

        const msgLength = ((buffer[1] << 8) | buffer[2]) & 0x3ff;

        if (length < msgLength + 6) {
            return 0;
        }

        const msg = buffer.slice(0, msgLength + 6);

        const crcSum = crc24Quick(msg);
        if (crcSum !== 0) {
            return 0;
        }

        return msgLength + 6;
    }

    // parse first message from buffer
    // modify the buffer in place to remove the parsed message
    public parse(buffer: Uint8Array, length: number): number {
        if (length < 8) {
            return length;
        }

        if (buffer[0] !== 0xd3) {
            return length;
        }

        const msgLength = ((buffer[1] << 8) | buffer[2]) & 0x3ff;

        if (length < msgLength + 6) {
            return length;
        }

        const msg = buffer.slice(0, msgLength + 6);

        const crcSum = crc24Quick(msg);
        if (crcSum !== 0) {
            console.log('RTCM3: bad CRC.');
            buffer.copyWithin(0, msgLength + 6);
            return length - (msgLength + 6);
        }

        const msgType = (msg[3] << 4) | (msg[4] >> 4);

        this._count++;

        const key = msgType;
        if (!this._messages.has(key)) {
            this._messages.set(key, 0);
        }
        this._messages.set(key, this._messages.get(key) + 1);

        buffer.copyWithin(0, msgLength + 6);
        this.emit('update', this._count);
        this.emit('message', msg);
        return length - (msgLength + 6);
    }

    public get messages() {
        return this._messages;
    }

    public get count() {
        return this._count;
    }
}
