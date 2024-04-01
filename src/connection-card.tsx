import { Card, CardContent } from './components/ui/card';
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { BAUD_RATES, requestPorts, serialPorts, connectedPort, appConfig, sendConfig } from './globals';
import StyledButton from './styled-button';
import { useSignalEffect } from '@preact/signals-react';

export default function ConnectionCard() {
    useSignalEffect(() => {
        if (connectedPort.value === '') {
            return;
        }
        toast('Serial Port Connected', {
            description: `Saved config: ${connectedPort.value}`,
        });
    });

    const handleSelectChange = (value: string) => {
        const newConfig = { ...appConfig.value };
        newConfig.serial.device = value;
        appConfig.value = newConfig;
    };

    const handleBaudChange = (value: string) => {
        const newConfig = { ...appConfig.value };
        newConfig.serial.baud = parseInt(value) || 0;
        appConfig.value = newConfig;
    };

    return (
        <Card>
            <CardContent className="flex flex-wrap gap-3 p-3">
                <Select value={appConfig.value.serial.device} onValueChange={handleSelectChange}>
                    <SelectTrigger className="h-8 w-auto">
                        <SelectValue placeholder="Select a port" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectGroup>
                            {serialPorts.value.map((port: any) => (
                                <SelectItem key={port.path} value={port.path}>
                                    {port.path}
                                </SelectItem>
                            ))}
                        </SelectGroup>
                    </SelectContent>
                </Select>
                <Select value={appConfig.value.serial.baud.toString()} onValueChange={handleBaudChange}>
                    <SelectTrigger className="h-8 w-auto">
                        <SelectValue placeholder="Baud rate" />
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
                <StyledButton onClick={() => sendConfig()}>Connect</StyledButton>
                <StyledButton onClick={() => requestPorts()}>Refresh List</StyledButton>
            </CardContent>
        </Card>
    );
}
