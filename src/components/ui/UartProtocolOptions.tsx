import { Signal, useSignal, useSignalEffect } from '@preact/signals-react';
import { CheckedState } from '@radix-ui/react-checkbox';
import { BAUD_RATES, ubx, ubxCfgPrtCount, ubxCfgMsgCount } from '@/globals';
import { UBX, NMEA } from '@/core/ublox-interface';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectGroup } from '@/components/ui/select';
import { SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface UartProtocolOptionsProps {
    portId: number;
    nmeaEnabled: Signal<boolean>;
    triggerSend: Signal<boolean>;
    triggerDefaults: Signal<boolean>;
    statusText: Signal<string>;
}

export const UartProtocolOptions: React.FC<UartProtocolOptionsProps> = ({
    portId,
    nmeaEnabled, // we track this out of scope to ensure proper message rate handling
    triggerSend,
    triggerDefaults,
    statusText,
}) => {
    const nagText = 'Transmit to apply changes...';
    const ubxEnabled = useSignal(false);
    //const nmeaEnabled = useSignal(false);
    const rtcm3Enabled = useSignal(false);
    const baudRate = useSignal(460800);

    const portStr = () => {
        switch (portId) {
            case UBX.MASK.PORTID.USB:
                return 'USB';
            case UBX.MASK.PORTID.UART1:
                return 'UART1';
            case UBX.MASK.PORTID.UART2:
                return 'UART2';
            default:
                return '';
        }
    };

    // on refresh
    useSignalEffect(() => {
        // @ts-ignore
        const _trigger = ubxCfgPrtCount.value;
        const msg = ubx.ubxParser.ubxCfgPrt;
        if (msg.portId !== portId) return;
        if (Date.now() - msg.timestamp > 100) return;
        nmeaEnabled.value = false; // assume we get this message first
        ubxEnabled.value = msg.inUbx && msg.outUbx;
        rtcm3Enabled.value = msg.inRtcm3 && msg.outRtcm3;
        baudRate.value = msg.baudRate;
    });

    // on refresh
    useSignalEffect(() => {
        // @ts-ignore
        const _trigger = ubxCfgMsgCount.value;
        const msg = ubx.ubxParser.ubxCfgMsg;
        if (msg.cfgMsgClass !== NMEA.STANDARD.CLASS) return;
        if (Date.now() - msg.timestamp > 100) return;
        nmeaEnabled.value = nmeaEnabled.value || msg.rate(portId) > 0;
    });

    // trigger send
    useSignalEffect(() => {
        if (!triggerSend.value) return;
        ubx.write(
            ubx.generate.configPort(
                portId,
                UBX.MASK.PROTO.UBX | UBX.MASK.PROTO.NMEA | (rtcm3Enabled.value ? UBX.MASK.PROTO.RTCM3 : 0),
                (ubxEnabled.value ? UBX.MASK.PROTO.UBX : 0) |
                    UBX.MASK.PROTO.NMEA |
                    (rtcm3Enabled.value ? UBX.MASK.PROTO.RTCM3 : 0),
                baudRate.value,
            ),
        );
        triggerSend.value = false;
    });

    // trigger defaults
    useSignalEffect(() => {
        if (!triggerDefaults.value) return;
        ubxEnabled.value = portId !== UBX.MASK.PORTID.UART2;
        rtcm3Enabled.value = portId !== UBX.MASK.PORTID.UART2;
        nmeaEnabled.value = false;
        baudRate.value = 460800;
        triggerDefaults.value = false;
    });

    const onCheckedChange = (checked: CheckedState, sig: Signal) => {
        sig.value = checked.valueOf() as boolean;
        statusText.value = nagText;
    };

    return (
        <>
            <div className="justify-self-start text-sm font-medium">{portStr()}:</div>
            <Checkbox checked={ubxEnabled.value} onCheckedChange={(e) => onCheckedChange(e, ubxEnabled)} />
            <Checkbox
                checked={rtcm3Enabled.value}
                onCheckedChange={(e) => onCheckedChange(e, rtcm3Enabled)}
            />
            <Checkbox checked={nmeaEnabled.value} onCheckedChange={(e) => onCheckedChange(e, nmeaEnabled)} />
            {portId !== UBX.MASK.PORTID.USB ? (
                <Select
                    value={baudRate.value.toString()}
                    onValueChange={(value) => {
                        baudRate.value = parseInt(value);
                        statusText.value = nagText;
                    }}
                >
                    <SelectTrigger className="h-8 w-auto">
                        <SelectValue placeholder="Baud Rate" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectGroup>
                            {BAUD_RATES.map((baud: number) => (
                                <SelectItem key={baud} value={baud.toString()}>
                                    {baud}
                                </SelectItem>
                            ))}
                        </SelectGroup>
                    </SelectContent>
                </Select>
            ) : (
                <div></div>
            )}
        </>
    );
};
