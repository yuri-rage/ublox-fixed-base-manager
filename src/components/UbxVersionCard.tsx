import { ubx, ubxMonVerCount } from '@/globals';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export const UbxVersionCard = () => {
    return (
        <Card className="text-sm">
            <CardHeader className="px-4 pb-2 pt-4">
                <CardTitle>u-Blox Version Data</CardTitle>
                <CardDescription className="font-mono">UBX-MON-VER: {ubxMonVerCount.value}</CardDescription>
            </CardHeader>
            <CardContent className="px-4 pb-4">
                <pre>{ubx.ubxParser.ubxMonVer.toString()}</pre>
            </CardContent>
        </Card>
    );
};
