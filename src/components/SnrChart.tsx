import { Chart, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import ChartAnnotationsPlugin from 'chartjs-plugin-annotation';
import { Bar } from 'react-chartjs-2';
import { UBX_GNSS_ID, UBX_SIG_ID } from '@/core/ublox-parser';
import { ubx, ubxRxmRawxCount } from '@/globals';

Chart.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ChartAnnotationsPlugin);

export const SnrChart = () => {
    const options = {
        scales: {
            x: {
                stacked: true,
            },
            y: {
                stacked: true,
            },
        },
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false,
            },
            title: {
                display: false,
            },
            annotation: {
                annotations: {
                    line1: {
                        yMin: 40,
                        yMax: 40,
                        borderColor: 'red',
                        borderWidth: 1,
                    },
                },
            },
            tooltip: {
                callbacks: {
                    label: function (context: any) {
                        let label = context.dataset.label || '';

                        const index = context.dataIndex;

                        if (label === 'sigId0') {
                            return `${context.dataset.sigId[index]}: ${context.parsed.y}`;
                        }

                        const [dataset1, dataset2] = context.chart.data.datasets;
                        const snr1 = dataset1.data[index] || 0;
                        const snr2 = dataset2.data[index] || 0;
                        const sum = snr1 + snr2;
                        return `${context.dataset.sigId[index]}: ${sum}`;
                    },
                },
            },
        },
    };

    function getDataSet(_trigger: number) {
        const data: {
            [key: string]: {
                sigId: string[];
                snr1: number | null;
                snr2: number | null;
                highestSnr: number | null;
            };
        } = {};

        ubx.ubxParser.ubxRxmRawx.meas.forEach((value) => {
            const svId = `${UBX_GNSS_ID[value.gnssId]}${value.svId.toString().padStart(2, '0')}`;
            const sigId = `${UBX_SIG_ID[value.gnssId][value.sigId]}`;

            data[svId] = data[svId] || { sigId: [sigId, ''], snr1: null, snr2: null, highestSnr: null };

            if (data[svId].snr1 === null) {
                data[svId].snr1 = value.cno;
                data[svId].highestSnr = value.cno;
            } else {
                const snr1 = data[svId].snr1 || 0;
                const snr2 = value.cno;
                const diff = Math.abs(snr1 - snr2);
                if (snr1 < snr2) {
                    data[svId].snr2 = diff;
                    data[svId].sigId[1] = sigId;
                } else {
                    data[svId].snr1 = snr1 - diff;
                    data[svId].snr2 = diff;
                    [data[svId].sigId[0], data[svId].sigId[1]] = [sigId, data[svId].sigId[0]];
                }
                data[svId].highestSnr = (data[svId].snr1 || 0) + (data[svId].snr2 || 0);
            }
        });

        const sortedKeys = Object.keys(data).sort(
            (a, b) => (data[b].highestSnr || 0) - (data[a].highestSnr || 0),
        );

        const datasets: {
            label: string;
            data: (number | null)[];
            backgroundColor: string;
            borderWidth: number;
            sigId: string[];
        }[] = [
            {
                label: 'sigId0',
                data: [],
                backgroundColor: '#80c11f',
                borderWidth: 1,
                sigId: [],
            },
            {
                label: 'sigId2',
                data: [],
                backgroundColor: '#80c11f',
                borderWidth: 1,
                sigId: [],
            },
        ];

        sortedKeys.forEach((svId) => {
            const item = data[svId];
            datasets[0].data.push(item.snr1);
            datasets[1].data.push(item.snr2);
            datasets[0].sigId.push(item.sigId[0]);
            datasets[1].sigId.push(item.sigId[1]);
        });

        return { labels: sortedKeys, datasets };
    }

    return <Bar options={options} data={getDataSet(ubxRxmRawxCount.value)} />;
};
