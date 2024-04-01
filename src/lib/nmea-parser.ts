import { EventEmitter } from 'eventemitter3';

export class NmeaParser extends EventEmitter {
    private _messages = new Map();
    private _count = 0;

    public isNmea(data: Uint8Array | string): boolean {
        if (data.length < 8) {
            return false;
        }

        const message = (() => {
            if (data instanceof Uint8Array) {
                return String.fromCharCode.apply(null, Array.from(data));
            }
            return data;
        })();

        // Check for leading '$' or '!' and trailing checksum format '*HH'
        if (!message.trim().match(/^[$!].*\*[0-9A-Fa-f]{2}$/)) {
            return false;
        }

        const splitMessage = message.split('*');

        if (splitMessage.length !== 2) {
            return false;
        }

        const calculatedChecksum = splitMessage[0]
            .slice(1)
            .split('')
            .reduce((acc, char) => acc ^ char.charCodeAt(0), 0);
        const messageChecksum = parseInt(splitMessage[1], 16);

        // return validation check
        return calculatedChecksum === messageChecksum;
    }

    // parse first message from buffer
    // modify the buffer in place to remove the parsed message
    public parse(buffer: Uint8Array, length: number): number {
        const strBuffer = String.fromCharCode.apply(null, Array.from(buffer));
        let msgLength = strBuffer.indexOf('*') + 5;

        // no * found, so message is invalid or incomplete
        if (msgLength === 4) {
            return length;
        }

        const message = String.fromCharCode.apply(null, Array.from(buffer.slice(0, msgLength)));

        if (!this.isNmea(message)) {
            return length;
        }

        const messageParts = message.split('*')[0].split(',');
        this._count++;

        const key = messageParts[0].slice(1);
        if (!this._messages.has(key)) {
            this._messages.set(key, 0);
        }
        this._messages.set(key, this._messages.get(key) + 1);

        buffer.copyWithin(0, msgLength);
        this.emit('update', this._count);
        this.emit('message', message);
        return length - msgLength;
    }

    public get messages() {
        return this._messages;
    }

    public get count() {
        return this._count;
    }
}
