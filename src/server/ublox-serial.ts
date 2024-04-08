import { BetterPortEvent, BetterSerialPort } from 'better-port';
import { SerialPort } from 'serialport';
import { uBloxGps } from '@/core/ublox-gps';

type DataCallback = (data: any) => void;
type GenericCallback = () => void;

export class uBloxSerial {
    private serialPort: BetterSerialPort | null = null;
    private ubx = new uBloxGps();

    private _write(data: any) {
        if (this.serialPort) {
            this.serialPort.write(data);
        }
    }

    public get path() {
        return this.serialPort ? this.serialPort.path : '';
    }

    public get isConnected() {
        return this.serialPort ? this.serialPort.portOpen() : false;
    }

    public portList = async () => {
        const ports = await SerialPort.list();
        return ports;
    };

    public create(
        path: string,
        baud: number,
        onConnect: GenericCallback,
        onDisconnect: GenericCallback,
        onUbxMsg: DataCallback,
        onRtcm3Msg: DataCallback,
        onNmeaMsg: DataCallback,
    ) {
        if (this.serialPort && this.serialPort.portOpen()) {
            this.serialPort.closePort();
        }

        this.serialPort = new BetterSerialPort({
            path: path,
            baudRate: baud,
            keepOpen: false,
            autoOpen: false,
        });

        this.serialPort.on(BetterPortEvent.open, onConnect);

        this.serialPort.on(BetterPortEvent.close, onDisconnect);

        this.serialPort.on(BetterPortEvent.data, (data) => {
            this.ubx.update(data);
        });

        this.ubx.on('write', (data) => this._write(data));

        this.ubx.ubxParser.on('message', onUbxMsg);

        this.ubx.rtcm3Parser.on('message', onRtcm3Msg);

        this.ubx.nmeaParser.on('message', onNmeaMsg);

        this.serialPort.openPort();
    }

    public write(data: any) {
        this.ubx.write(data); // validates checksum(s) and emits a 'write' event
    }

    public close() {
        return new Promise<void>((resolve, reject) => {
            this.ubx.ubxParser.removeAllListeners();
            this.ubx.rtcm3Parser.removeAllListeners();
            this.ubx.removeAllListeners();

            if (this.serialPort) {
                this.serialPort.removeAllListeners();
                try {
                    this.serialPort.closePort();
                    resolve();
                } catch (error) {
                    console.error(`Error closing serial port: ${error}`);
                    reject(error);
                }
            } else {
                resolve();
            }
        });
    }

    public destroy() {
        this.close().then(() => {
            this.serialPort = null;
        });
    }
}
