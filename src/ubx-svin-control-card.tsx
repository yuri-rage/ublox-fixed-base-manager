import { toast } from 'sonner';
import { Card, CardContent } from './components/ui/card';
import StyledButton from './styled-button';
import { UBX } from './lib/ublox-interface';
import { ubx, ubxNavSvinCount, location, appConfig, sendConfig, updateAppConfig } from './globals';
import { Input } from './components/ui/input';
import { computed, signal, useSignalEffect } from '@preact/signals-react';
import { Progress } from './components/ui/progress';
import CoordinateTranslator from './lib/coordinate-translator';

const MIN_SVIN_TIME = 60; // default to 1 min svin time

const svinStartAccuracy = signal(0);
const strX = signal('');
const strY = signal('');
const strZ = signal('');
const minAccuracy = signal('');
const lastSvinActiveState = signal(false);
const svinManuallyStopped = signal(false);

export default function SvinControlCard() {
    const translator = new CoordinateTranslator('0', '0', '0');

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
            (ubx.ubxParser.ubxNavSvin.meanAcc - parseFloat(minAccuracy.value)) /
                (svinStartAccuracy.value - parseFloat(minAccuracy.value));

        // TODO: make sure this progress bar slowing technique works well
        // show slow progress at first, making smaller increments near 100% more visible
        return Math.pow(progress, 8) * 100;
    });

    useSignalEffect(() => {
        // @ts-ignore
        const _count = ubxNavSvinCount.value; // simply to trigger reactivity

        if (ubx.ubxParser.ubxNavSvin.active) {
            strX.value = location.value.latString;
            strY.value = location.value.lngString;
            strZ.value = location.value.alt.toFixed(2);
        }

        // update initial progress bar value
        if (svinStartAccuracy.value < ubx.ubxParser.ubxNavSvin.meanAcc) {
            const newStartVal =
                ubx.ubxParser.ubxNavSvin.meanAcc > 90000 ? 0 : ubx.ubxParser.ubxNavSvin.meanAcc;
            svinStartAccuracy.value = ubx.ubxParser.ubxNavSvin.active ? newStartVal : 0;
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

    function startSvin() {
        const acc = parseFloat(minAccuracy.value) * 1e4;
        if (isNaN(acc)) {
            toast('Enter minimum accuracy value');
            return;
        }
        ubx.write(ubx.generate.startSurveyIn(MIN_SVIN_TIME, Math.floor(acc)));
        ubx.write(ubx.generate.poll(UBX.CFG.CLASS, UBX.CFG.TMODE3));
        toast(`Starting Survey-in (${MIN_SVIN_TIME} seconds, minimum)`);
    }

    function stopSvin() {
        const x = ubx.ubxParser.ubxNavSvin.meanXHP;
        const y = ubx.ubxParser.ubxNavSvin.meanYHP;
        const z = ubx.ubxParser.ubxNavSvin.meanZHP;
        const acc = ubx.ubxParser.ubxNavSvin.meanAcc;
        ubx.write(ubx.generate.configFixedModeECEF(x, y, z, acc));
        ubx.write(ubx.generate.poll(UBX.CFG.CLASS, UBX.CFG.TMODE3));
    }

    function onStopClick() {
        svinManuallyStopped.value = true;
        stopSvin();
    }

    function onUserCoordsClick() {
        if (ubx.ubxParser.ubxNavSvin.active) {
            onStopClick();
            return;
        }
        if (!strX.value || !strY.value || !strZ.value) {
            toast('Coordinate values cannot be empty');
            return;
        }
        if (!minAccuracy.value) {
            toast('Enter observed accuracy value');
            return;
        }

        translator.parse(strX.value, strY.value, strZ.value);

        if (translator.wasEcef) {
            ubx.write(
                ubx.generate.configFixedModeECEF(
                    translator.ecefX,
                    translator.ecefY,
                    translator.ecefZ,
                    parseFloat(minAccuracy.value),
                ),
            );
        } else {
            ubx.write(
                ubx.generate.configFixedModeLLA(
                    translator.lat,
                    translator.lng,
                    translator.alt,
                    parseFloat(minAccuracy.value),
                ),
            );
        }

        ubx.write(ubx.generate.poll(UBX.CFG.CLASS, UBX.CFG.TMODE3));
        toast(
            `Using fixed mode at<pre>${translator.latString}\n${translator.lngString}\n${translator.alt.toFixed(2)} (${translator.altFeet.toFixed(1)}')</pre>`,
        );
    }

    function onFileCoordsClick() {
        if (ubx.ubxParser.ubxNavSvin.active) {
            toast('Stop survey-in first');
            return;
        }
        strX.value = appConfig.value.savedLocation.ecefXOrLat.toString();
        strY.value = appConfig.value.savedLocation.ecefYOrLon.toString();
        strZ.value = appConfig.value.savedLocation.ecefZOrAlt.toString();
        minAccuracy.value = appConfig.value.savedLocation.fixedPosAcc.toString();
        onUserCoordsClick();
    }

    function onStartStopClick() {
        if (ubx.ubxParser.ubxNavSvin.active) {
            onStopClick();
            return;
        }
        startSvin();
    }

    function onSaveClick() {
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
    }

    return (
        <Card>
            <CardContent className="flex flex-col gap-3 p-3">
                <Input
                    placeholder="Latitude or ECEF X"
                    value={strX.value}
                    onChange={(event) => (strX.value = event.target.value)}
                />
                <Input
                    placeholder="Longitude or ECEF Y"
                    value={strY.value}
                    onChange={(event) => (strY.value = event.target.value)}
                />
                <Input
                    placeholder="Elevation (m) or ECEF Z"
                    value={strZ.value}
                    onChange={(event) => (strZ.value = event.target.value)}
                />
                <Input
                    placeholder="Min Accuracy (m)"
                    value={minAccuracy.value}
                    onChange={(event) => (minAccuracy.value = event.target.value.replace(/[^\d.]/g, ''))}
                />
                <Progress hidden={!ubx.ubxParser.ubxNavSvin.active} value={svinProgress.value} />
                <StyledButton onClick={onUserCoordsClick}>Use Above Coordinates</StyledButton>
                <StyledButton onClick={onFileCoordsClick}>Use Last Saved Coords</StyledButton>
                <StyledButton onClick={onStartStopClick}>{svinButtonText.value}</StyledButton>
                <StyledButton onClick={onSaveClick}>Save Config</StyledButton>
            </CardContent>
        </Card>
    );
}
