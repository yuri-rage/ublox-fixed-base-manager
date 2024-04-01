import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ubx, ubxCfgTmode3Count } from './globals';

export default function Tmode3Card() {
    return (
        <Card className="text-sm">
            <CardHeader className="px-4 pb-2 pt-4">
                <CardTitle>Time Mode 3</CardTitle>
                <CardDescription className="font-mono">
                    UBX-CFG-TMODE3: {ubxCfgTmode3Count.value}
                </CardDescription>
            </CardHeader>
            <CardContent className="px-4 pb-4">
                <pre>{ubx.ubxParser.ubxCfgTmode3.toString()}</pre>
            </CardContent>
        </Card>
    );
}
