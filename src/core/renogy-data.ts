/*
 * Data class for Renogy Rover charge controller
 * Typescript + Object Oriented adaptation of renogy.js by sophienyaa
 * See: https://github.com/sophienyaa/NodeRenogy
 * Yuri - 2024
 */

const readUInt32BE = (low: number, high: number) => {
    return (high << 16) | low;
};

// reverse the bits of an integer byte value (0-255)
const mirror_byte = (n: number) => {
    const binaryString = n.toString(2).padStart(8, '0');
    return parseInt(binaryString.split('').reverse().join(''), 2);
};

export class RenogyData {
    private _data: number[] | null | undefined = null;
    private _controllerInfo: number[] | null | undefined = null;

    public set rawData(data: number[] | null | undefined) {
        this._data = data;
    }

    public set rawControllerInfo(data: number[] | null | undefined) {
        this._controllerInfo = data;
    }

    public get rawData() {
        return this._data;
    }

    public get rawControllerInfo() {
        return this._controllerInfo;
    }

    public get battCap() {
        return this._data ? this._data[0] : null;
    }
    public get battV() {
        return this._data ? this._data[1] * 0.1 : null;
    }
    public get battC() {
        return this._data ? this._data[2] * 0.01 : null;
    }
    public get controlT() {
        return this._data ? this._data[3] >> 8 : null;
    }
    public get battT() {
        return this._data ? this._data[3] & 0xff : null;
    }
    public get loadV() {
        return this._data ? this._data[4] * 0.1 : null;
    }
    public get loadC() {
        return this._data ? this._data[5] * 0.01 : null;
    }
    public get loadP() {
        return this._data ? this._data[6] : null;
    }
    public get solarV() {
        return this._data ? this._data[7] * 0.1 : null;
    }
    public get solarC() {
        return this._data ? this._data[8] * 0.01 : null;
    }
    public get solarP() {
        return this._data ? this._data[9] : null;
    }
    public get battVMinToday() {
        return this._data ? this._data[11] * 0.1 : null;
    }
    public get battVMaxToday() {
        return this._data ? this._data[12] * 0.1 : null;
    }
    public get chgCMaxToday() {
        return this._data ? this._data[13] * 0.01 : null;
    }
    public get dischgCMaxToday() {
        return this._data ? this._data[14] * 0.01 : null;
    }
    public get chgPMaxToday() {
        return this._data ? this._data[15] : null;
    }
    public get dischgPMaxToday() {
        return this._data ? this._data[16] : null;
    }
    public get chgAHToday() {
        return this._data ? this._data[17] : null;
    }
    public get dischgAHToday() {
        return this._data ? this._data[18] : null;
    }
    public get chgWHToday() {
        return this._data ? this._data[19] : null;
    }
    public get dischgWHToday() {
        return this._data ? this._data[20] : null;
    }
    public get uptime() {
        return this._data ? this._data[21] : null;
    }
    public get totalBattOverDischarges() {
        return this._data ? this._data[22] : null;
    }
    public get totalBattFullCharges() {
        return this._data ? this._data[23] : null;
    }
    public get totalChargeAH() {
        return this._data ? readUInt32BE(this._data[24], this._data[25]) : null;
    }
    public get totalDischargeAH() {
        return this._data ? readUInt32BE(this._data[26], this._data[27]) : null;
    }
    public get cumulativePowerGenerated() {
        return this._data ? readUInt32BE(this._data[28], this._data[29]) : null;
    }
    public get cumulativePowerConsumed() {
        return this._data ? readUInt32BE(this._data[30], this._data[31]) : null;
    }
    public get loadStatus() {
        return this._data ? mirror_byte(this._data[32] >> 8) : null;
    }
    public get chargingState() {
        return this._data ? this._data[32] & 0xff : null;
    }
    public get FaultCodes() {
        return this._data ? this._data[33] : null;
    }

    public get controllerV() {
        return this._controllerInfo ? this._controllerInfo[0] >> 8 : null;
    }
    public get controllerC() {
        return this._controllerInfo ? this._controllerInfo[0] & 0xff : null;
    }
    public get controllerDischgC() {
        return this._controllerInfo ? this._controllerInfo[1] >> 8 : null;
    }
    public get controllerType() {
        return this._controllerInfo
            ? (this._controllerInfo[1] & 0xff) == 0
                ? 'Controller'
                : 'Inverter'
            : null;
    }
    public get controllerModel() {
        let modelString = '';
        if (this._controllerInfo) {
            for (let i = 0; i <= 7; i++) {
                const hexString = this._controllerInfo[i + 2].toString(16);
                const matches = hexString.match(/.{1,2}/g);
                if (matches !== null) {
                    matches.forEach((x) => {
                        modelString += String.fromCharCode(parseInt(x, 16));
                    });
                }
            }
        }
        return modelString.replace(' ', '');
    }
    public get softwareVersion() {
        if (!this._controllerInfo) return null;
        return `${this._controllerInfo[10] & 0xff}.${(this._controllerInfo[11] >> 8) & 0xff}.${this._controllerInfo[11] & 0xff}`;
    }
    public get hardwareVersion() {
        if (!this._controllerInfo) return null;
        return `${this._controllerInfo[12] & 0xff}.${(this._controllerInfo[13] >> 8) & 0xff}.${this._controllerInfo[13] & 0xff}`;
    }
    public get serialNumber() {
        if (!this._controllerInfo) return null;
        return parseInt(
            `${this._controllerInfo[14].toString(16)}${this._controllerInfo[15].toString(16)}`,
            16,
        );
    }
    public get controllerAddress() {
        return this._controllerInfo ? this._controllerInfo[16] : null;
    }

    public printAllData() {
        console.log('--- Controller Data ---');
        console.log(`Battery Capacity: ${this.battCap ?? 'N/A'}`);
        console.log(`Battery Voltage: ${this.battV ?? 'N/A'}V`);
        console.log(`Battery Current: ${this.battC ?? 'N/A'}A`);
        console.log(`Controller Temperature: ${this.controlT ?? 'N/A'}°C`);
        console.log(`Battery Temperature: ${this.battT ?? 'N/A'}°C`);
        console.log(`Load Voltage: ${this.loadV ?? 'N/A'}V`);
        console.log(`Load Current: ${this.loadC ?? 'N/A'}A`);
        console.log(`Load Power: ${this.loadP ?? 'N/A'}W`);
        console.log(`Solar Voltage: ${this.solarV ?? 'N/A'}V`);
        console.log(`Solar Current: ${this.solarC ?? 'N/A'}A`);
        console.log(`Solar Power: ${this.solarP ?? 'N/A'}W`);
        console.log(`Battery Voltage Minimum Today: ${this.battVMinToday ?? 'N/A'}V`);
        console.log(`Battery Voltage Maximum Today: ${this.battVMaxToday ?? 'N/A'}V`);
        console.log(`Charge Current Max Today: ${this.chgCMaxToday ?? 'N/A'}A`);
        console.log(`Discharge Current Max Today: ${this.dischgCMaxToday ?? 'N/A'}A`);
        console.log(`Charge Power Max Today: ${this.chgPMaxToday ?? 'N/A'}W`);
        console.log(`Discharge Power Max Today: ${this.dischgPMaxToday ?? 'N/A'}W`);
        console.log(`Charge AH Today: ${this.chgAHToday ?? 'N/A'}Ah`);
        console.log(`Discharge AH Today: ${this.dischgAHToday ?? 'N/A'}Ah`);
        console.log(`Charge WH Today: ${this.chgWHToday ?? 'N/A'}Wh`);
        console.log(`Discharge WH Today: ${this.dischgWHToday ?? 'N/A'}Wh`);
        console.log(`System Uptime: ${this.uptime ?? 'N/A'} hours`);
        console.log(`Total Battery Over Discharges: ${this.totalBattOverDischarges ?? 'N/A'}`);
        console.log(`Total Battery Full Charges: ${this.totalBattFullCharges ?? 'N/A'}`);
        console.log(`Total Charge AH: ${this.totalChargeAH ?? 'N/A'}Ah`);
        console.log(`Total Discharge AH: ${this.totalDischargeAH ?? 'N/A'}Ah`);
        console.log(`Cumulative Power Generated: ${this.cumulativePowerGenerated ?? 'N/A'}Wh`);
        console.log(`Cumulative Power Consumed: ${this.cumulativePowerConsumed ?? 'N/A'}Wh`);
        console.log(`Load Status: ${this.loadStatus !== null ? this.loadStatus : 'N/A'}`);
        console.log(`Charging State: ${this.chargingState !== null ? this.chargingState : 'N/A'}`);
        console.log(`Fault Codes: ${this.FaultCodes ?? 'N/A'}`);
        console.log('--- Controller Info ---');
        console.log(`Controller Voltage: ${this.controllerV ?? 'N/A'}V`);
        console.log(`Controller Current: ${this.controllerC ?? 'N/A'}A`);
        console.log(`Controller Discharge Current: ${this.controllerDischgC ?? 'N/A'}A`);
        console.log(`Controller Type: ${this.controllerType ?? 'N/A'}`);
        console.log(`Controller Model: ${this.controllerModel ?? 'N/A'}`);
        console.log(`Software Version: ${this.softwareVersion ?? 'N/A'}`);
        console.log(`Hardware Version: ${this.hardwareVersion ?? 'N/A'}`);
        console.log(`Serial Number: ${this.serialNumber ?? 'N/A'}`);
        console.log(`Controller Address: ${this.controllerAddress ?? 'N/A'}`);
    }
}
