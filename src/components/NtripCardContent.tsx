import { appConfig, updateAppConfig, sendConfig } from '@/globals';
import { CardContent, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { NtripHostInput, NtripMountPointInput, NtripPasswordInput } from '@/components/ui/NtripInput';
import { NtripPortOTP } from '@/components/ui/PortOTP';
import { TooltipContainer } from '@/components/ui/TooltipContainer';

export const NtripCardContent = () => {
    const handleChange = (checked: boolean) => {
        if (
            appConfig.value.ntrip.host === '' ||
            appConfig.value.ntrip.port.toString().length < 4 ||
            appConfig.value.ntrip.mountpoint === ''
            // allow blank password
        ) {
            return;
        }
        updateAppConfig('ntrip.enable', checked);
        sendConfig();
    };

    return (
        <>
            <CardContent className="flex flex-col space-y-2 p-4">
                <div className="flex justify-between space-x-2">
                    <div className="flex-1">
                        <NtripHostInput />
                    </div>
                    <div className="flex-1">
                        <NtripPortOTP />
                    </div>
                </div>
                <div className="flex justify-between space-x-2">
                    <div className="flex-1">
                        <NtripMountPointInput />
                    </div>
                    <div className="flex-1">
                        <NtripPasswordInput />
                    </div>
                </div>
                <CardDescription className="px-1 font-mono">
                    ntrips://:
                    {appConfig.value.ntrip.password === ''
                        ? '-'
                        : '*'.repeat(appConfig.value.ntrip.password.length)}
                    @{appConfig.value.ntrip.host === '' ? 'rtk2go.com' : appConfig.value.ntrip.host}:
                    {appConfig.value.ntrip.port}/
                    {appConfig.value.ntrip.mountpoint === ''
                        ? 'STATION-NAME'
                        : appConfig.value.ntrip.mountpoint}
                </CardDescription>
            </CardContent>
            <CardContent className="px-5 pt-0">
                <TooltipContainer tooltipText="Transmits RTCM3 to an NTRIP caster service.">
                    <div className="flex items-center justify-start space-x-2">
                        <Label>NTRIP Transport Service</Label>
                        <Switch
                            id="ntrip"
                            checked={appConfig.value.ntrip.enable}
                            onCheckedChange={(checked) => handleChange(checked.valueOf() as boolean)}
                        />
                        <Label htmlFor="ntrip" className="cursor-pointer">
                            {appConfig.value.ntrip.enable ? 'Enabled' : 'Disabled'}
                        </Label>
                    </div>
                </TooltipContainer>
            </CardContent>
        </>
    );
};
