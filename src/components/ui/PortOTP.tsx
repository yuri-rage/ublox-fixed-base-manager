import React from 'react';
import { updateAppConfig, appConfig, sendConfig } from '@/globals';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';

interface PortOTPProps {
    maxLength?: number;
    [key: string]: any;
}

const PortOTP = React.forwardRef<HTMLInputElement, PortOTPProps>(({ maxLength = 4, ...props }, ref) => {
    const slots = Array.from({ length: maxLength }, (_, index) => <InputOTPSlot key={index} index={index} />);

    return (
        <InputOTP ref={ref} maxLength={maxLength} {...props}>
            <InputOTPGroup>{slots}</InputOTPGroup>
        </InputOTP>
    );
});

export const NtripPortOTP = ({ maxLength = 4, ...props }) => {
    const handleChange = (value: string) => {
        updateAppConfig('ntrip.port', parseInt(value) || 0);
        if (value.length < maxLength && appConfig.value.ntrip.enable) {
            updateAppConfig('ntrip.enable', false);
            sendConfig();
        }
    };

    return (
        <PortOTP
            maxLength={maxLength}
            value={appConfig.value.ntrip.port === 0 ? '' : appConfig.value.ntrip.port.toString()}
            onChange={handleChange}
            {...props}
        />
    );
};

export const TcpPortOTP = ({ maxLength = 4, ...props }) => {
    const handleChange = (value: string) => {
        updateAppConfig('tcpRepeater.port', parseInt(value) || 0);
        if (value.length < maxLength && appConfig.value.tcpRepeater.enable) {
            updateAppConfig('tcpRepeater.enable', false);
            sendConfig();
        }
    };

    return (
        <PortOTP
            maxLength={maxLength}
            value={appConfig.value.tcpRepeater.port === 0 ? '' : appConfig.value.tcpRepeater.port.toString()}
            onChange={handleChange}
            {...props}
        />
    );
};
