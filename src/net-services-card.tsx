import { Card, CardContent, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { appConfig, updateAppConfig, sendConfig } from './globals';
import { Label } from './components/ui/label';

export default function NetworkServicesCard() {
    function onNtripHostChange(value: string) {
        updateAppConfig('ntrip.host', value);
        if (appConfig.value.ntrip.enable) {
            updateAppConfig('ntrip.enable', false);
            sendConfig();
        }
    }

    function onNtripPortChange(value: string) {
        updateAppConfig('ntrip.port', parseInt(value) || 0);
        if (value.length < 4 && appConfig.value.ntrip.enable) {
            updateAppConfig('ntrip.enable', false);
            sendConfig();
        }
    }

    function onNtripMntPntChange(value: string) {
        updateAppConfig('ntrip.mountpoint', value);
        if (appConfig.value.ntrip.enable) {
            updateAppConfig('ntrip.enable', false);
            sendConfig();
        }
    }

    function onNtripPasswdChange(value: string) {
        updateAppConfig('ntrip.password', value);
        if (appConfig.value.ntrip.enable) {
            updateAppConfig('ntrip.enable', false);
            sendConfig();
        }
    }

    function onNtripChange(checked: boolean) {
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
    }

    function onTcpPortChange(value: string) {
        updateAppConfig('tcpRepeater.port', parseInt(value) || 0);
        if (value.length < 4 && appConfig.value.tcpRepeater.enable) {
            updateAppConfig('tcpRepeater.enable', false);
            sendConfig();
        }
    }

    function onTcpRepeaterChange(checked: boolean) {
        if (appConfig.value.tcpRepeater.port.toString().length < 4) {
            return;
        }
        updateAppConfig('tcpRepeater.enable', checked);
        sendConfig();
    }

    return (
        <Card>
            <CardContent className="flex flex-col space-y-2 p-4">
                <div className="flex justify-between space-x-2">
                    <div className="flex-1">
                        <Input
                            placeholder="Host"
                            value={appConfig.value.ntrip.host}
                            onChange={(event) => onNtripHostChange(event.target.value)}
                        />
                    </div>
                    <div className="flex-1">
                        <InputOTP
                            id="ntrip-port"
                            maxLength={4}
                            value={
                                appConfig.value.ntrip.port === 0 ? '' : appConfig.value.ntrip.port.toString()
                            }
                            onChange={onNtripPortChange}
                        >
                            <InputOTPGroup>
                                <InputOTPSlot index={0} />
                                <InputOTPSlot index={1} />
                                <InputOTPSlot index={2} />
                                <InputOTPSlot index={3} />
                            </InputOTPGroup>
                        </InputOTP>
                    </div>
                </div>
                <div className="flex justify-between space-x-2">
                    <div className="flex-1">
                        <Input
                            placeholder="STATION-NAME"
                            value={appConfig.value.ntrip.mountpoint}
                            onChange={(event) => onNtripMntPntChange(event.target.value)}
                        />
                    </div>
                    <div className="flex-1">
                        <Input
                            placeholder="Password"
                            value={appConfig.value.ntrip.password}
                            onChange={(event) => onNtripPasswdChange(event.target.value)}
                            type="password"
                        />
                    </div>
                </div>
                <CardDescription className="px-1 font-mono">
                    ntrips://:
                    {appConfig.value.ntrip.password === ''
                        ? '-'
                        : '*'.repeat(appConfig.value.ntrip.password.length)}
                    @rtk2go.com:2101/
                    {appConfig.value.ntrip.mountpoint === ''
                        ? 'STATION-NAME'
                        : appConfig.value.ntrip.mountpoint}
                </CardDescription>
            </CardContent>
            <CardContent className="items-top flex space-x-2">
                <Checkbox
                    id="ntrip"
                    checked={appConfig.value.ntrip.enable}
                    onCheckedChange={(checked) => onNtripChange(checked.valueOf() as boolean)}
                />
                <div className="grid gap-1.5 leading-none">
                    <Label htmlFor="ntrip">Enable NTRIP Transport</Label>
                    <p className="text-sm text-muted-foreground">
                        Transmits RTCM3 to an NTRIP caster service.
                    </p>
                </div>
            </CardContent>
            <CardContent className="items-top flex space-x-2">
                <Checkbox
                    id="tcp-repeater"
                    checked={appConfig.value.tcpRepeater.enable}
                    onCheckedChange={(checked) => onTcpRepeaterChange(checked.valueOf() as boolean)}
                />
                <div className="grid gap-1.5 leading-none">
                    <Label htmlFor="tcp-repeater">Enable local network repeater</Label>
                    <div className="flex flex-wrap items-center gap-3 py-1">
                        <Label htmlFor="tcp-port">Port:</Label>
                        <InputOTP
                            id="tcp-port"
                            maxLength={4}
                            value={
                                appConfig.value.tcpRepeater.port === 0
                                    ? ''
                                    : appConfig.value.tcpRepeater.port.toString()
                            }
                            onChange={onTcpPortChange}
                        >
                            <InputOTPGroup>
                                <InputOTPSlot index={0} />
                                <InputOTPSlot index={1} />
                                <InputOTPSlot index={2} />
                                <InputOTPSlot index={3} />
                            </InputOTPGroup>
                        </InputOTP>
                    </div>
                    <p className="text-sm text-muted-foreground">
                        Allows local network (TCP) connection to u-Center, Mission Planner, etc.
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}
