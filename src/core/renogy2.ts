/*
 * Typescript + Object Oriented adaptation of renogy.js by sophienyaa
 * See: https://github.com/sophienyaa/NodeRenogy
 * Yuri - 2024
 */

import fs from 'fs';
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
    private _port: string = '';

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
            this._port = serialPort;
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

    public clearHistory() {
        // force port open for history clear using fs, since ModBusRTU does not support raw writes
        if (!this._port) {
            this.emit('historyCleared', false);
            return;
        }

        let fd;
        try {
            fd = fs.openSync(this._port, 'w');
        } catch (error) {
            console.error('Renogy: failed to open port for clearing history');
            this.emit('historyCleared', false);
            return;
        }

        const data = Buffer.from([0x01, 0x79, 0x00, 0x00, 0x00, 0x01, 0x5d, 0xc0]);
        fs.write(fd, data, 0, data.length, null, (err) => {
            if (err) {
                console.error('Renogy: failed to clear device history', err);
                this.emit('historyCleared', false);
            } else {
                this.emit('historyCleared', true);
            }

            fs.close(fd, (err) => {
                if (err) {
                    console.error('Renogy: failed to close port after clearing history');
                }
            });
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
