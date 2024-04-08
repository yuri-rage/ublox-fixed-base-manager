import { cn } from '@/lib/utils';
import { setLogStatus, loggingStatus } from '@/globals';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { TooltipContainer } from '@/components/ui/TooltipContainer';

export const LogEnableSwitch: React.FC<
    React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>
> = ({ className, ...props }) => {
    const LogEnableSwitchClassName = 'flex items-center justify-start space-x-2';

    const onLoggingChange = (checked: boolean) => {
        loggingStatus.value = checked;
        setLogStatus(loggingStatus.value);
    };

    return (
        <div className={cn(LogEnableSwitchClassName, className)} {...props}>
            <Label>Logging</Label>
            <Switch
                id="logging"
                checked={loggingStatus.value}
                onCheckedChange={(checked) => onLoggingChange(checked.valueOf() as boolean)}
            />
            <TooltipContainer tooltipText="Logs are stored on the Raspberry Pi and contain binary GPS data for PPK analysis.">
                <Label htmlFor="logging" className="cursor-pointer">
                    {loggingStatus.value ? 'Enabled' : 'Disabled'}
                </Label>
            </TooltipContainer>
        </div>
    );
};
