import { ThemeProvider } from '@/components/theme-provider';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { Toaster } from '@/components/ui/sonner';
import SnrChart from './snr-chart';
import VersionCard from './ubx-version-card';
import UbxMsgCard from './ubx-msg-card';
import RtcmMsgCard from './rtcm-msg-card';
import SvinCard from './ubx-svin-card';
import Tmode3Card from './ubx-tmode3-card';
import NetworkServicesCard from './net-services-card';
import LocationCard from './location-card';
import { useSignal } from '@preact/signals-react';
import ConnectionCard from './connection-card';
import UartCard from './uart-card';
import UtilitiesCard from './utilities-card';
import SvinControlCard from './ubx-svin-control-card';
import NmeaConsoleCard, { showNmeaConsole } from './nmea-console-card';

// TODO: potentially await ACK for each write that requires one (and notify on failure)

export default function App() {
    const activeTab = useSignal('stats');

    function handleTabChange(value: string) {
        activeTab.value = value;
    }

    return (
        <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
            <div className="p-3">
                <ConnectionCard />
            </div>
            <div className="px-3">
                <Card>
                    <CardContent className="flex flex-row gap-3 p-3">
                        <div className="flex-none">
                            <LocationCard />
                        </div>
                        <div className="flex-grow">
                            <SnrChart />
                        </div>
                    </CardContent>
                </Card>
            </div>
            <div className="flex p-3">
                <Card>
                    <Tabs value={activeTab.value} onValueChange={handleTabChange} className="p-3">
                        <TabsList>
                            <TabsTrigger value="stats">u-Blox Statistics</TabsTrigger>
                            <TabsTrigger value="svin">Location/Survey Status</TabsTrigger>
                            <TabsTrigger value="uart">UART Config</TabsTrigger>
                            <TabsTrigger value="network">Network Services</TabsTrigger>
                            <TabsTrigger value="utilities">Utilities</TabsTrigger>
                        </TabsList>
                        <TabsContent value="stats">
                            <div className="grid grid-cols-1 gap-3 md:grid-cols-[auto_auto_auto_1fr]">
                                <VersionCard />
                                <UbxMsgCard />
                                <RtcmMsgCard />
                                {showNmeaConsole.value && (
                                    <div className="md:col-start-1 md:col-end-4">
                                        <NmeaConsoleCard />
                                    </div>
                                )}
                            </div>
                        </TabsContent>
                        <TabsContent value="svin">
                            <div className="flex flex-wrap gap-3">
                                <SvinCard />
                                <Tmode3Card />
                                <SvinControlCard />
                            </div>
                        </TabsContent>
                        <TabsContent value="uart">
                            <div className="flex flex-wrap gap-3">
                                <UartCard />
                            </div>
                        </TabsContent>
                        <TabsContent value="network">
                            <div className="flex flex-wrap gap-3">
                                <NetworkServicesCard />
                            </div>
                        </TabsContent>
                        <TabsContent value="utilities">
                            <UtilitiesCard />
                        </TabsContent>
                    </Tabs>
                </Card>
            </div>
            <Toaster />
        </ThemeProvider>
    );
}
