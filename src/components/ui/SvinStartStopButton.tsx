import React from 'react';
import { Signal, computed } from '@preact/signals-react';
import { toast } from 'sonner';
import { ubx, ubxNavSvinCount, MIN_SVIN_TIME } from '@/globals';
import { UBX } from '@/core/ublox-interface';
import { ConfirmButton } from '@/components/ui/ConfirmButton';

const startSvin = (strMinAccuracy: string, desiredAccuracyValue: number) => {
    let acc = parseFloat(strMinAccuracy) * 1e4;
    if (isNaN(acc) || acc === 0) {
        acc = 0.02;
    }
    ubx.write(ubx.generate.configNavStationary());
    ubx.write(ubx.generate.startSurveyIn(MIN_SVIN_TIME, desiredAccuracyValue));
    ubx.write(ubx.generate.poll(UBX.CFG.CLASS, UBX.CFG.TMODE3));
    toast(`Starting Survey-in (${MIN_SVIN_TIME} seconds, minimum)`);
};

export const stopSvin = () => {
    ubx.write(ubx.generate.configNavStationary(false));
    const x = ubx.ubxParser.ubxNavSvin.meanXHP;
    const y = ubx.ubxParser.ubxNavSvin.meanYHP;
    const z = ubx.ubxParser.ubxNavSvin.meanZHP;
    const acc = ubx.ubxParser.ubxNavSvin.meanAcc;
    ubx.write(ubx.generate.configFixedModeECEF(x, y, z, acc));
    ubx.write(ubx.generate.poll(UBX.CFG.CLASS, UBX.CFG.TMODE3));
};

export const stopSvinByUser = (svinManuallyStopped: Signal<boolean>) => {
    svinManuallyStopped.value = true;
    stopSvin();
};

const onStartStopClick = (
    strMinAccuracy: string,
    desiredAccuracyValue: number,
    svinManuallyStopped: Signal<boolean>,
) => {
    if (ubx.ubxParser.ubxNavSvin.active) {
        stopSvinByUser(svinManuallyStopped);
        return;
    }
    startSvin(strMinAccuracy, desiredAccuracyValue);
};

interface SvinStartStopButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    svinManuallyStopped: Signal<boolean>;
    minAccuracy: Signal<string>;
}

// using forwardRef here is probably more correct, but it breaks signal reactivity
export const SvinStartStopButton: React.FC<SvinStartStopButtonProps> = ({
    svinManuallyStopped,
    minAccuracy,
    children,
    ...props
}) => {
    const svinButtonText = computed(() => {
        // @ts-ignore
        const _trigger = ubxNavSvinCount.value; // simply to trigger reactivity
        return ubx.ubxParser.ubxNavSvin.active ? 'Stop Survey-in' : 'Start Survey-in';
    });
    const desiredAccuracy = computed(() => {
        const val = parseFloat(minAccuracy.value);
        if (isNaN(val) || val === 0) return 0.02 * 1e4;
        return Math.floor(parseFloat(minAccuracy.value) * 1e4);
    });

    return (
        <ConfirmButton
            alertTitle={`${svinButtonText.value}?`}
            alertDescription={`This will immediately ${svinButtonText.value.split(' ')[0].toLowerCase()} the survey-in process`}
            onClick={() => onStartStopClick(minAccuracy.value, desiredAccuracy.value, svinManuallyStopped)}
            {...props}
        >
            {children || svinButtonText.value}
        </ConfirmButton>
    );
};
