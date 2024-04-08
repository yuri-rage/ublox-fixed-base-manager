import React from 'react';
import { Signal } from '@preact/signals-react';
import { toast } from 'sonner';
import { appConfig, ubx } from '@/globals';
import { ConfirmButton } from '@/components/ui/ConfirmButton';
import { setLocationCoords } from '@/components/ui/SvinUseEnteredCoordsButton';

export const onUseSavedCoordsClick = (
    strX: Signal<string>,
    strY: Signal<string>,
    strZ: Signal<string>,
    minAccuracy: Signal<string>,
    svinManuallyStopped: Signal<boolean>,
) => {
    if (ubx.ubxParser.ubxNavSvin.active) {
        toast('Stop survey-in first');
        return;
    }
    strX.value = appConfig.value.savedLocation.ecefXOrLat.toString();
    strY.value = appConfig.value.savedLocation.ecefYOrLon.toString();
    strZ.value = appConfig.value.savedLocation.ecefZOrAlt.toString();
    minAccuracy.value = appConfig.value.savedLocation.fixedPosAcc.toString();
    setLocationCoords(strX.value, strY.value, strZ.value, minAccuracy.value, svinManuallyStopped);
};

interface UseSavedCoordsButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    strX: Signal<string>;
    strY: Signal<string>;
    strZ: Signal<string>;
    minAccuracy: Signal<string>;
    svinManuallyStopped: Signal<boolean>;
}

export const UseSavedCoordsButton = React.forwardRef<HTMLButtonElement, UseSavedCoordsButtonProps>(
    ({ strX, strY, strZ, minAccuracy, svinManuallyStopped, children, ...props }, ref) => {
        return (
            <ConfirmButton
                ref={ref}
                alertTitle="Retrieve Saved Coords?"
                alertDescription="This will use the last saved coordinates from the configuration file"
                onClick={() => onUseSavedCoordsClick(strX, strY, strZ, minAccuracy, svinManuallyStopped)}
                {...props}
            >
                {children || 'Use Last Saved Coordinates'}
            </ConfirmButton>
        );
    },
);
