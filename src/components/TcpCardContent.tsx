import { appConfig, updateAppConfig, sendConfig } from '@/globals';
import { CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { TcpPortOTP } from '@/components/ui/PortOTP';
import { TooltipContainer } from '@/components/ui/TooltipContainer';

export const TcpCardContent = () => {
    const handleChange = (checked: boolean) => {
        if (appConfig.value.tcpRepeater.port.toString().length < 4) {
            return;
        }
        updateAppConfig('tcpRepeater.enable', checked);
        sendConfig();
    };
    return (
        <CardContent className="flex flex-col px-5 pb-4">
            <TooltipContainer tooltipText="Allows local network (TCP) connection to u-Center, Mission Planner, etc.">
                <div className="flex items-center justify-start space-x-2">
                    <Label>Local Network Repeater</Label>
                    <Switch
                        id="tcp-repeater"
                        checked={appConfig.value.tcpRepeater.enable}
                        onCheckedChange={(checked) => handleChange(checked.valueOf() as boolean)}
                    />
                    <Label htmlFor="tcp-repeater" className="cursor-pointer">
                        {appConfig.value.tcpRepeater.enable ? 'Enabled' : 'Disabled'}
                    </Label>
                </div>
            </TooltipContainer>
            <div className="flex flex-wrap items-center gap-3 pt-3">
                <Label htmlFor="tcp-port">TCP Port:</Label>
                <TcpPortOTP id="tcp-port" />
            </div>
        </CardContent>
    );
};
