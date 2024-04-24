import { computed, effect } from '@preact/signals-react';
import { Line } from 'react-chartjs-2';
import 'chart.js/auto';
import { socket, renogyLog } from '@/globals';

// TODO: display maxima of voltage and power in the log object rather than Renogy modbus values
// TODO: use first and last log entries to calculate cumulative energy supply/demand

effect(() => {
    socket.emit('getRenogyLog');
});

export const RenogyChart = ({}) => {
    const POINT_RADIUS = 3;

    const instantaneousData = computed(() => {
        if (!renogyLog.value) return { labels: [], datasets: [] };
        const entriesArray = Array.from(renogyLog.value.entries());
        const labels = entriesArray.map((entry) => new Date(entry[1].timestamp).toLocaleTimeString());
        const batteryVoltage = entriesArray.map((entry) => entry[1].batteryVoltage);
        const loadPower = entriesArray.map((entry) => entry[1].loadPower);
        const chargePower = entriesArray.map((entry) => entry[1].chargePower);
        return {
            labels,
            datasets: [
                {
                    label: 'Battery (V)',
                    data: batteryVoltage,
                    fill: false,
                    borderColor: '#0ea5e9', // sky-500
                    pointRadius: POINT_RADIUS,
                    pointBorderWidth: 1,
                    borderWidth: 2,
                },
                {
                    label: 'Load (W)',
                    data: loadPower,
                    fill: false,
                    borderColor: 'rgb(255, 99, 132)',
                    pointRadius: POINT_RADIUS,
                    pointBorderWidth: 1,
                    borderWidth: 2,
                },
                {
                    label: 'Charge (W)',
                    data: chargePower,
                    fill: false,
                    borderColor: '#34d399', // emerald-400
                    pointRadius: POINT_RADIUS,
                    pointBorderWidth: 1,
                    borderWidth: 2,
                },
            ],
        };
    });

    const cumulativeData = computed(() => {
        if (!renogyLog.value) return { labels: [], datasets: [] };
        const entriesArray = Array.from(renogyLog.value.entries());
        const labels = entriesArray.map((entry) => new Date(entry[1].timestamp).toLocaleTimeString());
        const chargeEnergy = entriesArray.map((entry) => entry[1].chargeEnergyWh);
        const loadEnergy = entriesArray.map((entry) => entry[1].loadEnergyWh);
        return {
            labels,
            datasets: [
                {
                    label: 'Load Energy (Wh)',
                    data: loadEnergy,
                    fill: false,
                    borderColor: 'rgb(255, 99, 132)',
                    pointRadius: POINT_RADIUS,
                    pointBorderWidth: 1,
                    borderWidth: 2,
                },
                {
                    label: 'Charge Energy (Wh)',
                    data: chargeEnergy,
                    fill: false,
                    borderColor: '#34d399', // emerald-400
                    pointRadius: POINT_RADIUS,
                    pointBorderWidth: 1,
                    borderWidth: 2,
                },
            ],
        };
    });

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                labels: {
                    usePointStyle: true,
                    boxWidth: POINT_RADIUS * 2,
                    boxHeight: POINT_RADIUS * 2,
                },
            },
        },
    };

    return (
        <div className="space-y-3 p-2">
            <div className="min-h-72 flex-grow overflow-hidden rounded-xl border p-2">
                <Line data={instantaneousData.value} options={options} />
            </div>
            <div className="min-h-72 flex-grow overflow-hidden rounded-xl border p-2">
                <Line data={cumulativeData.value} options={options} />
            </div>
        </div>
    );
};
