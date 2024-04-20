import { BAUD_RATES, requestPorts, serialPorts, appConfig, sendConfig } from '@/globals';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectGroup } from '@/components/ui/select';
import { SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { StyledButton } from '@/components/ui/StyledButton';
import { AboutHoverCard } from '@/components/AboutHoverCard';

export const ConnectionCard = () => {
    const handleSelectChange = (value: string) => {
        const newConfig = { ...appConfig.value };
        newConfig.serial.device = value;
        appConfig.value = newConfig;
    };

    const handleBaudChange = (value: string) => {
        const newConfig = { ...appConfig.value };
        newConfig.serial = newConfig.serial || ({} as { device?: string; baud?: number }); // Add type assertion
        newConfig.serial.baud = parseInt(value) || 0;
        appConfig.value = newConfig;
    };

    return (
        <Card>
            <CardContent className="flex flex-wrap justify-between gap-3 p-3">
                <div className="flex flex-wrap gap-3">
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
                </div>
                <AboutHoverCard />
            </CardContent>
        </Card>
    );
};
