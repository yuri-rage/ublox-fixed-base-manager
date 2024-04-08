import { useSignal, useSignalEffect } from '@preact/signals-react';
import { toast } from 'sonner';
import { appConfig, ubx } from '@/globals';
import { NMEA, UBX } from '@/core/ublox-interface';
import { writeFixedBaseConfig } from '@/core/ublox-write-base-config';
import { Card, CardContent, CardDescription } from '@/components/ui/card';
import { TooltipContainer } from '@/components/ui/TooltipContainer';
import { ConfirmButton } from '@/components/ui/ConfirmButton';
import { SaveButton, lastSavedMs } from '@/components/ui/SaveButton';
import { StyledButton } from '@/components/ui/StyledButton';
import { UartProtocolOptions } from '@/components/ui/UartProtocolOptions';

export const UartCard = () => {
    const statusText = useSignal('');

    useSignalEffect(() => {
        // @ts-ignore
        const _trigger = lastSavedMs.value;
        statusText.value = '';  // clear status text on save
    });

    const trigger = {
        usb: {
            send: useSignal(false),
            defaults: useSignal(false),
        },
        uart1: {
            send: useSignal(false),
            defaults: useSignal(false),
        },
        uart2: {
            send: useSignal(false),
            defaults: useSignal(false),
        },
    };

    const nmeaEnabled = {
        usb: useSignal(false),
        uart1: useSignal(false),
        uart2: useSignal(false),
    };

    const onReplicateMPConfigClick = () => {
        trigger.usb.defaults.value = true;
        trigger.uart1.defaults.value = true;
        trigger.uart2.defaults.value = true;
        statusText.value = 'Transmit to apply changes...';
        toast('Settings ready, transmit to apply');
    };

    const onTransmitClick = () => {
        trigger.usb.send.value = true;
        trigger.uart1.send.value = true;
        trigger.uart2.send.value = true;
        writeFixedBaseConfig(
            ubx,
            {
                usb: nmeaEnabled.usb.value,
                uart1: nmeaEnabled.uart1.value,
                uart2: nmeaEnabled.uart2.value,
            },
            appConfig.value.advanced.enableUbxNavSat,
            appConfig.value.advanced.rate1005,
            appConfig.value.advanced.rate1230,
            appConfig.value.advanced.useMSM7,
        );
        statusText.value = '';
        statusText.value = "Don't forget to save config...";
        toast('Settings applied, click save to retain');
    };

    const onRefreshClick = () => {
        ubx.write(ubx.generate.pollPort(UBX.MASK.PORTID.USB));
        ubx.write(ubx.generate.pollPort(UBX.MASK.PORTID.UART1));
        ubx.write(ubx.generate.pollPort(UBX.MASK.PORTID.UART2));
        // assume NMEA messages all follow suit with GGA
        ubx.write(ubx.generate.pollMsgRate(NMEA.STANDARD.CLASS, NMEA.STANDARD.GGA));
        statusText.value = '';
    };

    useSignalEffect(() => {
        onRefreshClick(); // always update on component load
    });

    return (
        <Card className="py-4 text-sm">
            <CardContent>
                <div
                    className="grid items-center justify-items-center gap-4"
                    style={{ gridTemplateColumns: 'min-content auto auto auto auto' }}
                >
                    <div>{/* blank first column header */}</div>
                    <TooltipContainer
                        className="self-end text-sm font-medium"
                        tooltipText="Enable u-Blox binary protocol"
                    >
                        UBX
                    </TooltipContainer>
                    <TooltipContainer
                        className="self-end text-sm font-medium"
                        tooltipText="Enable RTCM3 protocol (RTK corrections)"
                    >
                        RTCM3
                    </TooltipContainer>
                    <TooltipContainer
                        className="self-end text-sm font-medium"
                        tooltipText="Enable NMEA protocol"
                    >
                        NMEA
                    </TooltipContainer>
                    <TooltipContainer
                        className="self-end text-sm font-medium"
                        tooltipText="UART Baud Rate (460800 recommended)"
                    >
                        Baud Rate
                    </TooltipContainer>

                    <UartProtocolOptions
                        portId={UBX.MASK.PORTID.USB}
                        nmeaEnabled={nmeaEnabled.usb}
                        triggerSend={trigger.usb.send}
                        triggerDefaults={trigger.usb.defaults}
                        statusText={statusText}
                    />
                    <UartProtocolOptions
                        portId={UBX.MASK.PORTID.UART1}
                        nmeaEnabled={nmeaEnabled.uart1}
                        triggerSend={trigger.uart1.send}
                        triggerDefaults={trigger.uart1.defaults}
                        statusText={statusText}
                    />
                    <UartProtocolOptions
                        portId={UBX.MASK.PORTID.UART2}
                        nmeaEnabled={nmeaEnabled.uart2}
                        triggerSend={trigger.uart2.send}
                        triggerDefaults={trigger.uart2.defaults}
                        statusText={statusText}
                    />
                </div>
            </CardContent>
            <CardContent className="flex flex-wrap items-center justify-between gap-3 pb-0">
                <ConfirmButton
                    alertTitle="Replication Mission Planner's Fixed Base Settings?"
                    alertDescription="This will pre-select settings to match Mission Planner's defaults. Settings will not be active until the 'Transmit Config' button is clicked."
                    onClick={onReplicateMPConfigClick}
                >
                    Replicate MP Config
                </ConfirmButton>
                <ConfirmButton
                    alertTitle="Transmit settings to u-Blox GPS?"
                    alertDescription="This will transmit the selected settings to the u-Blox GPS. Be sure to click 'Save Config' to retain these settings between reboots."
                    onClick={onTransmitClick}
                >
                    Transmit Config
                </ConfirmButton>
                <SaveButton />
                <StyledButton onClick={onRefreshClick}>Refresh</StyledButton>
            </CardContent>
            <CardDescription className="flex flex-row justify-between px-6 pt-2">
                <span>&emsp;</span>
                <span className="text-yellow-400">{statusText.value}</span>
            </CardDescription>
        </Card>
    );
};
