import { useSignal } from '@preact/signals-react';
import { appConfig, updateAppConfig, sendConfig, serialPorts } from '@/globals';
import { CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectGroup } from '@/components/ui/select';
import { SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { TooltipContainer } from '@/components/ui/TooltipContainer';

export const RenogyCardContent = () => {
    const lowVoltageCutoff = useSignal(appConfig.value.renogySolar.lowVoltageCutoff.toString());

    const handleEnableChange = (checked: boolean) => {
        if (appConfig.value.renogySolar.port === '') return;
        let v = parseFloat(lowVoltageCutoff.value);
        if (isNaN(v) || v < 0) v = 0;
        appConfig.value.renogySolar.lowVoltageCutoff = parseFloat(v.toFixed(1));
        lowVoltageCutoff.value = appConfig.value.renogySolar.lowVoltageCutoff.toString();
        updateAppConfig('renogySolar.enable', checked);
        sendConfig();
    };
    const handleSelectChange = (value: string) => {
        updateAppConfig('renogySolar.enable', false);
        updateAppConfig('renogySolar.port', value);
        sendConfig();
    };

    const handleCutoffChange = (value: string) => {
        lowVoltageCutoff.value = value;
        updateAppConfig('renogySolar.enable', false);
        updateAppConfig('renogySolar.lowVoltageCutoff', value);
    };

    return (
        <CardContent className="flex flex-col px-5 pb-4 pt-4">
            <TooltipContainer tooltipText="Enables Renogy solar charge controller features.">
                <div className="flex items-center justify-start space-x-2 pb-3">
                    <Label>Renogy Charge Controller</Label>
                    <Switch
                        id="renogy"
                        checked={appConfig.value.renogySolar.enable}
                        onCheckedChange={(checked) => handleEnableChange(checked.valueOf() as boolean)}
                    />
                    <Label htmlFor="renogy" className="cursor-pointer">
                        {appConfig.value.renogySolar.enable ? 'Enabled' : 'Disabled'}
                    </Label>
                </div>
            </TooltipContainer>
            <div className="flex flex-row items-center space-x-2 pb-3">
                <Label htmlFor="renogy-port">Port:</Label>
                <Select value={appConfig.value.renogySolar.port} onValueChange={handleSelectChange}>
                    <SelectTrigger className="h-8">
                        <SelectValue placeholder="Select a port" />
                    </SelectTrigger>
                    <SelectContent id="renogy-port">
                        <SelectGroup>
                            {serialPorts.value.map((port: any) => (
                                <SelectItem key={port.path} value={port.path}>
                                    {port.path}
                                </SelectItem>
                            ))}
                        </SelectGroup>
                    </SelectContent>
                </Select>
            </div>
            <TooltipContainer tooltipText="Enables OS shutdown below this threshold. Set 0 to disable.">
                <div className="flex flex-row items-center space-x-2">
                    <Label className="whitespace-nowrap" htmlFor="renogy-cutoff">
                        Low Voltage Cutoff:
                    </Label>
                    <Input
                        id="renogy-cutoff"
                        placeholder="Low voltage cutoff"
                        value={lowVoltageCutoff.value}
                        onChange={(event) => handleCutoffChange(event.target.value)}
                        onBlur={() => handleEnableChange(appConfig.value.renogySolar.enable)}
                    />
                </div>
            </TooltipContainer>
        </CardContent>
    );
};
