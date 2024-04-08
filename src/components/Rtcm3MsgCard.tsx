import { ubx, rtcm3Count } from '@/globals';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export const Rtcm3MsgCard = () => {
    function getRtcmMessages() {
        let s = '';
        ubx.rtcm3Parser.messages.forEach((value: number, key: number) => {
            s += `Type ${key}: ${value.toString().padStart(5, ' ')}\n`;
        });
        return s;
    }

    return (
        <Card className="text-sm">
            <CardHeader className="px-4 pb-2 pt-4">
                <CardTitle>RTCM3 Messages</CardTitle>
                <CardDescription>Total: {rtcm3Count.value}</CardDescription>
            </CardHeader>
            <CardContent className="px-4 pb-4">
                <pre>{getRtcmMessages()}</pre>
            </CardContent>
        </Card>
    );
};
