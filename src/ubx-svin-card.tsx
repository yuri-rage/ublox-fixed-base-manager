import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ubx, ubxNavSvinCount } from './globals';

export default function SvinCard() {
    return (
        <Card className="text-sm">
            <CardHeader className="px-4 pb-2 pt-4">
                <CardTitle>Survey-in</CardTitle>
                <CardDescription className="font-mono">UBX-NAV-SVIN: {ubxNavSvinCount.value}</CardDescription>
            </CardHeader>
            <CardContent className="px-4 pb-4">
                <pre>{ubx.ubxParser.ubxNavSvin.toString()}</pre>
            </CardContent>
        </Card>
    );
}
