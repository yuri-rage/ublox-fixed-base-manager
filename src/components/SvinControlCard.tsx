import { signal, useSignalEffect } from '@preact/signals-react';
import { ubx, ubxNavSvinCount, location } from '@/globals';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/ui/card';
import { CoordinateInputs } from '@/components/ui/CoordinateInputs';
import { SvinProgress } from '@/components/ui/SvinProgress';
import { SaveButton } from '@/components/ui/SaveButton';
import { SvinStartStopButton, stopSvin } from '@/components/ui/SvinStartStopButton';
import { UseEnteredCoordsButton } from '@/components/ui/SvinUseEnteredCoordsButton';
import { UseSavedCoordsButton } from '@/components/ui/SvinUseSavedCoordsButton';

const strX = signal('');
const strY = signal('');
const strZ = signal('');
const minAccuracy = signal('');
const lastSvinActiveState = signal(false);
const svinManuallyStopped = signal(false);

export const SvinControlCard = () => {
    useSignalEffect(() => {
        // @ts-ignore
        const _trigger = ubxNavSvinCount.value; // simply to trigger reactivity

        if (ubx.ubxParser.ubxNavSvin.active) {
            strX.value = location.value.latString;
            strY.value = location.value.lngString;
            strZ.value = location.value.alt.toFixed(2);
            minAccuracy.value =
                ubx.ubxParser.ubxCfgTmode3.svinAccLimit > 0
                    ? parseFloat(ubx.ubxParser.ubxCfgTmode3.svinAccLimit.toFixed(4)).toString()
                    : parseFloat(ubx.ubxParser.ubxNavSvin.meanAcc.toFixed(4)).toString();
        }

        // set TMODE3 back to fixed mode on survey completion
        if (lastSvinActiveState.value && !ubx.ubxParser.ubxNavSvin.active) {
            if (!svinManuallyStopped.value) {
                stopSvin();
                toast('Survey-in complete');
            } else {
                toast('Survey-in stopped');
            }
            svinManuallyStopped.value = false;
        }
        lastSvinActiveState.value = ubx.ubxParser.ubxNavSvin.active;
    });

    return (
        <Card>
            <CardContent className="flex flex-col gap-3 p-3">
                <CoordinateInputs strX={strX} strY={strY} strZ={strZ} minAccuracy={minAccuracy} />
                <SvinProgress minAccuracy={minAccuracy} />
                <UseEnteredCoordsButton
                    strX={strX}
                    strY={strY}
                    strZ={strZ}
                    minAccuracy={minAccuracy}
                    svinManuallyStopped={svinManuallyStopped}
                />
                <UseSavedCoordsButton
                    strX={strX}
                    strY={strY}
                    strZ={strZ}
                    minAccuracy={minAccuracy}
                    svinManuallyStopped={svinManuallyStopped}
                />
                <SvinStartStopButton svinManuallyStopped={svinManuallyStopped} minAccuracy={minAccuracy} />
                <SaveButton />
            </CardContent>
        </Card>
    );
};
