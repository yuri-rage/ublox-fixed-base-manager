/*
 * Typescript + Object Oriented adaptation of renogy.js by sophienyaa
 * See: https://github.com/sophienyaa/NodeRenogy
 * Yuri - 2024
 */

import eventemitter3 from 'eventemitter3';
import ModbusRTU from 'modbus-serial';
import {
    DATA_START_REGISTER,
    INFO_START_REGISTER,
    NUM_DATA_REGISTERS,
    NUM_INFO_REGISTERS,
    NUM_PARAM_REGISTERS,
    PARAM_START_REGISTER,
    BATT_TYPE,
    RenogyData,
} from './renogy-data';

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

    public updateChargerParams = async () => {
        try {
            const raw = await this._readController(PARAM_START_REGISTER, NUM_PARAM_REGISTERS);
            this._data.rawChargerParams = raw;
            this.emit('params', raw);
        } catch (e) {
            console.error('Renogy: failed to update charger parameters');
        }
    };

    public get data() {
        return this._data;
    }

    public updateAll = () => {
        this.updateData().then(() => {
            this.updateControllerInfo().then(() => {
                this.updateChargerParams();
            });
        });
    };

    public startPolling(interval: number = 5000) {
        if (interval > 0) {
            this.updateAll();
            this._intervalTimeout = setInterval(() => {
                this.updateAll();
            }, interval);
        }
    }

    public stopPolling() {
        if (this._intervalTimeout) {
            clearInterval(this._intervalTimeout);
        }
    }

    public async setBatteryType(battType: number) {
        if (battType < 0 || battType >= BATT_TYPE.length) {
            this.emit('battType', null);
            return;
        }
        this._modbusClient
            .writeRegister(0xe004, battType)
            .then(() => {
                this.emit('battType', battType);
            })
            .catch((_error) => {
                this.emit('battType', null);
            });
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
