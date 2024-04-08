import { useSignalEffect } from '@preact/signals-react';
import { requestStartTime, systemStartTime } from '@/globals';

export const SystemTimeContent = () => {
    useSignalEffect(() => {
        requestStartTime();
    });

    const getTimestamp = (d: Date, tz: string) => {
        const options: Intl.DateTimeFormatOptions = {
            year: 'numeric',
            month: 'short',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false,
            timeZone: tz,
        };

        const formatter = new Intl.DateTimeFormat('en-US', options);
        const formatted = formatter.format(d);
        const [month, day, year, time] = formatted.split(' ');
        return `${day.replace(',', '')} ${month} ${year} ${time}`;
    };

    const browserTz = Intl.DateTimeFormat().resolvedOptions().timeZone;

    // there's surely a better way to do this than creating new Date objects
    // but this works and isn't worth the effort to refactor
    const osStart = new Date(systemStartTime.value.os as Date);
    const serverStart = new Date(systemStartTime.value.server as Date);
    const tcpStart = new Date(systemStartTime.value.tcpRepeater as Date);
    const ntripStart = new Date(systemStartTime.value.ntrip as Date);
    const logStart = new Date(systemStartTime.value.logger as Date);

    return (
        <pre>
            OS boot time{'  : '}
            {systemStartTime.value.os ? `${getTimestamp(osStart, browserTz)}` : 'Error reading uptime'}
            {'\n'}
            Server start{'  : '}
            {systemStartTime.value.server ? `${getTimestamp(serverStart, browserTz)}` : 'Server error'}
            {'\n'}
            TCP service{'   : '}
            {systemStartTime.value.tcpRepeater ? `${getTimestamp(tcpStart, browserTz)}` : 'Inactive'}
            {'\n'}
            NTRIP service{' : '}
            {systemStartTime.value.ntrip ? `${getTimestamp(ntripStart, browserTz)}` : 'Inactive'}
            {'\n'}
            GPS logging{'   : '}
            {systemStartTime.value.logger ? `${getTimestamp(logStart, browserTz)}` : 'Inactive'}
        </pre>
    );
};
