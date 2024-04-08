import React from 'react';
import { toast } from 'sonner';
import { sendConfig, ubx, updateAppConfig } from '@/globals';
import { ConfirmButton } from '@/components/ui/ConfirmButton';
import { signal } from '@preact/signals-react';

export const lastSavedMs = signal(0);

export const SaveButton = React.forwardRef<HTMLButtonElement, React.PropsWithChildren>(
    ({ children, ...props }, ref) => {
        const onSaveClick = () => {
            if (ubx.ubxParser.ubxNavSvin.active) {
                toast('Stop survey-in first');
                return;
            }
            ubx.write(ubx.generate.saveConfig());
            updateAppConfig('savedLocation.ecefXOrLat', ubx.ubxParser.ubxCfgTmode3.ecefXOrLatHP);
            updateAppConfig('savedLocation.ecefYOrLon', ubx.ubxParser.ubxCfgTmode3.ecefYOrLonHP);
            updateAppConfig('savedLocation.ecefZOrAlt', ubx.ubxParser.ubxCfgTmode3.ecefZOrAltHP);
            updateAppConfig('savedLocation.fixedPosAcc', ubx.ubxParser.ubxCfgTmode3.fixedPosAcc);
            sendConfig();
            toast('Configuration saved');
            lastSavedMs.value = Date.now();
        };

        return (
            <ConfirmButton
                ref={ref}
                alertTitle="Save to Non-Volatile Memory?"
                alertDescription="This action cannot be undone."
                onClick={onSaveClick}
                {...props}
            >
                {children || 'Save Config'}
            </ConfirmButton>
        );
    },
);
