import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ubx, location } from './globals';
import CoordinateTranslator from './lib/coordinate-translator';

function getSatCount() {
    const gnssSvPairsSet = new Set<string>();
    ubx.ubxParser.ubxRxmRawx.meas.forEach((measurement) => {
        const gnssSvPair = `${measurement.gnssId}-${measurement.svId}`;
        gnssSvPairsSet.add(gnssSvPair);
    });
    return gnssSvPairsSet.size;
}

function getGoogleMapsLink(t: CoordinateTranslator) {
    const [lat, lon] = t.lla;
    const [latD, latM, latS] = t.latDMS;
    const [lonD, lonM, lonS] = t.lngDMS;

    const latHemi = latD < 0 ? 'S' : 'N';
    const lonHemi = lonD < 0 ? 'W' : 'E';

    return `https://www.google.com/maps/place/${Math.abs(latD)}%C2%B0${latM}'${latS.toFixed(1)}%22${latHemi}+${Math.abs(lonD)}%C2%B0${lonM}'${lonS.toFixed(1)}%22${lonHemi}/@${lat.toFixed(7)},${lon.toFixed(7)},17z/`;
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
                <pre>{location.value.latString}</pre>
                <pre>{location.value.lngString}</pre>
                <pre>{`${location.value.altFeet.toFixed(1)}' (${location.value.alt.toFixed(2)}m)`}</pre>
            </CardContent>
            <CardContent className="px-4 pb-2">
                <a
                    href={getGoogleMapsLink(location.value)}
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
