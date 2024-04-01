import { toast } from 'sonner';
import { Card, CardContent } from './components/ui/card';
import StyledButton from './styled-button';
import { UBX } from './lib/ublox-interface';
import { ubx, ubxNavSvinCount } from './globals';
import { Input } from './components/ui/input';
import { computed, signal, useSignal, useSignalEffect } from '@preact/signals-react';
import { Progress } from './components/ui/progress';

// TODO: implement input boxes for coords
// TODO: toast min accuracy if user fails to provide it
// TODO: convert coordinates to ECEF if user provides lat/lon

const svinStartAccuracy = signal(0);

export default function SvinControlCard() {
    const locX = useSignal(0);
    const locY = useSignal(0);
    const locZ = useSignal(0);
    const minAccuracy = useSignal(5);
    
    const newSvin = useSignal(false);

    const svinButtonText = computed(() => {
        // @ts-ignore
        const _count = ubxNavSvinCount.value; // simply to trigger reactivity
        return ubx.ubxParser.ubxNavSvin.active ? 'Stop Survey-in' : 'Start Survey-in';
    });

    const svinProgress = computed(() => {
        // @ts-ignore
        const _count = ubxNavSvinCount.value; // simply to trigger reactivity
        if (!ubx.ubxParser.ubxNavSvin.active) {
            return 0;
        }
        const progress =
            1 -
            (ubx.ubxParser.ubxNavSvin.meanAcc - minAccuracy.value) /
                (svinStartAccuracy.value - minAccuracy.value);
        return progress * 100;
    });

    useSignalEffect(() => {
        // @ts-ignore
        const _count = ubxNavSvinCount.value; // simply to trigger reactivity
        if (ubx.ubxParser.ubxNavSvin.active && newSvin.value) {
            svinStartAccuracy.value = ubx.ubxParser.ubxNavSvin.meanAcc;
            newSvin.value = false;
        }
    });

    // default to minimum 1 minute survey-in time
    function startSvin() {
        ubx.write(ubx.generate.startSurveyIn(60, 5000));
        ubx.write(ubx.generate.poll(UBX.CFG.CLASS, UBX.CFG.TMODE3));
    }

    function stopSvin() {
        const x = ubx.ubxParser.ubxNavSvin.meanXHP;
        const y = ubx.ubxParser.ubxNavSvin.meanYHP;
        const z = ubx.ubxParser.ubxNavSvin.meanZHP;
        const acc = ubx.ubxParser.ubxNavSvin.meanAcc;
        ubx.write(ubx.generate.configFixedModeECEF(x, y, z, acc));
        ubx.write(ubx.generate.poll(UBX.CFG.CLASS, UBX.CFG.TMODE3));
    }

    return (
        <Card>
            <CardContent className="flex flex-col gap-3 p-3">
                <Input placeholder="Latitude or ECEF X" />
                <Input placeholder="Longitude or ECEF Y" />
                <Input placeholder="Elevation (m)" />
                <Input placeholder="Min Accuracy (m)" />
                <Progress hidden={!ubx.ubxParser.ubxNavSvin.active} value={svinProgress.value} />
                <StyledButton onClick={() => console.log('TODO')}>Use Above Coordinates</StyledButton>
                <StyledButton
                    onClick={() => {
                        if (ubx.ubxParser.ubxNavSvin.active) {
                            stopSvin();
                            toast('Survey-in stopped');
                        } else {
                            startSvin();
                            newSvin.value = true;
                            toast('Starting Survey-in');
                        }
                    }}
                >
                    {svinButtonText.value}
                </StyledButton>
                <StyledButton onClick={() => ubx.write(ubx.generate.saveConfig())}>Save Config</StyledButton>
            </CardContent>
        </Card>
    );
}
