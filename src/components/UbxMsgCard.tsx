import { ubx, ubxMsgCount } from '@/globals';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export const UbxMsgCard = () => {
    return (
        <Card className="text-sm">
            <CardHeader className="px-4 pb-2 pt-4">
                <CardTitle>u-Blox Messages</CardTitle>
                <CardDescription>Total: {ubxMsgCount.value}</CardDescription>
            </CardHeader>
            <CardContent className="px-4 pb-4">
                <pre>{`UBX-CFG-TMODE3: ${ubx.ubxParser.ubxCfgTmode3.count.toString().padStart(5, ' ')}`}</pre>
                <pre>{`UBX-MON-HW    : ${ubx.ubxParser.ubxMonHw.count.toString().padStart(5, ' ')}`}</pre>
                <pre>{`UBX-NAV-PVT   : ${ubx.ubxParser.ubxNavPvt.count.toString().padStart(5, ' ')}`}</pre>
                <pre>{`UBX-NAV-SVIN  : ${ubx.ubxParser.ubxNavSvin.count.toString().padStart(5, ' ')}`}</pre>
                <pre>{`UBX-RXM-RAWX  : ${ubx.ubxParser.ubxRxmRawx.count.toString().padStart(5, ' ')}`}</pre>
                <pre>{`UBX-ACK-ACK   : ${ubx.ubxParser.ubxAckAck.count.toString().padStart(5, ' ')}`}</pre>
                <pre>{`UBX-ACK-NAK   : ${ubx.ubxParser.ubxAckNak.count.toString().padStart(5, ' ')}`}</pre>
                <pre>{`Last ACK  : 0x${ubx.ubxParser.ubxAckAck.lastAckClass.toString(16).padStart(2, '0')} 0x${ubx.ubxParser.ubxAckAck.lastAckId.toString(16).padStart(2, '0')}`}</pre>
            </CardContent>
        </Card>
    );
};
