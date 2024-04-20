import { computed } from '@preact/signals-react';
import { renogy, renogyUpdateCount } from '@/globals';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { TooltipContainer } from '@/components/ui/TooltipContainer';
import { StyledButton } from './ui/StyledButton';

export const RenogyDataCard = () => {
    const lastUpdated = computed(() => {
        if (renogyUpdateCount.value === 0) return 'Awaiting update...';
        return new Date().toLocaleTimeString();
    });

    const fmt = (
        label: string,
        value: number | null,
        unit: string = '',
        labelPad: number = 0,
        valuePad: number = 0,
        fixed: number,
    ) => {
        const valueStr = value !== null ? `${value.toFixed(fixed).padStart(valuePad, ' ')}${unit}` : '';
        return `${label.padEnd(labelPad, ' ')}: ${valueStr}`;
    };

    return (
        <Card className="text-sm">
            <div className="flex flex-row items-center">
                <CardHeader className="px-4 pb-0 pt-4">
                    <CardTitle>Renogy Solar Charge Controller</CardTitle>
                    <CardDescription className="flex flex-col font-mono">
                        {renogy.controllerModel} hw{renogy.hardwareVersion} fw{renogy.softwareVersion}{' '}
                        {renogy.FaultCodes
                            ? `Fault Codes: 0x${renogy.FaultCodes.toString(16).padStart(4, '0')}`
                            : ''}
                        <span>Last data: {lastUpdated.value}</span>
                    </CardDescription>
                </CardHeader>
                <StyledButton onClick={() => renogy.printAllData()}>Print to console</StyledButton>
            </div>
            <CardContent className="p-3">
                <div className="flex flex-row gap-3">
                    <Card>
                        <CardContent className="px-4 py-2">
                            <div className="pb-2">
                                <Label>Battery</Label>
                            </div>
                            <pre>{fmt('Voltage', renogy.battV, 'V', 10, 4, 1)}</pre>
                            <pre>{fmt('Current', renogy.battC, 'A', 10, 4, 1)}</pre>
                            <pre>{fmt('Min Today', renogy.battVMinToday, 'V', 10, 4, 1)}</pre>
                            <pre>{fmt('Max Today', renogy.battVMaxToday, 'V', 10, 4, 1)}</pre>
                            <pre>{fmt('Over Discharges', renogy.totalBattOverDischarges, '', 16, 2, 0)}</pre>
                            <pre>{fmt('Full Charges', renogy.totalBattFullCharges, '', 16, 2, 0)}</pre>
                            <div className="flex flex-row items-center space-x-2 pt-1">
                                <Progress value={renogy.battCap} />
                                <pre>{renogy.battCap?.toFixed(0)}%</pre>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="px-4 py-2">
                            <div className="pb-2">
                                <Label>Load</Label>
                            </div>
                            <pre>{fmt('Voltage', renogy.loadV, 'V', 9, 4, 1)}</pre>
                            <pre>{fmt('Current', renogy.loadC, 'A', 9, 4, 1)}</pre>
                            <pre>{fmt('Power', renogy.loadP, 'W', 9, 4, 1)}</pre>
                            <TooltipContainer tooltipText="If the only load is USB, this is the USB outlet current. If other loads are attached, this value is erroneous.">
                                <pre>{fmt('USB Draw', (renogy.loadP ?? 0) / 5, 'A', 9, 4, 1)}</pre>
                            </TooltipContainer>
                            <pre>{fmt('Ah Today', renogy.dischgAHToday, 'Ah', 9, 4, 1)}</pre>
                            <pre>{fmt('Wh Today', renogy.dischgWHToday, 'Wh', 9, 4, 1)}</pre>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="px-4 py-2">
                            <div className="pb-2">
                                <Label>Charger</Label>
                            </div>
                            <pre>{fmt('Voltage', renogy.solarV, 'V', 9, 4, 1)}</pre>
                            <pre>{fmt('Current', renogy.solarC, 'A', 9, 4, 1)}</pre>
                            <pre>{fmt('Power', renogy.solarP, 'W', 9, 4, 1)}</pre>
                            <pre>{fmt('Ah Today', renogy.chgAHToday, 'Ah', 9, 4, 1)}</pre>
                            <pre>{fmt('Wh Today', renogy.chgWHToday, 'Wh', 9, 4, 1)}</pre>
                            <pre>{fmt('Temp', renogy.controlT, '°C', 9, 4, 1)}</pre>
                            <pre>
                                {fmt('State', renogy.chargingState, '', 9, 0, 0)
                                    .replace('0', 'Idle')
                                    .replace('1', 'Charging')}
                            </pre>
                        </CardContent>
                    </Card>
                </div>
            </CardContent>
        </Card>
    );
};
