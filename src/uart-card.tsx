import { Card, CardContent, CardDescription } from './components/ui/card';
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from './components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import StyledButton from './styled-button';
import { BAUD_RATES, ubx, ubxCfgMsgCount, ubxCfgPrtCount } from './globals';
import { Checkbox } from './components/ui/checkbox';
import { NMEA, RTCM_3X, UBX } from './lib/ublox-interface';
import { useSignal, useSignalEffect } from '@preact/signals-react';

export default function UartCard() {
    const changeText = 'Transmit to apply changes...';
    const statusText = useSignal('');

    const usbUbxEnabled = useSignal(false);
    const usbNmeaEnabledAtPort = useSignal(false);
    const usbNmeaEnabled = useSignal(false);
    const usbRtcm3Enabled = useSignal(false);
    const usbUbxNavSat = useSignal(false);
    const usbRtcm3Force1Hz = useSignal(false);

    const uart1UbxEnabled = useSignal(false);
    const uart1NmeaEnabledAtPort = useSignal(false);
    const uart1NmeaEnabled = useSignal(false);
    const uart1Rtcm3Enabled = useSignal(false);
    const uart1UbxNavSat = useSignal(false);
    const uart1Rtcm3Force1Hz = useSignal(false);
    const uart1Baud = useSignal(460800);

    const uart2UbxEnabled = useSignal(false);
    const uart2NmeaEnabledAtPort = useSignal(false);
    const uart2NmeaEnabled = useSignal(false);
    const uart2Rtcm3Enabled = useSignal(false);
    const uart2UbxNavSat = useSignal(false);
    const uart2Rtcm3Force1Hz = useSignal(false);
    const uart2Baud = useSignal(460800);

    useSignalEffect(() => {
        onRefreshClick(); // always refresh settings on component load
    });

    useSignalEffect(() => {
        // @ts-ignore
        const _cfgPrtCount = ubxCfgPrtCount.value; // only used to trigger effect (eslint disabled)

        if (ubx.ubxParser.ubxCfgPrt.portId === UBX.MASK.PORTID.USB) {
            usbUbxEnabled.value = ubx.ubxParser.ubxCfgPrt.inUbx && ubx.ubxParser.ubxCfgPrt.outUbx;
            usbNmeaEnabledAtPort.value = ubx.ubxParser.ubxCfgPrt.inNmea && ubx.ubxParser.ubxCfgPrt.outNmea;
            usbRtcm3Enabled.value = ubx.ubxParser.ubxCfgPrt.inRtcm3 && ubx.ubxParser.ubxCfgPrt.outRtcm3;
        }
        if (ubx.ubxParser.ubxCfgPrt.portId === UBX.MASK.PORTID.UART1) {
            uart1UbxEnabled.value = ubx.ubxParser.ubxCfgPrt.inUbx && ubx.ubxParser.ubxCfgPrt.outUbx;
            uart1NmeaEnabledAtPort.value = ubx.ubxParser.ubxCfgPrt.inNmea && ubx.ubxParser.ubxCfgPrt.outNmea;
            uart1Rtcm3Enabled.value = ubx.ubxParser.ubxCfgPrt.inRtcm3 && ubx.ubxParser.ubxCfgPrt.outRtcm3;
            uart1Baud.value = ubx.ubxParser.ubxCfgPrt.baudRate;
        }
        if (ubx.ubxParser.ubxCfgPrt.portId === UBX.MASK.PORTID.UART2) {
            uart2UbxEnabled.value = ubx.ubxParser.ubxCfgPrt.inUbx && ubx.ubxParser.ubxCfgPrt.outUbx;
            uart2NmeaEnabledAtPort.value = ubx.ubxParser.ubxCfgPrt.inNmea && ubx.ubxParser.ubxCfgPrt.outNmea;
            uart2Rtcm3Enabled.value = ubx.ubxParser.ubxCfgPrt.inRtcm3 && ubx.ubxParser.ubxCfgPrt.outRtcm3;
            uart2Baud.value = ubx.ubxParser.ubxCfgPrt.baudRate;
        }
    });

    useSignalEffect(() => {
        // @ts-ignore
        const _cfgMsgCount = ubxCfgMsgCount.value; // only used to trigger effect (eslint disabled)

        if (
            ubx.ubxParser.ubxCfgMsg.cfgMsgClass === UBX.NAV.CLASS &&
            ubx.ubxParser.ubxCfgMsg.cfgMsgId === UBX.NAV.SAT
        ) {
            usbUbxNavSat.value = ubx.ubxParser.ubxCfgMsg.rateUSB > 0;
            uart1UbxNavSat.value = ubx.ubxParser.ubxCfgMsg.rateUART1 > 0;
            uart2UbxNavSat.value = ubx.ubxParser.ubxCfgMsg.rateUART2 > 0;
        }

        // because we turn off NMEA messages by zeroing their rates,
        // we need to use an extra check to determine if NMEA is actually in use
        if (ubx.ubxParser.ubxCfgMsg.cfgMsgClass === NMEA.STANDARD.CLASS) {
            if (ubx.ubxParser.ubxCfgMsg.rateUSB > 0) {
                usbNmeaEnabled.value = usbNmeaEnabledAtPort.value && true;
            }
            if (ubx.ubxParser.ubxCfgMsg.rateUART1 > 0) {
                uart1NmeaEnabled.value = uart1NmeaEnabledAtPort.value && true;
            }
            if (ubx.ubxParser.ubxCfgMsg.rateUART2 > 0) {
                uart2NmeaEnabled.value = uart2NmeaEnabledAtPort.value && true;
            }
        }

        if (ubx.ubxParser.ubxCfgMsg.cfgMsgClass === RTCM_3X.CLASS) {
            if (ubx.ubxParser.ubxCfgMsg.cfgMsgId === RTCM_3X.TYPE1005) {
                usbRtcm3Force1Hz.value = usbRtcm3Enabled.value;
                uart1Rtcm3Force1Hz.value = uart1Rtcm3Enabled.value;
                uart2Rtcm3Force1Hz.value = uart2Rtcm3Enabled.value;
            }
            if (ubx.ubxParser.ubxCfgMsg.rateUSB > 1) {
                usbRtcm3Force1Hz.value = false;
            }
            if (ubx.ubxParser.ubxCfgMsg.rateUART1 > 1) {
                uart1Rtcm3Force1Hz.value = false;
            }
            if (ubx.ubxParser.ubxCfgMsg.rateUART2 > 1) {
                uart2Rtcm3Force1Hz.value = false;
            }
        }
    });

    function onRefreshClick() {
        ubx.write(ubx.generate.pollPort(UBX.MASK.PORTID.USB));
        ubx.write(ubx.generate.pollPort(UBX.MASK.PORTID.UART1));
        ubx.write(ubx.generate.pollPort(UBX.MASK.PORTID.UART2));
        ubx.write(ubx.generate.pollMsgRate(UBX.NAV.CLASS, UBX.NAV.SAT));
        for (const msgId of [
            NMEA.STANDARD.GGA, // default
            NMEA.STANDARD.GLL, // default
            NMEA.STANDARD.GSA, // default
            NMEA.STANDARD.GSV, // default
            NMEA.STANDARD.RMC, // default
            NMEA.STANDARD.VTG, // default
            NMEA.STANDARD.GRS,
            NMEA.STANDARD.GST,
            NMEA.STANDARD.ZDA,
            NMEA.STANDARD.GBS,
            NMEA.STANDARD.DTM,
            NMEA.STANDARD.GNS,
            NMEA.STANDARD.VLW,
        ]) {
            ubx.write(ubx.generate.pollMsgRate(NMEA.STANDARD.CLASS, msgId));
        }
        for (const msgId of [
            RTCM_3X.TYPE1005,
            RTCM_3X.TYPE1074,
            RTCM_3X.TYPE1084,
            RTCM_3X.TYPE1094,
            RTCM_3X.TYPE1124,
            RTCM_3X.TYPE1230,
        ]) {
            ubx.write(ubx.generate.pollMsgRate(RTCM_3X.CLASS, msgId));
        }
        statusText.value = '';
    }

    function onReplicateMPConfigClick() {
        usbUbxEnabled.value = true;
        usbNmeaEnabledAtPort.value = true;
        usbNmeaEnabled.value = false;
        usbRtcm3Enabled.value = true;
        usbUbxNavSat.value = false;
        usbRtcm3Force1Hz.value = false;

        uart1UbxEnabled.value = true;
        uart1NmeaEnabledAtPort.value = true;
        uart1NmeaEnabled.value = false;
        uart1Rtcm3Enabled.value = true;
        uart1UbxNavSat.value = false;
        uart1Rtcm3Force1Hz.value = false;
        uart1Baud.value = 460800;

        uart2UbxEnabled.value = false;
        uart2NmeaEnabledAtPort.value = false;
        uart2NmeaEnabled.value = false;
        uart2Rtcm3Enabled.value = false;
        uart2UbxNavSat.value = false;
        uart2Rtcm3Force1Hz.value = false;
        uart2Baud.value = 460800;

        statusText.value = changeText;
    }

    function onTransmitClick() {
        // configure port protocols
        ubx.write(
            ubx.generate.configPort(
                UBX.MASK.PORTID.USB,
                (usbUbxEnabled.value ? UBX.MASK.PROTO.UBX : 0) |
                    UBX.MASK.PROTO.NMEA |
                    (usbRtcm3Enabled.value ? UBX.MASK.PROTO.RTCM3 : 0),
                (usbUbxEnabled.value ? UBX.MASK.PROTO.UBX : 0) |
                    UBX.MASK.PROTO.NMEA |
                    (usbRtcm3Enabled.value ? UBX.MASK.PROTO.RTCM3 : 0),
            ),
        );
        ubx.write(
            ubx.generate.configPort(
                UBX.MASK.PORTID.UART1,
                (uart1UbxEnabled.value ? UBX.MASK.PROTO.UBX : 0) |
                    UBX.MASK.PROTO.NMEA |
                    (uart1Rtcm3Enabled.value ? UBX.MASK.PROTO.RTCM3 : 0),
                (uart1UbxEnabled.value ? UBX.MASK.PROTO.UBX : 0) |
                    UBX.MASK.PROTO.NMEA |
                    (uart1Rtcm3Enabled.value ? UBX.MASK.PROTO.RTCM3 : 0),
                uart1Baud.value,
            ),
        );

        ubx.write(
            ubx.generate.configPort(
                UBX.MASK.PORTID.UART2,
                (uart2UbxEnabled.value ? UBX.MASK.PROTO.UBX : 0) |
                    UBX.MASK.PROTO.NMEA |
                    (uart2Rtcm3Enabled.value ? UBX.MASK.PROTO.RTCM3 : 0),
                (uart2UbxEnabled.value ? UBX.MASK.PROTO.UBX : 0) |
                    UBX.MASK.PROTO.NMEA |
                    (uart2Rtcm3Enabled.value ? UBX.MASK.PROTO.RTCM3 : 0),
                uart2Baud.value,
            ),
        );

        // configure standard fixed base settings
        ubx.write(ubx.generate.configRate(1000));
        ubx.write(ubx.generate.configNavStationary());

        // UBX + RTCM3 is not a valid dropdown option in uCenter, so we'll just turn
        // off NMEA messages as needed by zeroing their rates. This is really just a
        //  cosmetic strategy, as disabling NMEA at the port would have the same effect
        // (it just makes the uCenter config screen appear broken).
        for (const msgId of [
            // these messages are enabled by default for NMEA
            NMEA.STANDARD.GGA,
            NMEA.STANDARD.GLL,
            NMEA.STANDARD.GSA,
            NMEA.STANDARD.GSV,
            NMEA.STANDARD.RMC,
            NMEA.STANDARD.VTG,
        ]) {
            ubx.write(
                ubx.generate.configMsgRate(
                    NMEA.STANDARD.CLASS,
                    msgId,
                    0,
                    uart1NmeaEnabled.value ? 1 : 0,
                    uart2NmeaEnabled.value ? 1 : 0,
                    usbNmeaEnabled.value ? 1 : 0,
                    0,
                ),
            );
        }

        for (const msgId of [
            // these messages are disabled by default for NMEA
            NMEA.STANDARD.GRS,
            NMEA.STANDARD.GST,
            NMEA.STANDARD.ZDA,
            NMEA.STANDARD.GBS,
            NMEA.STANDARD.DTM,
            NMEA.STANDARD.GNS,
            NMEA.STANDARD.VLW,
        ]) {
            ubx.write(ubx.generate.turnOff(NMEA.STANDARD.CLASS, msgId));
        }

        // TODO: add UBX-NAV-SAT at 1 Hz
        ubx.write(
            ubx.generate.configMsgRate(
                UBX.NAV.CLASS,
                UBX.NAV.SVIN,
                0,
                uart1UbxEnabled.value ? 1 : 0,
                uart2UbxEnabled.value ? 1 : 0,
                usbUbxEnabled.value ? 1 : 0,
                0,
            ),
        );
        ubx.write(
            ubx.generate.configMsgRate(
                UBX.NAV.CLASS,
                UBX.NAV.PVT,
                0,
                uart1UbxEnabled.value ? 1 : 0,
                uart2UbxEnabled.value ? 1 : 0,
                usbUbxEnabled.value ? 1 : 0,
                0,
            ),
        );
        ubx.write(
            ubx.generate.configMsgRate(
                RTCM_3X.CLASS,
                RTCM_3X.TYPE1005,
                0,
                uart1Rtcm3Enabled.value ? (uart1Rtcm3Force1Hz.value ? 1 : 5) : 0,
                uart2Rtcm3Enabled.value ? (uart2Rtcm3Force1Hz.value ? 1 : 5) : 0,
                usbRtcm3Enabled.value ? (usbRtcm3Force1Hz.value ? 1 : 5) : 0,
                0,
            ),
        );
        ubx.write(
            ubx.generate.configMsgRate(
                RTCM_3X.CLASS,
                RTCM_3X.TYPE1074,
                0,
                uart1Rtcm3Enabled.value ? 1 : 0,
                uart2Rtcm3Enabled.value ? 1 : 0,
                usbRtcm3Enabled.value ? 1 : 0,
                0,
            ),
        );
        ubx.write(
            ubx.generate.configMsgRate(
                RTCM_3X.CLASS,
                RTCM_3X.TYPE1084,
                0,
                uart1Rtcm3Enabled.value ? 1 : 0,
                uart2Rtcm3Enabled.value ? 1 : 0,
                usbRtcm3Enabled.value ? 1 : 0,
                0,
            ),
        );
        ubx.write(
            ubx.generate.configMsgRate(
                RTCM_3X.CLASS,
                RTCM_3X.TYPE1094,
                0,
                uart1Rtcm3Enabled.value ? 1 : 0,
                uart2Rtcm3Enabled.value ? 1 : 0,
                usbRtcm3Enabled.value ? 1 : 0,
                0,
            ),
        );
        ubx.write(
            ubx.generate.configMsgRate(
                RTCM_3X.CLASS,
                RTCM_3X.TYPE1124,
                0,
                uart1Rtcm3Enabled.value ? 1 : 0,
                uart2Rtcm3Enabled.value ? 1 : 0,
                usbRtcm3Enabled.value ? 1 : 0,
                0,
            ),
        );
        ubx.write(
            ubx.generate.configMsgRate(
                RTCM_3X.CLASS,
                RTCM_3X.TYPE1230,
                0,
                uart1Rtcm3Enabled.value ? (uart1Rtcm3Force1Hz.value ? 1 : 5) : 0,
                uart2Rtcm3Enabled.value ? (uart2Rtcm3Force1Hz.value ? 1 : 5) : 0,
                usbRtcm3Enabled.value ? (usbRtcm3Force1Hz.value ? 1 : 5) : 0,
                0,
            ),
        );
        ubx.write(
            ubx.generate.configMsgRate(
                UBX.NAV.CLASS,
                UBX.NAV.VELNED,
                0,
                uart1UbxEnabled.value ? 1 : 0,
                uart2UbxEnabled.value ? 1 : 0,
                usbUbxEnabled.value ? 1 : 0,
                0,
            ),
        );
        ubx.write(
            ubx.generate.configMsgRate(
                UBX.RXM.CLASS,
                UBX.RXM.RAWX,
                0,
                uart1UbxEnabled.value ? 1 : 0,
                uart2UbxEnabled.value ? 1 : 0,
                usbUbxEnabled.value ? 1 : 0,
                0,
            ),
        );
        ubx.write(
            ubx.generate.configMsgRate(
                UBX.RXM.CLASS,
                UBX.RXM.SFRBX,
                0,
                uart1UbxEnabled.value ? 2 : 0,
                uart2UbxEnabled.value ? 2 : 0,
                usbUbxEnabled.value ? 2 : 0,
                0,
            ),
        );
        ubx.write(
            ubx.generate.configMsgRate(
                UBX.MON.CLASS,
                UBX.MON.HW,
                0,
                uart1UbxEnabled.value ? 2 : 0,
                uart2UbxEnabled.value ? 2 : 0,
                usbUbxEnabled.value ? 2 : 0,
                0,
            ),
        );
        ubx.write(
            ubx.generate.configMsgRate(
                UBX.NAV.CLASS,
                UBX.NAV.SAT,
                0,
                uart1UbxNavSat.value ? 1 : 0,
                uart2UbxNavSat.value ? 1 : 0,
                usbUbxNavSat.value ? 1 : 0,
                0,
            ),
        );
        ubx.addPollMsg(UBX.CFG.CLASS, UBX.CFG.TMODE3);
        ubx.addPollMsg(UBX.MON.CLASS, UBX.MON.VER);
        ubx.pollInterval = 30;

        statusText.value = "Don't forget to save config...";
    }

    function onSaveClick() {
        ubx.write(ubx.generate.saveConfig());
        statusText.value = '';
    }

    return (
        <Card className="py-4 text-sm">
            <CardContent>
                <div
                    className="grid items-center justify-items-center gap-4"
                    style={{ gridTemplateColumns: 'min-content auto auto auto auto auto auto' }}
                >
                    <div></div>
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <div className="self-end text-sm font-medium">UBX</div>
                            </TooltipTrigger>
                            <TooltipContent>Enable u-Blox binary protocol</TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <div className="self-end text-sm font-medium">RTCM3</div>
                            </TooltipTrigger>
                            <TooltipContent>Enable RTCM3 protocol (RTK corrections)</TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <div className="self-end text-sm font-medium">NMEA</div>
                            </TooltipTrigger>
                            <TooltipContent>Enable NMEA protocol</TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <div className="flex flex-col items-center text-sm font-medium">
                                    <span>Add</span>
                                    <span>UBX-NAV-SAT</span>
                                </div>
                            </TooltipTrigger>
                            <TooltipContent>
                                Enable UBX-NAV-SAT message (populates satellite signal data in u-Center)
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <div className="flex flex-col items-center text-sm font-medium">
                                    <span>Force</span>
                                    <span>RTCM3 1Hz</span>
                                </div>
                            </TooltipTrigger>
                            <TooltipContent>
                                Send all RTCM3 messages at 1Hz (default is 0.2Hz for 1005 and 1230 to save
                                some bandwidth)
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <div className="self-end text-sm font-medium">Baud Rate</div>
                            </TooltipTrigger>
                            <TooltipContent>UART Baud Rate (460800 recommended)</TooltipContent>
                        </Tooltip>
                    </TooltipProvider>

                    <div className="justify-self-start text-sm font-medium">USB:</div>
                    <Checkbox
                        id="usb-enable-ubx"
                        checked={usbUbxEnabled.value}
                        onCheckedChange={(checked) => {
                            usbUbxEnabled.value = checked.valueOf() as boolean;
                            statusText.value = changeText;
                        }}
                    />
                    <Checkbox
                        id="usb-enable-rtcm3"
                        checked={usbRtcm3Enabled.value}
                        onCheckedChange={(checked) => {
                            usbRtcm3Enabled.value = checked.valueOf() as boolean;
                            statusText.value = changeText;
                        }}
                    />
                    <Checkbox
                        id="usb-enable-nmea"
                        checked={usbNmeaEnabled.value}
                        onCheckedChange={(checked) => {
                            usbNmeaEnabled.value = checked.valueOf() as boolean;
                            statusText.value = changeText;
                        }}
                    />
                    <Checkbox
                        id="usb-enable-nav-sat"
                        checked={usbUbxNavSat.value}
                        onCheckedChange={(checked) => {
                            usbUbxNavSat.value = checked.valueOf() as boolean;
                            statusText.value = changeText;
                        }}
                    />
                    <Checkbox
                        id="usb-enable-1hz"
                        checked={usbRtcm3Force1Hz.value}
                        onCheckedChange={(checked) => {
                            usbRtcm3Force1Hz.value = checked.valueOf() as boolean;
                            statusText.value = changeText;
                        }}
                    />
                    <div></div>

                    <div className="justify-self-start text-sm font-medium">UART1:</div>
                    <Checkbox
                        id="uart1-enable-ubx"
                        checked={uart1UbxEnabled.value}
                        onCheckedChange={(checked) => {
                            uart1UbxEnabled.value = checked.valueOf() as boolean;
                            statusText.value = changeText;
                        }}
                    />
                    <Checkbox
                        id="uart1-enable-rtcm3"
                        checked={uart1Rtcm3Enabled.value}
                        onCheckedChange={(checked) => {
                            uart1Rtcm3Enabled.value = checked.valueOf() as boolean;
                            statusText.value = changeText;
                        }}
                    />
                    <Checkbox
                        id="uart1-enable-nmea"
                        checked={uart1NmeaEnabled.value}
                        onCheckedChange={(checked) => {
                            uart1NmeaEnabled.value = checked.valueOf() as boolean;
                            statusText.value = changeText;
                        }}
                    />
                    <Checkbox
                        id="uart1-enable-nav-sat"
                        checked={uart1UbxNavSat.value}
                        onCheckedChange={(checked) => {
                            uart1UbxNavSat.value = checked.valueOf() as boolean;
                            statusText.value = changeText;
                        }}
                    />
                    <Checkbox
                        id="uart1-enable-1hz"
                        checked={uart1Rtcm3Force1Hz.value}
                        onCheckedChange={(checked) => {
                            uart1Rtcm3Force1Hz.value = checked.valueOf() as boolean;
                            statusText.value = changeText;
                        }}
                    />
                    <Select
                        value={uart1Baud.value.toString()}
                        onValueChange={(value) => {
                            uart1Baud.value = parseInt(value);
                            statusText.value = changeText;
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

                    <div className="justify-self-start text-sm font-medium">UART2:</div>
                    <Checkbox
                        id="uart2-enable-ubx"
                        checked={uart2UbxEnabled.value}
                        onCheckedChange={(checked) => {
                            uart2UbxEnabled.value = checked.valueOf() as boolean;
                            statusText.value = changeText;
                        }}
                    />
                    <Checkbox
                        id="uart2-enable-rtcm3"
                        checked={uart2Rtcm3Enabled.value}
                        onCheckedChange={(checked) => {
                            uart2Rtcm3Enabled.value = checked.valueOf() as boolean;
                            statusText.value = changeText;
                        }}
                    />
                    <Checkbox
                        id="uart2-enable-nmea"
                        checked={uart2NmeaEnabled.value}
                        onCheckedChange={(checked) => {
                            uart2NmeaEnabled.value = checked.valueOf() as boolean;
                            statusText.value = changeText;
                        }}
                    />
                    <Checkbox
                        id="uart2-enable-nav-sat"
                        checked={uart2UbxNavSat.value}
                        onCheckedChange={(checked) => {
                            uart2UbxNavSat.value = checked.valueOf() as boolean;
                            statusText.value = changeText;
                        }}
                    />
                    <Checkbox
                        id="uart2-enable-1hz"
                        checked={uart2Rtcm3Force1Hz.value}
                        onCheckedChange={(checked) => {
                            uart2Rtcm3Force1Hz.value = checked.valueOf() as boolean;
                            statusText.value = changeText;
                        }}
                    />
                    <Select
                        value={uart2Baud.value.toString()}
                        onValueChange={(value) => {
                            uart2Baud.value = parseInt(value);
                            statusText.value = changeText;
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
                </div>
            </CardContent>
            <CardContent className="flex flex-wrap items-center justify-between gap-3 pb-0">
                <StyledButton onClick={onReplicateMPConfigClick}>Replicate MP Config</StyledButton>
                <StyledButton onClick={onTransmitClick}>Transmit Config</StyledButton>
                <StyledButton onClick={onSaveClick}>Save Config</StyledButton>
                <StyledButton onClick={onRefreshClick}>Refresh</StyledButton>
            </CardContent>
            <CardDescription className="flex flex-row justify-between px-6 pt-2">
                <span>Mouse over column headers for more info</span>
                <span className="text-yellow-400">{statusText.value}</span>
            </CardDescription>
        </Card>
    );
}
