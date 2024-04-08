import { ubx } from '@/globals';

export const GnssStatsPreformatted = () => {
    const UBX_GNSS_STR = ['GPS', 'SBAS', 'Galileo', 'BeiDou', 'IMES', 'QZSS', 'GLONASS', 'NavIC'];

    type GnssSystemStats = {
        count: number;
        totalCno: number;
        averageCno?: number;
    };

    const getGnssStats = () => {
        const uniquePairs = new Set();
        const gnssStats: { [key: string]: GnssSystemStats } = {};

        ubx.ubxParser.ubxRxmRawx.meas.forEach((measurement) => {
            const gnssSvPair = `${measurement.gnssId}-${measurement.svId}`;
            const gnssStr = UBX_GNSS_STR[measurement.gnssId];

            if (!uniquePairs.has(gnssSvPair)) {
                uniquePairs.add(gnssSvPair);

                if (!gnssStats[gnssStr]) {
                    gnssStats[gnssStr] = { count: 1, totalCno: measurement.cno };
                } else {
                    gnssStats[gnssStr].count++;
                    gnssStats[gnssStr].totalCno += measurement.cno;
                }
            }
        });

        Object.keys(gnssStats).forEach((gnss) => {
            const { count, totalCno } = gnssStats[gnss];
            gnssStats[gnss].averageCno = totalCno / count;
        });

        return gnssStats;
    };

    const formatGnssStats = (gnssStats: { [key: string]: GnssSystemStats }): string => {
        const header = 'Sats   Count  Avg SNR\n';
        let totalSatellites = 0;
        let totalCnoSum = 0;

        // display by decreasing satellite count
        const statsLines = Object.entries(gnssStats)
            .map(([gnssName, stats]) => {
                totalSatellites += stats.count;
                totalCnoSum += (stats.averageCno ?? 0) * stats.count;
                return {
                    line: `${gnssName.padEnd(8, ' ')} ${stats.count.toFixed(0).padStart(2, ' ')} ${stats.averageCno?.toFixed(1).padStart(7, ' ')}`,
                    count: stats.count,
                };
            })
            .sort((a, b) => b.count - a.count)
            .map((entry) => entry.line);

        const overallAverageCno = totalCnoSum / totalSatellites;
        const summaryLine = `${'TOTAL'.padEnd(8, ' ')} ${totalSatellites
            .toFixed(0)
            .padStart(2, ' ')} ${overallAverageCno.toFixed(1).padStart(7, ' ')}\n`;

        return header + summaryLine + statsLines.join('\n');
    };

    const gnssStats = getGnssStats();

    return <pre>{formatGnssStats(gnssStats)}</pre>;
};
