/*
 * Data class for Renogy charge controllers (tested with Wanderer 10A)
 * Typescript + Object Oriented adaptation of renogy.js by sophienyaa
 * See: https://github.com/sophienyaa/NodeRenogy
 * Yuri - 2024
 */

// TODO: use fault bitmask correctly

// TODO: double check that a 24V battery doesn't throw the voltage numbers off
// renogy-rover-status.py shows (raw / 10 * 2 * 10) / 10 for 24 batteries

export const DATA_START_REGISTER = 0x0100;
export const NUM_DATA_REGISTERS = 34;
export const INFO_START_REGISTER = 0x000a;
export const NUM_INFO_REGISTERS = 17;

// ref: https://github.com/floreno/renogy-rover-modbus/blob/main/renogy-rover-status.py
export const PARAM_START_REGISTER = 0xe002;
export const NUM_PARAM_REGISTERS = 28;

export const BATT_TYPE = ['None', 'Flooded Cell', 'SLA/AGM', 'Gel', 'Lithium (LFP)', 'Custom'];
// charge stages from the manual: night, bulk, boost, float, equalize
export const CHARGE_STATE = [
    'Idle/Night',
    'Active',
    'MPPT',
    'Equalizing',
    'Boost Mode',
    'Float Mode',
    'Current Limiting',
];

export const FAULT_CODE = [
    'None',
    'Battery over discharge',
    'Battery over-voltage',
    'Battery under-voltage warning',
    'Load short circuit',
    'Load overpower or load over-current',
    'Controller temperature too high',
    'Ambient temperature too high',
    'Photovoltaic input overpower',
    'Photovoltaic input side short circuit',
    'Photovoltaic input side over-voltage',
    'Solar panel counter-current',
    'Solar panel working point over-voltage',
    'Solar panel reversed polarity',
    'Anti-reverse MOS short',
    'Circuit charge MOS short',
    'reserved',
];

export const LOAD_MODE = [
    'On: Sunrise / Off: Sunset',
    'On: Sunrise / Off: Sunset + 1hr',
    'On: Sunrise / Off: Sunset + 2hr',
    'On: Sunrise / Off: Sunset + 3hr',
    'On: Sunrise / Off: Sunset + 4hr',
    'On: Sunrise / Off: Sunset + 5hr',
    'On: Sunrise / Off: Sunset + 6hr',
    'On: Sunrise / Off: Sunset + 7hr',
    'On: Sunrise / Off: Sunset + 8hr',
    'On: Sunrise / Off: Sunset + 9hr',
    'On: Sunrise / Off: Sunset + 10hr',
    'On: Sunrise / Off: Sunset + 11hr',
    'On: Sunrise / Off: Sunset + 12hr',
    'On: Sunrise / Off: Sunset + 13hr',
    'On: Sunrise / Off: Sunset + 14hr',
    'Manual Mode',
    'Test Mode',
    '24 Hour Mode',
];

const readUint32BE = (high: number, low: number) => {
    return (high << 16) | low;
};

// reverse the bits of an integer value
const mirrorUint = (n: number) => {
    const binaryStr = n.toString(2);
    const size = Math.pow(2, Math.ceil(Math.log2(binaryStr.length)));
    return parseInt(binaryStr.padStart(size, '0').split('').reverse().join(''), 2);
};

export class RenogyData {
    private _data: number[] | null | undefined = null;
    private _controllerInfo: number[] | null | undefined = null;
    private _chargerParams: number[] | null | undefined = null;

    public set rawData(data: number[] | null | undefined) {
        this._data = data;
    }

    public set rawControllerInfo(data: number[] | null | undefined) {
        this._controllerInfo = data;
    }

    public set rawChargerParams(data: number[] | null | undefined) {
        this._chargerParams = data;
    }

    public get rawData() {
        return this._data;
    }

    public get rawControllerInfo() {
        return this._controllerInfo;
    }

    public get rawChargerParams() {
        return this._chargerParams;
    }

    // * Data *
    /**
     * Battery state of charge (integer %)
     * Register 0x0100
     */
    public get battSoC(): number | null {
        return this._data ? this._data[0x0100 - DATA_START_REGISTER] : null;
    }
    /**
     * Battery voltage (V)
     * Register 0x0101
     */
    public get battV() {
        return this._data ? this._data[0x0101 - DATA_START_REGISTER] / 10 : null;
    }
    /**
     * Battery current (A)
     * Register 0x0102
     */
    public get battC() {
        return this._data ? this._data[0x0102 - DATA_START_REGISTER] / 100 : null;
    }
    /**
     * Controller temperature (°C)
     * Register 0x0103 byte 1
     */
    public get controlT() {
        return this._data ? this._data[0x0103 - DATA_START_REGISTER] >> 8 : null;
    }
    /**
     * Battery temperature (°C)
     * Register 0x0103 byte 0
     */
    public get battT() {
        return this._data ? this._data[0x0103 - DATA_START_REGISTER] & 0xff : null;
    }
    /**
     * Load voltage (V)
     * Register 0x0104
     */
    public get loadV() {
        return this._data ? this._data[0x0104 - DATA_START_REGISTER] / 10 : null;
    }
    /**
     * Load current (A)
     * Register 0x0105
     */
    public get loadC() {
        return this._data ? this._data[0x0105 - DATA_START_REGISTER] / 100 : null;
    }
    /**
     * Load power (W)
     * Register 0x0106
     */
    public get loadP() {
        return this._data ? this._data[0x0106 - DATA_START_REGISTER] : null;
    }
    /**
     * Solar/charging voltage (V)
     * Register 0x0107
     */
    public get solarV() {
        return this._data ? this._data[0x0107 - DATA_START_REGISTER] / 10 : null;
    }
    /**
     * Solar/charging current (A)
     * Register 0x0108
     */
    public get solarC() {
        return this._data ? this._data[0x0108 - DATA_START_REGISTER] / 100 : null;
    }
    /**
     * Solar/charging power (W)
     * Register 0x0109
     */
    public get solarP() {
        return this._data ? this._data[0x0109 - DATA_START_REGISTER] : null;
    }
    // 0x010A is write-only (streetlight on/off)
    /**
     * Minimum battery voltage today (V)
     * Register 0x010B
     */
    public get battVMinToday() {
        return this._data ? this._data[0x010b - DATA_START_REGISTER] / 10 : null;
    }
    /**
     * Maximum battery voltage today (V)
     * Register 0x010C
     */
    public get battVMaxToday() {
        return this._data ? this._data[0x010c - DATA_START_REGISTER] / 10 : null;
    }
    /**
     * Maximum charge current today (A)
     * Register 0x010D
     */
    public get chgCMaxToday() {
        return this._data ? this._data[0x010d - DATA_START_REGISTER] / 100 : null;
    }
    /**
     * Maximum discharge current today (A)
     * Register 0x010E
     */
    public get dischgCMaxToday() {
        return this._data ? this._data[0x010e - DATA_START_REGISTER] / 100 : null;
    }
    /**
     * Maximum charge power today (W)
     * Register 0x010F
     */
    public get chgPMaxToday() {
        return this._data ? this._data[0x010f - DATA_START_REGISTER] : null;
    }
    /**
     * Maximum discharge power today (W)
     * Register 0x0110
     */
    public get dischgPMaxToday() {
        return this._data ? this._data[0x0110 - DATA_START_REGISTER] : null;
    }
    /**
     * Charge ampere-hours today (Ah)
     * Register 0x0111
     */
    public get chgAHToday() {
        return this._data ? this._data[0x0111 - DATA_START_REGISTER] : null;
    }
    /**
     * Discharge ampere-hours today (Ah)
     * Register 0x0112
     */
    public get dischgAHToday() {
        return this._data ? this._data[0x0112 - DATA_START_REGISTER] : null;
    }
    /**
     * Charge watt-hours today (Wh)
     * Register 0x0113
     */
    public get chgWHToday() {
        return this._data ? this._data[0x0113 - DATA_START_REGISTER] : null;
    }
    /**
     * Discharge watt-hours today (Wh)
     * Register 0x0114
     */
    public get dischgWHToday() {
        return this._data ? this._data[0x0114 - DATA_START_REGISTER] : null;
    }
    /**
     * System uptime (days)
     * Register 0x0115
     */
    public get uptime() {
        return this._data ? this._data[0x0115 - DATA_START_REGISTER] : null;
    }
    /**
     * Total battery over discharges
     * Register 0x0116
     */
    public get totalBattOverDischarges() {
        return this._data ? this._data[0x0116 - DATA_START_REGISTER] : null;
    }
    /**
     * Total battery full charges
     * Register 0x0117
     */
    public get totalBattFullCharges() {
        return this._data ? this._data[0x0117 - DATA_START_REGISTER] : null;
    }
    /**
     * Total charge ampere-hours (Ah)
     * Register 0x0118-0x0119
     */
    public get totalChargeAH() {
        return this._data
            ? readUint32BE(this._data[0x0118 - DATA_START_REGISTER], this._data[0x0119 - DATA_START_REGISTER])
            : null;
    }
    /**
     * Total discharge ampere-hours (Ah)
     * Register 0x011A-0x011B
     */
    public get totalDischargeAH() {
        return this._data
            ? readUint32BE(this._data[0x011a - DATA_START_REGISTER], this._data[0x011b - DATA_START_REGISTER])
            : null;
    }
    /**
     * Cumulative power generated (Wh)
     * Register 0x011C-0x011D
     */
    public get cumulativePowerGenerated() {
        return this._data
            ? readUint32BE(this._data[0x011c - DATA_START_REGISTER], this._data[0x011d - DATA_START_REGISTER])
            : null;
    }
    /**
     * Cumulative power consumption (Wh)
     * Register 0x011E-0x011F
     */
    public get cumulativePowerConsumed() {
        return this._data
            ? readUint32BE(this._data[0x011e - DATA_START_REGISTER], this._data[0x011f - DATA_START_REGISTER])
            : null;
    }
    /**
     * Load status (0=off, 1=on)
     * Register 0x0120 byte 1
     */
    public get loadStatus() {
        return this._data ? mirrorUint(this._data[0x0120 - DATA_START_REGISTER] >> 8) : null;
    }
    // 0x0120 byte 1 is streetlight brightness (unused here)
    /**
     * Charging state (see CHARGE_STATE)
     * Register 0x0120 byte 0
     */
    public get chargingState() {
        return this._data ? CHARGE_STATE[this._data[0x0120 - DATA_START_REGISTER] & 0xff] : null;
    }
    /**
     * Fault codes (see FAULT_CODE)
     * Register 0x0121
     */
    public get faultBitmask() {
        return this._data ? this._data[0x0121 - DATA_START_REGISTER] : null;
    }

    // * Controller Info *
    /**
     * Controller charge current rating (A)
     * Register 0x000A byte 1
     */
    public get controllerC() {
        return this._controllerInfo ? this._controllerInfo[0x000a - INFO_START_REGISTER] & 0xff : null;
    }
    /**
     * Controller voltage rating (V)
     * Register 0x000A byte 0
     */
    public get controllerV() {
        return this._controllerInfo ? this._controllerInfo[0x000a - INFO_START_REGISTER] >> 8 : null;
    }
    /**
     * Controller discharge current rating (A)
     * Register 0x000B byte 1
     */
    public get controllerDischgC() {
        return this._controllerInfo ? this._controllerInfo[0x000b - INFO_START_REGISTER] >> 8 : null;
    }
    /**
     * Controller type ('Controller' or 'Inverter')
     * Register 0x000B byte 0
     */
    public get controllerType() {
        return this._controllerInfo
            ? (this._controllerInfo[0x000b - INFO_START_REGISTER] & 0xff) == 0
                ? 'Controller'
                : 'Inverter'
            : null;
    }
    /**
     * Controller model
     * Register 0x000C-0x0013
     */
    public get controllerModel() {
        let modelString = '';
        const startReg = 0x000c - INFO_START_REGISTER;
        const endReg = 0x0013 - 0x000a;
        if (this._controllerInfo) {
            for (let i = startReg; i <= endReg; i++) {
                const hexString = this._controllerInfo[i].toString(16);
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
    /**
     * Controller software version
     * Register 0x0014-0x0015
     */
    public get softwareVersion() {
        if (!this._controllerInfo) return null;
        return `${this._controllerInfo[0x0014 - INFO_START_REGISTER] & 0xff}.${(this._controllerInfo[0x0015 - INFO_START_REGISTER] >> 8) & 0xff}.${this._controllerInfo[0x0015 - INFO_START_REGISTER] & 0xff}`;
    }
    /**
     * Controller hardware version
     * Register 0x0016-0x0017
     */
    public get hardwareVersion() {
        if (!this._controllerInfo) return null;
        return `${this._controllerInfo[0x0016 - INFO_START_REGISTER] & 0xff}.${(this._controllerInfo[0x0017 - INFO_START_REGISTER] >> 8) & 0xff}.${this._controllerInfo[0x0017 - INFO_START_REGISTER] & 0xff}`;
    }
    /**
     * Controller serial number
     * Register 0x0018-0x0019
     */
    public get serialNumber() {
        if (!this._controllerInfo) return null;
        return parseInt(
            `${this._controllerInfo[0x0018 - INFO_START_REGISTER].toString(16)}${this._controllerInfo[0x0019 - INFO_START_REGISTER].toString(16)}`,
            16,
        );
    }
    /**
     * Controller address
     * Register 0x001A
     */
    public get controllerAddress() {
        return this._controllerInfo ? this._controllerInfo[0x001a - INFO_START_REGISTER] : null;
    }

    // * Charger Params *
    // ref: https://github.com/floreno/renogy-rover-modbus/blob/main/renogy-rover-status.py
    /**
     * Battery capacity (Ah)
     * Register 0xE002
     */
    public get battCapacity() {
        return this._chargerParams ? this._chargerParams[0xe002 - PARAM_START_REGISTER] / 10 : null;
    }
    /**
     * System voltage setting (V)
     * Register 0xE003 byte 1
     */
    public get systemVoltage() {
        return this._chargerParams ? this._chargerParams[0xe003 - PARAM_START_REGISTER] >> 8 : null;
    }
    /**
     * Voltage recognition setting ('Automatic' or 'Other')
     * Register 0xE003 byte 0
     */
    public get voltageRecognition() {
        const raw = this._chargerParams ? this._chargerParams[0xe003 - PARAM_START_REGISTER] & 0xff : null;
        return raw ? (raw === 0xff ? 'Automatic' : `Other 0x${raw.toString(16)}`) : null;
    }
    /**
     * Battery type (see BATT_TYPE)
     * Register 0xE004
     */
    public get battType() {
        return this._chargerParams ? BATT_TYPE[this._chargerParams[0xe004 - PARAM_START_REGISTER]] : null;
    }
    /**
     * Overvoltage threshold (V)
     * Register 0xE005
     */
    public get overvoltThreshold() {
        return this._chargerParams ? this._chargerParams[0xe005 - PARAM_START_REGISTER] / 10 : null;
    }
    /**
     * Charge limit (A)
     * Register 0xE006
     */
    public get chargeLimit() {
        return this._chargerParams ? this._chargerParams[0xe006 - PARAM_START_REGISTER] / 10 : null;
    }
    /**
     * Equalization voltage (V)
     * Register 0xE007
     */
    public get equalizationVoltage() {
        return this._chargerParams ? this._chargerParams[0xe007 - PARAM_START_REGISTER] / 10 : null;
    }
    /**
     * Boost voltage (V)
     * Register 0xE008
     */
    public get boostVoltage() {
        return this._chargerParams ? this._chargerParams[0xe008 - PARAM_START_REGISTER] / 10 : null;
    }
    /**
     * Float voltage (V)
     * Register 0xE009
     */
    public get floatVoltage() {
        return this._chargerParams ? this._chargerParams[0xe009 - PARAM_START_REGISTER] / 10 : null;
    }
    /**
     * Boost recovery voltage (V)
     * Register 0xE00A
     */
    public get boostRecoveryVoltage() {
        return this._chargerParams ? this._chargerParams[0xe00a - PARAM_START_REGISTER] / 10 : null;
    }
    /**
     * Over discharge recovery voltage (V)
     * Register 0xE00B
     */
    public get overDischargeRecoveryVoltage() {
        return this._chargerParams ? this._chargerParams[0xe00b - PARAM_START_REGISTER] / 10 : null;
    }
    /**
     * Undervoltage warning level (V)
     * Register 0xE00C
     */
    public get undervoltageWarningLevel() {
        return this._chargerParams ? this._chargerParams[0xe00c - PARAM_START_REGISTER] / 10 : null;
    }
    /**
     * Over discharge voltage (V)
     * Register 0xE00D
     */
    public get overDischargeVoltage() {
        return this._chargerParams ? this._chargerParams[0xe00d - PARAM_START_REGISTER] / 10 : null;
    }
    /**
     * Discharging limit voltage (V)
     * Register 0xE00E
     */
    public get dischargingLimitVoltage() {
        return this._chargerParams ? this._chargerParams[0xe00e - PARAM_START_REGISTER] / 10 : null;
    }
    /**
     * End of charge state of charge (SOC) (%)
     * Register 0xE00F byte 1
     */
    public get endOfChargeSOC() {
        return this._chargerParams ? this._chargerParams[0xe00f - PARAM_START_REGISTER] >> 8 : null;
    }
    /**
     * End of discharge state of charge (SOC) (%)
     * Register 0xE00F byte 0
     */
    public get endOfDischargeSOC() {
        return this._chargerParams ? this._chargerParams[0xe00f - PARAM_START_REGISTER] & 0xff : null;
    }
    /**
     * Over discharge time delay (seconds)
     * Register 0xE010
     */
    public get overDischargeTimeDelay() {
        return this._chargerParams ? this._chargerParams[0xe010 - PARAM_START_REGISTER] : null;
    }
    /**
     * Equalization time (minutes)
     * Register 0xE011
     */
    public get equalizationTime() {
        return this._chargerParams ? this._chargerParams[0xe011 - PARAM_START_REGISTER] : null;
    }
    /**
     * Boost time (minutes)
     * Register 0xE012
     */
    public get boostTime() {
        return this._chargerParams ? this._chargerParams[0xe012 - PARAM_START_REGISTER] : null;
    }
    /**
     * Equalization charging interval (days)
     * Register 0xE013
     */
    public get equalizationChargingInterval() {
        return this._chargerParams ? this._chargerParams[0xe013 - PARAM_START_REGISTER] : null;
    }
    /**
     * Battery temperature compensation coefficient (mV/°C/2V)
     * Register 0xE014
     */
    public get batteryTemperatureCompensationCoefficient() {
        return this._chargerParams ? this._chargerParams[0xe014 - PARAM_START_REGISTER] : null;
    }
    /**
     * Stage 1 duration (hours)
     * Register 0xE015
     */
    public get stageDuration1() {
        return this._chargerParams ? this._chargerParams[0xe015 - PARAM_START_REGISTER] : null;
    }
    /**
     * Stage 1 power (%)
     * Register 0xE016
     */
    public get stagePower1() {
        return this._chargerParams ? this._chargerParams[0xe016 - PARAM_START_REGISTER] : null;
    }
    /**
     * Stage 2 duration (hours)
     * Register 0xE017
     */
    public get stageDuration2() {
        return this._chargerParams ? this._chargerParams[0xe017 - PARAM_START_REGISTER] : null;
    }
    /**
     * Stage 2 power (%)
     * Register 0xE018
     */
    public get stagePower2() {
        return this._chargerParams ? this._chargerParams[0xe018 - PARAM_START_REGISTER] : null;
    }
    /**
     * Stage 3 duration (hours)
     * Register 0xE019
     */
    public get stageDuration3() {
        return this._chargerParams ? this._chargerParams[0xe019 - PARAM_START_REGISTER] : null;
    }
    /**
     * Stage 3 power (%)
     * Register 0xE01A
     */
    public get stagePower3() {
        return this._chargerParams ? this._chargerParams[0xe01a - PARAM_START_REGISTER] : null;
    }
    /**
     * Stage 4 duration (hours)
     * Register 0xE01B
     */
    public get stageDuration4() {
        return this._chargerParams ? this._chargerParams[0xe01b - PARAM_START_REGISTER] : null;
    }
    /**
     * Stage 4 power (%)
     * Register 0xE01C
     */
    public get stagePower4() {
        return this._chargerParams ? this._chargerParams[0xe01c - PARAM_START_REGISTER] : null;
    }
    /**
     * Load mode (see LOAD_MODE)
     * Register 0xE01D
     */
    public get loadMode() {
        return this._chargerParams ? LOAD_MODE[this._chargerParams[0xe01d - PARAM_START_REGISTER]] : null;
    }

    public printAllData() {
        console.log('--- Controller Data ---');
        console.log(`Battery Capacity: ${this.battSoC ?? 'N/A'}`);
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
        console.log(`System Uptime: ${this.uptime ?? 'N/A'} days`);
        console.log(`Total Battery Over Discharges: ${this.totalBattOverDischarges ?? 'N/A'}`);
        console.log(`Total Battery Full Charges: ${this.totalBattFullCharges ?? 'N/A'}`);
        console.log(`Total Charge AH: ${this.totalChargeAH ?? 'N/A'}Ah`);
        console.log(`Total Discharge AH: ${this.totalDischargeAH ?? 'N/A'}Ah`);
        console.log(`Cumulative Power Generated: ${this.cumulativePowerGenerated ?? 'N/A'}Wh`);
        console.log(`Cumulative Power Consumed: ${this.cumulativePowerConsumed ?? 'N/A'}Wh`);
        console.log(`Load Status: ${this.loadStatus ?? 'N/A'}`);
        console.log(`Charging State: ${this.chargingState ?? 'N/A'}`);
        console.log(`Fault Codes: 0x${this.faultBitmask?.toString(16).padStart(16, '0') ?? 'N/A'}`);
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
        console.log('--- Charger Params ---');
        console.log(`Battery Capacity: ${this.battCapacity ?? 'N/A'}Ah`);
        console.log(`System Voltage: ${this.systemVoltage ?? 'N/A'}V`);
        console.log(`Recognized Voltage: ${this.voltageRecognition ?? 'N/A'}`);
        console.log(`Battery Type: ${this.battType ?? 'N/A'}`);
        console.log(`Overvoltage Threshold: ${this.overvoltThreshold ?? 'N/A'}V`);
        console.log(`Charge Limit: ${this.chargeLimit ?? 'N/A'}`);
        console.log(`Equalization Voltage: ${this.equalizationVoltage ?? 'N/A'}V`);
        console.log(`Boost Voltage: ${this.boostVoltage ?? 'N/A'}V`);
        console.log(`Float Voltage: ${this.floatVoltage ?? 'N/A'}V`);
        console.log(`Boost Recovery Voltage: ${this.boostRecoveryVoltage ?? 'N/A'}V`);
        console.log(`Over Discharge Recovery Voltage: ${this.overDischargeRecoveryVoltage ?? 'N/A'}V`);
        console.log(`Undervoltage Warning Level: ${this.undervoltageWarningLevel ?? 'N/A'}V`);
        console.log(`Over Discharge Voltage: ${this.overDischargeVoltage ?? 'N/A'}V`);
        console.log(`Discharging Limit Voltage: ${this.dischargingLimitVoltage ?? 'N/A'}V`);
        console.log(`End of Charge SOC: ${this.endOfChargeSOC ?? 'N/A'}%`);
        console.log(`End of Discharge SOC: ${this.endOfDischargeSOC ?? 'N/A'}%`);
        console.log(`Over Discharge Time Delay: ${this.overDischargeTimeDelay ?? 'N/A'} secs`);
        console.log(`Equalization Time: ${this.equalizationTime ?? 'N/A'} mins`);
        console.log(`Boost Time: ${this.boostTime ?? 'N/A'} mins`);
        console.log(`Equalization Charging Interval: ${this.equalizationChargingInterval ?? 'N/A'} days`);
        console.log(
            `Battery Temperature Compensation Coefficient: ${this.batteryTemperatureCompensationCoefficient ?? 'N/A'}`,
        );
        console.log(`Stage 1 Duration: ${this.stageDuration1 ?? 'N/A'} hours`);
        console.log(`Stage 1 Power: ${this.stagePower1 ?? 'N/A'}%`);
        console.log(`Stage 2 Duration: ${this.stageDuration2 ?? 'N/A'} hours`);
        console.log(`Stage 2 Power: ${this.stagePower2 ?? 'N/A'}%`);
        console.log(`Stage 3 Duration: ${this.stageDuration3 ?? 'N/A'} hours`);
        console.log(`Stage 3 Power: ${this.stagePower3 ?? 'N/A'}%`);
        console.log(`Stage 4 Duration: ${this.stageDuration4 ?? 'N/A'} hours`);
        console.log(`Stage 4 Power: ${this.stagePower4 ?? 'N/A'}%`);
        console.log(`Load Mode: ${this.loadMode ?? 'N/A'}`);
    }
}
