import { Signal, computed, signal } from '@preact/signals-react';
import { ubx, ubxNavSvinCount } from '@/globals';
import { Progress } from '@/components/ui/progress';

interface SvinProgressProps {
    minAccuracy: Signal<string>;
}

const svinStartAccuracy = signal(0);

export const SvinProgress: React.FC<SvinProgressProps> = ({ minAccuracy }) => {
    const svinProgress = computed(() => {
        // @ts-ignore
        const _trigger = ubxNavSvinCount.value; // simply to trigger reactivity
        if (!ubx.ubxParser.ubxNavSvin.active) {
            return 0;
        }

        // update initial progress bar value
        if (svinStartAccuracy.value < ubx.ubxParser.ubxNavSvin.meanAcc) {
            const newStartVal =
                ubx.ubxParser.ubxNavSvin.meanAcc > 90000 ? 0 : ubx.ubxParser.ubxNavSvin.meanAcc;
            svinStartAccuracy.value = ubx.ubxParser.ubxNavSvin.active ? newStartVal : 0;
        }

        const progress =
            1 -
            (ubx.ubxParser.ubxNavSvin.meanAcc - parseFloat(minAccuracy.value)) /
                (svinStartAccuracy.value - parseFloat(minAccuracy.value));

        // show slow progress at first, making smaller increments near 100% more visible
        return Math.pow(progress, 8) * 100;
    });

    return <Progress hidden={!ubx.ubxParser.ubxNavSvin.active} value={svinProgress.value} />;
};
