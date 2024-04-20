/*
 * Typescript + Object Oriented adaptation of renogy.js by sophienyaa
 * See: https://github.com/sophienyaa/NodeRenogy
 * Yuri - 2024
 */

import eventemitter3 from 'eventemitter3';
import ModbusRTU from 'modbus-serial';
import { RenogyData } from './renogy-data';

const DATA_START_REGISTER = 0x100;
const NUM_DATA_REGISTERS = 34;
const INFO_START_REGISTER = 0x00a;
const NUM_INFO_REGISTERS = 17;

export class Renogy extends eventemitter3 {
    private _modbusClient: ModbusRTU;
    private _data: RenogyData;
    private _intervalTimeout: NodeJS.Timeout | null = null;

    constructor() {
        super();
        this._modbusClient = new ModbusRTU();
        this._data = new RenogyData();
    }

    private _readController = async (startRegister: number, numRegisters: number) => {
        if (!this._modbusClient.isOpen) {
            return null;
        }
        try {
            const response = await this._modbusClient.readHoldingRegisters(startRegister, numRegisters);
            if (response && response.data) {
                return response.data;
            }
            return null;
        } catch (e) {
            throw e;
        }
    };

    public begin = async (serialPort: string, baudRate: number = 9600) => {
        try {
            if (this._modbusClient.isOpen) await this.close();

            this._modbusClient.setTimeout(500);
            await this._modbusClient.connectRTUBuffered(serialPort, { baudRate: baudRate });
            this.emit('connected');
        } catch (e) {
            console.log(`Renogy device failed to connect to ${serialPort}`);
        }
    };

    public updateData = async () => {
        try {
            const raw = await this._readController(DATA_START_REGISTER, NUM_DATA_REGISTERS);
            this._data.rawData = raw;
            this.emit('data', raw);
        } catch (e) {
            console.error('Renogy: failed to update controller data');
        }
    };

    public updateControllerInfo = async () => {
        try {
            const raw = await this._readController(INFO_START_REGISTER, NUM_INFO_REGISTERS);
            this._data.rawControllerInfo = raw;
            this.emit('info', raw);
        } catch (e) {
            console.error('Renogy: failed to update controller info');
        }
    };

    public get data() {
        return this._data;
    }

    private _update = () => {
        this.updateData();
        setTimeout(() => {
            this.updateControllerInfo();
        }, 200);
    };

    public startPolling(interval: number = 5000) {
        if (interval > 0) {
            this._update();
            this._intervalTimeout = setInterval(() => {
                this._update();
            }, interval);
        }
    }

    public stopPolling() {
        if (this._intervalTimeout) {
            clearInterval(this._intervalTimeout);
        }
    }

    public close(): Promise<void> {
        return new Promise((resolve, _reject) => {
            if (this._modbusClient.isOpen) {
                this.stopPolling();
                this._modbusClient.close(() => {
                    this.emit('disconnected');
                    resolve();
                });
            } else {
                resolve();
            }
        });
    }
}
