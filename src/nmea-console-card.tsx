import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { nmeaMessages, nmeaMsgCount } from './globals';
import { computed, useComputed, useSignal, useSignalEffect } from '@preact/signals-react';
import { useRef } from 'react';
import { Checkbox } from './components/ui/checkbox';
import { Label } from './components/ui/label';

export const showNmeaConsole = computed(() => nmeaMsgCount.value > 0);

export default function NmeaConsoleCard() {
    const pauseOutput = useSignal(false);
    const contentRef = useRef(null);
    const nmeaMsgStr = useSignal('');

    useSignalEffect(() => {
        // @ts-ignore
        const _count = nmeaMsgCount.value;
        if (pauseOutput.value) {
            return;
        }

        nmeaMsgStr.value = nmeaMessages.value.join('');

        setTimeout(() => {
            if (contentRef.current) {
                (contentRef.current as HTMLElement).scrollTop = (
                    contentRef.current as HTMLElement
                ).scrollHeight;
            }
        }, 5);
    });

    const onPauseChecked = (checked: boolean) => {
        pauseOutput.value = checked;
    }

    if (!showNmeaConsole.value) {
        return null;
    }

    return (
        <Card className="text-sm">
            <CardHeader className="px-4 pb-2 pt-4">
                <CardTitle>NMEA Console</CardTitle>
                <CardDescription className="flex flex-wrap items-center justify-between">
                    <span>Total: {nmeaMsgCount.value}</span>
                    <span className="flex items-center gap-2">
                        <Checkbox
                            id="pause-nmea"
                            onCheckedChange={onPauseChecked}
                        />
                        <Label htmlFor="pause-nmea" className="font-normal leading-none text-white">
                            Pause NMEA Console Output
                        </Label>
                    </span>
                </CardDescription>
            </CardHeader>
            <CardContent className="px-4 pb-4">
                <Card>
                    <CardContent
                        ref={contentRef}
                        className="h-64 w-full resize overflow-auto whitespace-nowrap p-2 font-mono"
                        style={{ scrollbarWidth: 'none' }}
                    >
                        <pre>{nmeaMsgStr.value}</pre>
                    </CardContent>
                </Card>
            </CardContent>
        </Card>
    );
}
