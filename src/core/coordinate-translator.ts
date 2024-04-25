import { project, unproject } from './ecef-projector2';

const parseGeodetic = (str: string) => {
    str = str.toUpperCase();
    let sign = str.includes('S') || str.toUpperCase().includes('W') ? -1 : 1;
    str = str.replace(/[^\d.-]/g, ' ');

    const arr = str.trim().split(/\s+/).map(parseFloat);
    const d = Math.abs(arr[0]);
    const m = arr.length > 1 ? arr[1] / 60 : 0;
    const s = arr.length > 2 ? arr[2] / 3600 : 0;

    sign *= arr[0] < 0 ? -1 : 1;
    const result = (d + m + s) * sign;
    return isNaN(result) ? 0 : result;
};

const degToDMS = (deg: number) => {
    const sign = deg < 0 ? -1 : 1;
    deg = Math.abs(deg);
    const d = Math.floor(deg);
    const m = Math.floor((deg - d) * 60);
    const s = (deg - d - m / 60) * 3600;

    return [d * sign, m, s];
};

const degToString = (deg: number, isLat: boolean = true) => {
    const [d, m, s] = degToDMS(deg);

    const str = `${Math.abs(d).toString().padStart(2, '0')}° ${m.toString().padStart(2, '0')}' ${s.toFixed(4).padStart(7, '0')}"`;

    if (isLat) {
        return `${deg < 0 ? 'S' : 'N'} ${str}`;
    }

    return `${deg < 0 ? 'W' : 'E'} ${str}`;
};

export class CoordinateTranslator {
    private _lat: number = 0;
    private _lng: number = 0;
    private _alt: number = 0;
    private _ecefX: number = 0;
    private _ecefY: number = 0;
    private _ecefZ: number = 0;
    private _wasEcef: boolean = false;

    constructor(x: string, y: string, z: string) {
        this.parse(x, y, z);
    }

    public parse(x: string, y: string, z: string) {
        // first, try parsing as ECEF (x or y > 180)
        const possibleEcefX = parseFloat(x);
        const possibleEcefY = parseFloat(y);
        const possibleEcefZ = parseFloat(z);

        if (!isNaN(possibleEcefX) && !isNaN(possibleEcefY) && !isNaN(possibleEcefZ)) {
            if (Math.abs(possibleEcefX) > 180 || Math.abs(possibleEcefY) > 180) {
                this._ecefX = possibleEcefX;
                this._ecefY = possibleEcefY;
                this._ecefZ = possibleEcefZ;
                [this._lat, this._lng, this._alt] = unproject(this._ecefX, this._ecefY, this._ecefZ);
                this._wasEcef = true;
                return;
            }
        }

        // otherwise assume LLA
        this._wasEcef = false;

        this._lat = parseGeodetic(x);
        this._lng = parseGeodetic(y);
        this._alt = parseFloat(z);
        this._alt = isNaN(this._alt) ? 0 : this._alt;

        [this._ecefX, this._ecefY, this._ecefZ] = project(this._lat, this._lng, this._alt);
    }

    public get lla() {
        return [this._lat, this._lng, this._alt];
    }
    public get lat() {
        return this._lat;
    }
    public get latDMS() {
        return degToDMS(this._lat);
    }
    public get latString() {
        return degToString(this._lat);
    }
    public get lng() {
        return this._lng;
    }
    public get lngDMS() {
        return degToDMS(this._lng);
    }
    public get lngString() {
        return degToString(this._lng, false);
    }
    public get alt() {
        return this._alt;
    }
    public get altFeet() {
        return this._alt * 3.28084;
    }
    public get ecef() {
        return [this._ecefX, this._ecefY, this._ecefZ];
    }
    public get ecefX() {
        return this._ecefX;
    }
    public get ecefY() {
        return this._ecefY;
    }
    public get ecefZ() {
        return this._ecefZ;
    }
    public get wasEcef() {
        return this._wasEcef;
    }
    public get wasLla() {
        return !this._wasEcef;
    }
}
