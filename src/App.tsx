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

// TODO: text input for self-surveyed coordinates
// TODO: await ACK and toast on success/failure of commands

export default function App() {
    const activeTab = useSignal('svin'); // TODO: revert this to 'stats'

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
                            <div className="flex flex-wrap gap-3">
                                <VersionCard />
                                <UbxMsgCard />
                                <RtcmMsgCard />
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
