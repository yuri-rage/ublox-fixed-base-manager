import { ubx, location } from '@/globals';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TooltipContainer } from '@/components/ui/TooltipContainer';
import { GnssStatsPreformatted } from '@/components/GnssStatsPreformatted';
import { GoogleMapsLink } from '@/components/GoogleMapsLink';

export const FixedBaseStatusCard = () => {
    const TMODE3_STR = ['Fixed Mode Disabled', 'Survey-in Active', 'Fixed Mode'];
    const FIX_TYPE_STR = ['NO FIX', 'DR', '2D', '3D', '3D+DR', 'TIME'];
    const RTK_FIX_STR = ['', '/FLOAT', '/FIXED'];
    const STOPLIGHT_COLORS = ['text-red-500', 'text-yellow-500', 'text-green-500'];

    return (
        <Card className="text-sm">
            <CardHeader className="px-4 pb-2 pt-2">
                <CardTitle className={`text-lg ${STOPLIGHT_COLORS[ubx.ubxParser.ubxCfgTmode3.mode]}`}>
                    {TMODE3_STR[ubx.ubxParser.ubxCfgTmode3.mode]}
                </CardTitle>
                <CardContent className="p-0">
                    <TooltipContainer
                        tooltipText="u-Blox GPS Fix Type"
                        className="font-mono text-muted-foreground"
                    >
                        ({`${FIX_TYPE_STR[ubx.ubxParser.ubxNavPvt.fixType]}`}
                        {ubx.ubxParser.ubxNavPvt.diffSoln ? '/DGNSS' : ''}
                        {RTK_FIX_STR[ubx.ubxParser.ubxNavPvt.carrSoln]})
                    </TooltipContainer>
                </CardContent>
            </CardHeader>
            <CardContent className="px-4 pb-2">
                <pre>{location.value.latString}</pre>
                <pre>{location.value.lngString}</pre>
                <pre>{`${location.value.altFeet.toFixed(1)}' (${location.value.alt.toFixed(2)}m)`}</pre>
            </CardContent>
            <CardContent className="px-4 pb-2">
                <GoogleMapsLink coordTranslator={location.value} />
            </CardContent>
            <CardContent className="px-4 pb-1">
                <GnssStatsPreformatted />
            </CardContent>
            <CardContent className="flex flex-col space-y-1 px-4 pb-4 text-xs text-muted-foreground">
                <TooltipContainer tooltipText="Using fewer than total signals received is normal, expected behavior">
                    (Sats used in solution: {ubx.ubxParser.ubxNavPvt.numSV})
                </TooltipContainer>
                <span className="font-mono">
                    {ubx.ubxParser.ubxNavPvt.dateStr}
                    &emsp;&emsp;{ubx.ubxParser.ubxNavPvt.timeStr} UTC
                </span>
            </CardContent>
        </Card>
    );
};
