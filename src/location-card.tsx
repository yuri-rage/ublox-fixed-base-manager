import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ubx, location } from './globals';

function getSatCount() {
    const gnssSvPairsSet = new Set<string>();
    ubx.ubxParser.ubxRxmRawx.meas.forEach((measurement) => {
        const gnssSvPair = `${measurement.gnssId}-${measurement.svId}`;
        gnssSvPairsSet.add(gnssSvPair);
    });
    return gnssSvPairsSet.size;
}

function getGoogleMapsLink(lat: number, lon: number) {
    const absLat = Math.abs(lat);
    const absLon = Math.abs(lon);
    let latDeg = Math.floor(absLat);
    const latMin = Math.floor((absLat - latDeg) * 60);
    const latSec = ((absLat - latDeg - latMin / 60) * 3600).toFixed(1);
    let lonDeg = Math.floor(absLon);
    const lonMin = Math.floor((absLon - lonDeg) * 60);
    const lonSec = ((absLon - lonDeg - lonMin / 60) * 3600).toFixed(1);

    latDeg = latDeg * (lat < 0 ? -1 : 1);
    lonDeg = lonDeg * (lon < 0 ? -1 : 1);

    const latHemi = lat < 0 ? 'S' : 'N';
    const lonHemi = lon < 0 ? 'W' : 'E';

    https: return `https://www.google.com/maps/place/${Math.abs(latDeg)}%C2%B0${latMin}'${latSec}%22${latHemi}+${Math.abs(lonDeg)}%C2%B0${lonMin}'${lonSec}%22${lonHemi}/@${lat.toFixed(7)},${lon.toFixed(7)},17z/`;
}

export default function LocationCard() {
    return (
        <Card className="text-sm">
            <CardHeader className="px-4 pb-2 pt-4">
                <CardTitle>Fixed Base Location</CardTitle>
                <CardDescription>
                    {['N/A', 'Survey-in Active', 'Fixed Mode'][ubx.ubxParser.ubxCfgTmode3.mode]}
                </CardDescription>
            </CardHeader>
            <CardContent className="px-4 pb-2">
                <pre>{location.value[0]}</pre>
                <pre>{location.value[1]}</pre>
                <pre>{`${location.value[3]}' (${location.value[2]}m)`}</pre>
            </CardContent>
            <CardContent className="px-4 pb-2">
                <a
                    href={getGoogleMapsLink(location.value[0], location.value[1])}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm text-blue-400 hover:underline"
                >
                    View on Google Maps
                </a>
            </CardContent>
            <CardContent className="px-4 pb-4">
                <pre>Sat Count: {getSatCount()}</pre>
            </CardContent>
        </Card>
    );
}
