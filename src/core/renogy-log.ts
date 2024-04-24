import { RenogyData } from './renogy-data';
import eventemitter3 from 'eventemitter3';

const MAX_EMIT_SIZE = 60; // max number of data points to emit

export type RenogyDataPoint = {
    timestamp: Date;
    batteryVoltage: number;
    loadPower: number;
    chargePower: number;
    loadEnergyWh: number;
    chargeEnergyWh: number;
};

export type RenogyLogData = Map<string, RenogyDataPoint>;

const getPastDate = (dt: Date, delta: number): Date => {
    return new Date(dt.getTime() - delta);
};

const getYesterday = (dt: Date): Date => {
    return getPastDate(dt, 24 * 60 * 60 * 1000);
};

const getPrevMinute = (dt: Date): Date => {
    return getPastDate(dt, 60 * 1000);
};

const calculateReductionFactor = (currentSize: number, targetSize: number) => {
    const allowedFactors = [1, 2, 5, 10, 15, 20, 30];
    if (currentSize <= targetSize) return 1;
    const idealFactor = currentSize / targetSize;
    let chosenFactor =
        allowedFactors.find((factor) => factor >= idealFactor) ?? allowedFactors[allowedFactors.length - 1];
    return chosenFactor;
};

export class RenogyLog extends eventemitter3 {
    private _oneMinuteData: RenogyDataPoint[] = [];
    private _dataMap: RenogyLogData = new Map();
    private _currentMinuteKey: string;

    constructor() {
        super();
        this._currentMinuteKey = this._getKey(new Date());
    }

    private _getKey(dt: Date): string {
        const YYYY = dt.getFullYear();
        const MM = (dt.getMonth() + 1).toString().padStart(2, '0');
        const DD = dt.getDate().toString().padStart(2, '0');
        const hh = dt.getHours().toString().padStart(2, '0');
        const mm = dt.getMinutes().toString().padStart(2, '0');
        return `${YYYY}${MM}${DD} ${hh}:${mm}`;
    }

    private _prune(thresholdDate: Date): void {
        const keysToDelete = [];
        for (let key of this._dataMap.keys()) {
            const keyDate = new Date(key);
            if (keyDate <= thresholdDate) {
                keysToDelete.push(key);
                continue;
            }
            break;
        }

        for (const key of keysToDelete) {
            this._dataMap.delete(key);
        }
    }

    private _aggregateData(dt: Date, dataSet: RenogyDataPoint[], prevData: RenogyDataPoint | null) {
        const summedData = dataSet.reduce(
            (acc, cur) => {
                acc.batteryVoltage += cur.batteryVoltage;
                acc.loadPower += cur.loadPower;
                acc.chargePower += cur.chargePower;
                acc.loadEnergyWh += cur.loadEnergyWh;
                acc.chargeEnergyWh += cur.chargeEnergyWh;
                return acc;
            },
            { batteryVoltage: 0, loadPower: 0, chargePower: 0, loadEnergyWh: 0, chargeEnergyWh: 0 },
        );

        return {
            timestamp: dt,
            batteryVoltage: summedData.batteryVoltage / this._oneMinuteData.length,
            loadPower: summedData.loadPower / this._oneMinuteData.length,
            chargePower: summedData.chargePower / this._oneMinuteData.length,
            loadEnergyWh: summedData.loadEnergyWh + (prevData ? prevData.loadEnergyWh : 0),
            chargeEnergyWh: summedData.chargeEnergyWh + (prevData ? prevData.chargeEnergyWh : 0),
        };
    }

    private _reduceData(dataPoints: RenogyDataPoint[], reduceBy: number = 5): RenogyDataPoint[] {
        let reducedData = [];

        // Group data into chunks of 5
        for (let i = 0; i < dataPoints.length; i += reduceBy) {
            const chunk = dataPoints.slice(i, i + reduceBy);

            // Calculate averages for the chunk if it has at least one element
            if (chunk.length > 0) {
                const averages = chunk.reduce(
                    (acc, cur) => {
                        acc.batteryVoltage += cur.batteryVoltage;
                        acc.loadPower += cur.loadPower;
                        acc.chargePower += cur.chargePower;
                        acc.count += 1;
                        return acc;
                    },
                    { batteryVoltage: 0, loadPower: 0, chargePower: 0, count: 0 },
                );

                reducedData.push({
                    timestamp: chunk[chunk.length - 1].timestamp,
                    batteryVoltage: averages.batteryVoltage / averages.count,
                    loadPower: averages.loadPower / averages.count,
                    chargePower: averages.chargePower / averages.count,
                    loadEnergyWh: chunk[chunk.length - 1].loadEnergyWh,
                    chargeEnergyWh: chunk[chunk.length - 1].chargeEnergyWh,
                });
            }
        }
        return reducedData;
    }

    public emitUpdate(): void {
        let dataPoints = Array.from(this._dataMap.values());
        if (dataPoints.length > MAX_EMIT_SIZE) {
            const reductionFactor = calculateReductionFactor(dataPoints.length, MAX_EMIT_SIZE);
            dataPoints = this._reduceData(dataPoints, reductionFactor);
        }
        this.emit('data', dataPoints);
    }

    public update(data: RenogyData): void {
        const now = new Date();
        const loadPower = (data.loadV ?? 0) * (data.loadC ?? 0);
        const chargePower = (data.solarV ?? 0) * (data.solarC ?? 0);

        const prevData = this._dataMap.get(this._currentMinuteKey);

        let prevTimeStamp = prevData ? prevData.timestamp : now;
        if (this._oneMinuteData.length > 0) {
            prevTimeStamp = this._oneMinuteData[this._oneMinuteData.length - 1].timestamp;
        }

        const deltaTime = (now.getTime() - prevTimeStamp.getTime()) / 3600000; // time in hours
        const loadEnergyWh = loadPower * deltaTime;
        const chargeEnergyWh = chargePower * deltaTime;

        const currentData = {
            timestamp: now,
            batteryVoltage: data.battV ?? 0,
            loadPower: loadPower,
            chargePower: chargePower,
            loadEnergyWh: loadEnergyWh,
            chargeEnergyWh: chargeEnergyWh,
        };

        const minuteKey = this._getKey(now);

        // ensure the log is populated with at least one data point
        if (this._dataMap.size === 0) {
            const prevMinuteKey = this._getKey(getPrevMinute(now));
            this._dataMap.set(prevMinuteKey, currentData);
            this.emitUpdate();
        }

        this._oneMinuteData.push(currentData);

        if (minuteKey !== this._currentMinuteKey) {
            this._prune(getYesterday(now));
            const accumulatedData = this._aggregateData(now, this._oneMinuteData, prevData ?? null);
            this._dataMap.set(minuteKey, accumulatedData);
            this.emitUpdate();
            this._oneMinuteData = [];
            this._currentMinuteKey = minuteKey;
        }
    }
}
