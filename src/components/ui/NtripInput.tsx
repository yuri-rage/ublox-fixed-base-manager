import React from 'react';
import { updateAppConfig, appConfig, sendConfig } from '@/globals';
import { Input } from '@/components/ui/input';

export const NtripHostInput = React.forwardRef<HTMLInputElement>((props, ref) => {
    const handleChange = (value: string) => {
        updateAppConfig('ntrip.host', value);
        if (appConfig.value.ntrip.enable) {
            updateAppConfig('ntrip.enable', false);
            sendConfig();
        }
    };

    return (
        <Input
            ref={ref}
            placeholder="Host"
            value={appConfig.value.ntrip.host}
            onChange={(event) => handleChange(event.target.value)}
            {...props}
        />
    );
});

export const NtripMountPointInput = React.forwardRef<HTMLInputElement>((props, ref) => {
    const handleChange = (value: string) => {
        updateAppConfig('ntrip.mountpoint', value);
        if (appConfig.value.ntrip.enable) {
            updateAppConfig('ntrip.enable', false);
            sendConfig();
        }
    };

    return (
        <Input
            ref={ref}
            placeholder="STATION-NAME"
            value={appConfig.value.ntrip.mountpoint}
            onChange={(event) => handleChange(event.target.value)}
            {...props}
        />
    );
});

export const NtripPasswordInput = React.forwardRef<HTMLInputElement>((props, ref) => {
    const handleChange = (value: string) => {
        updateAppConfig('ntrip.password', value);
        if (appConfig.value.ntrip.enable) {
            updateAppConfig('ntrip.enable', false);
            sendConfig();
        }
    };
    return (
        <Input
            ref={ref}
            placeholder="Password"
            value={appConfig.value.ntrip.password}
            onChange={(event) => handleChange(event.target.value)}
            type="password"
            {...props}
        />
    );
});
