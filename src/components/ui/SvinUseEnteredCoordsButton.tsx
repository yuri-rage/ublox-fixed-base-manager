import React from 'react';
import { Signal } from '@preact/signals-react';
import { toast } from 'sonner';
import { ubx } from '@/globals';
import { UBX } from '@/core/ublox-interface';
import { CoordinateTranslator } from '@/core/coordinate-translator';
import { ConfirmButton } from '@/components/ui/ConfirmButton';
import { stopSvinByUser } from '@/components/ui/SvinStartStopButton';

export const setLocationCoords = (
    strValueX: string,
    strValueY: string,
    strValueZ: string,
    strValueMinAccuracy: string,
    svinManuallyStopped: Signal<boolean>,
) => {
    const translator = new CoordinateTranslator('0', '0', '0');
    if (ubx.ubxParser.ubxNavSvin.active) {
        stopSvinByUser(svinManuallyStopped);
        return;
    }
    if (!strValueX || !strValueY || !strValueZ) {
        toast('Coordinate values cannot be empty');
        return;
    }
    if (!strValueMinAccuracy) {
        toast('Enter observed accuracy value');
        return;
    }

    translator.parse(strValueX, strValueY, strValueZ);

    if (translator.wasEcef) {
        ubx.write(
            ubx.generate.configFixedModeECEF(
                translator.ecefX,
                translator.ecefY,
                translator.ecefZ,
                parseFloat(strValueMinAccuracy),
            ),
        );
    } else {
        ubx.write(
            ubx.generate.configFixedModeLLA(
                translator.lat,
                translator.lng,
                translator.alt,
                parseFloat(strValueMinAccuracy),
            ),
        );
    }

    ubx.write(ubx.generate.configNavStationary(false));
    ubx.write(ubx.generate.poll(UBX.CFG.CLASS, UBX.CFG.TMODE3));
    toast(
        `Using fixed mode at<pre>${translator.latString}\n${translator.lngString}\n${translator.alt.toFixed(2)} (${translator.altFeet.toFixed(1)}')</pre>`,
    );
};

interface UseEnteredCoordsButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    strX: Signal<string>;
    strY: Signal<string>;
    strZ: Signal<string>;
    minAccuracy: Signal<string>;
    svinManuallyStopped: Signal<boolean>;
}

export const UseEnteredCoordsButton = React.forwardRef<HTMLButtonElement, UseEnteredCoordsButtonProps>(
    ({ strX, strY, strZ, minAccuracy, svinManuallyStopped, children, ...props }, ref) => {
        return (
            <ConfirmButton
                ref={ref}
                alertTitle="Confirm Location Change"
                alertDescription="This will begin using the entered coordinates for the fixed base location"
                onClick={() =>
                    setLocationCoords(
                        strX.value,
                        strY.value,
                        strZ.value,
                        minAccuracy.value,
                        svinManuallyStopped,
                    )
                }
                {...props}
            >
                {children || 'Use Above Coordinates'}
            </ConfirmButton>
        );
    },
);
