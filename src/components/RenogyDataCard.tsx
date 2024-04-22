import { useEffect } from 'react';
import { computed, useSignal } from '@preact/signals-react';
import { BATT_TYPE, FAULT_CODE } from '@/core/renogy-data';
import { renogy, renogyUpdateCount, socket } from '@/globals';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectGroup } from '@/components/ui/select';
import { SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SimpleAlertDialog } from './ui/SimpleAlertDialog';
import { StyledButton } from '@/components/ui/StyledButton';
import { TooltipContainer } from '@/components/ui/TooltipContainer';

// TODO: maybe use Ah Today * average of vMin and vMax to calculate consumed Wh Today

export const RenogyDataCard = () => {
    const dialogOpen = useSignal(false);
    const userBattType = useSignal('');
    const tempSelection = useSignal('');
    const faultIndex = useSignal(0);
    const faultText = useSignal('');

    const nextFault = (faultBitmask: number, idx: number) => {
        const bitStr = faultBitmask.toString(2).split('').reverse().join('');
        const count = bitStr.split('').filter((bit) => bit === '1').length;
        if (count === 0) return [0, 0];
        idx = bitStr.indexOf('1', idx + 1);
        if (idx < 0 && count > 0) {
            idx = bitStr.indexOf('1', 0);
        }
        return [idx, count];
    };

    useEffect(() => {
        const [idx, count] = nextFault(renogy.faultBitmask || 0, faultIndex.value);
        faultIndex.value = idx;
        faultText.value = `Faults (${count}): E${idx.toString().padStart(2, '0')} ${FAULT_CODE[idx]}`;
    }, [renogyUpdateCount.value]);

    const lastUpdated = computed(() => {
        if (renogyUpdateCount.value === 0) return 'Awaiting update...';
        return new Date().toLocaleTimeString();
    });

    const handleBattTypeSelect = (value: string) => {
        tempSelection.value = value;
        dialogOpen.value = true;
    };

    const handleBattTypeConfirm = () => {
        userBattType.value = tempSelection.value;
        socket.emit('renogySetBattType', parseInt(userBattType.value));
        dialogOpen.value = false;
    };

    const fmt = (
        label: string,
        value: number | null,
        unit: string = '',
        labelPad: number = 0,
        valuePad: number = 0,
        fixed: number,
    ) => {
        if (value && unit === 'A' && value < 1) {
            value *= 1000;
            unit = 'mA';
            fixed = 0;
        }
        const valueStr = value !== null ? `${value.toFixed(fixed).padStart(valuePad, ' ')}${unit}` : '';
        return `${label.padEnd(labelPad, ' ')}: ${valueStr}`;
    };

    const load5V = renogy.loadV === null || renogy.loadC === null ? null : (renogy.loadV * renogy.loadC) / 5;

    return (
        <Card className="text-sm">
            {/* // TODO: remove the console debug button and the wrapping div */}
            <div className="flex flex-row items-center justify-between pr-5">
                <CardHeader className="px-4 pb-0 pt-4">
                    <CardTitle>Renogy Solar Charge Controller</CardTitle>
                    <CardDescription className="flex flex-col font-mono">
                        {renogy.controllerModel} hw{renogy.hardwareVersion} fw{renogy.softwareVersion}
                        <span>Last data: {lastUpdated.value}</span>
                        {(renogy.faultBitmask ?? 0) > 0 && (
                            <span className="text-yellow-400">{faultText.value}</span>
                        )}
                    </CardDescription>
                </CardHeader>
                <StyledButton onClick={() => renogy.printAllData()}>Print to console</StyledButton>
            </div>
            <CardContent className="p-3">
                <div className="flex flex-row gap-3">
                    <div className="flex flex-col justify-between gap-3">
                        <Card>
                            <CardHeader className="px-4 pb-0 pt-4">
                                <CardTitle>Battery</CardTitle>
                                <CardDescription className="flex flex-col font-mono">
                                    {renogy.battType ? `(${renogy.battType})` : ''}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="px-4 py-2">
                                <pre>{fmt('Voltage', renogy.battV, 'V', 16, 4, 1)}</pre>
                                <pre>{fmt('Current (in)', renogy.battC, 'A', 16, 4, 1)}</pre>
                                <pre>{fmt('Min Today', renogy.battVMinToday, 'V', 16, 4, 1)}</pre>
                                <pre>{fmt('Max Today', renogy.battVMaxToday, 'V', 16, 4, 1)}</pre>
                                <TooltipContainer tooltipText="Load will be switched off when battery voltage falls below this value.">
                                    <pre>
                                        {fmt('Low Volt Cutoff', renogy.overDischargeVoltage, 'V', 16, 4, 1)}
                                    </pre>
                                </TooltipContainer>
                                <pre>
                                    {fmt('Over Discharges', renogy.totalBattOverDischarges, '', 16, 4, 0)}
                                </pre>
                                <pre>{fmt('Full Charges', renogy.totalBattFullCharges, '', 16, 4, 0)}</pre>
                                <div className="flex flex-row items-center space-x-2 pt-1">
                                    <Progress value={renogy.battSoC} />
                                    <pre>{renogy.battSoC?.toFixed(0)}%</pre>
                                </div>
                            </CardContent>
                        </Card>
                        <Select value={userBattType.value} onValueChange={handleBattTypeSelect}>
                            <SelectTrigger className="h-8 w-auto">
                                <SelectValue placeholder="Change battery type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    {/* exclude BATT_TYPE[0] */}
                                    {BATT_TYPE.slice(1).map((bType, index) => (
                                        <SelectItem key={index + 1} value={(index + 1).toString()}>
                                            {bType}
                                        </SelectItem>
                                    ))}
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </div>
                    <Card>
                        <CardHeader className="px-4 pb-0 pt-4">
                            <CardTitle>Load</CardTitle>
                            <CardDescription className="flex flex-col font-mono">
                                {renogy.loadMode ? `(${renogy.loadMode})` : ''}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="px-4 py-2">
                            <pre>{fmt('Voltage', renogy.loadV, 'V', 9, 4, 1)}</pre>
                            <pre>{fmt('Current', renogy.loadC, 'A', 9, 4, 1)}</pre>
                            <pre>{fmt('Power', renogy.loadP, 'W', 9, 4, 1)}</pre>
                            <TooltipContainer tooltipText="If the only load is USB, this is the USB outlet current. If other loads are attached, this value is erroneous.">
                                <pre>{fmt('Draw (5V)', load5V, 'A', 9, 4, 1)}</pre>
                            </TooltipContainer>
                            <pre>{fmt('Cur Peak', renogy.dischgCMaxToday, 'A', 9, 4, 1)}</pre>
                            <pre>{fmt('Pwr Peak', renogy.dischgPMaxToday, 'W', 9, 4, 1)}</pre>
                            <pre className="text-muted-foreground">-- Consumption --</pre>
                            <pre>{fmt('Ah Today', renogy.dischgAHToday, 'Ah', 9, 6, 1)}</pre>
                            <pre>{fmt('Wh Today', renogy.dischgWHToday, 'Wh', 9, 6, 1)}</pre>
                            <pre>{fmt('Ah Total', renogy.totalDischargeAH, 'Ah', 9, 6, 1)}</pre>
                            <pre>{fmt('Wh Total', renogy.cumulativePowerConsumed, 'Wh', 9, 6, 1)}</pre>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="px-4 pb-0 pt-4">
                            <CardTitle>Charge Controller</CardTitle>
                            <CardDescription className="flex flex-col font-mono">
                                {renogy.chargingState ? `(${renogy.chargingState})` : ''}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="px-4 py-2">
                            <pre>{fmt('Voltage', renogy.solarV, 'V', 9, 4, 1)}</pre>
                            <pre>{fmt('Current', renogy.solarC, 'A', 9, 4, 1)}</pre>
                            <pre>{fmt('Power', renogy.solarP, 'W', 9, 4, 1)}</pre>
                            <pre>{fmt('Temp', renogy.controlT, '°C', 9, 4, 1)}</pre>
                            <pre>{fmt('Cur Peak', renogy.chgCMaxToday, 'A', 9, 4, 1)}</pre>
                            <pre>{fmt('Pwr Peak', renogy.chgPMaxToday, 'W', 9, 4, 1)}</pre>
                            <pre className="text-muted-foreground">-- Generation --</pre>
                            <pre>{fmt('Ah Today', renogy.chgAHToday, 'Ah', 9, 6, 1)}</pre>
                            <pre>{fmt('Wh Today', renogy.chgWHToday, 'Wh', 9, 6, 1)}</pre>
                            <pre>{fmt('Ah Total', renogy.totalChargeAH, 'Ah', 9, 6, 1)}</pre>
                            <pre>{fmt('Wh Total', renogy.cumulativePowerGenerated, 'Wh', 9, 6, 1)}</pre>
                        </CardContent>
                    </Card>
                </div>
                {/* Conditionally rendered confirm dialog for changing battery type */}
                <SimpleAlertDialog
                    triggerSignal={dialogOpen}
                    onContinue={handleBattTypeConfirm}
                    alertTitle={`Change battery type to '${BATT_TYPE[parseInt(tempSelection.value)]}'?`}
                    alertDescription="Changing battery type will alter charging behavior and voltage thresholds.
                                    Some historical data may be lost."
                />
            </CardContent>
        </Card>
    );
};
