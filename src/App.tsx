import { useSignal } from '@preact/signals-react';
import { appConfig } from '@/globals';
import { ThemeProvider } from '@/components/ThemeProvider';
import { Toaster } from '@/components/ui/sonner';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ConnectionCard } from '@/components/ConnectionCard';
import { FixedBaseStatusCard } from '@/components/FixedBaseStatusCard';
import { ServicesCard } from '@/components/ServicesCard';
import { NmeaConsoleCard } from '@/components/NmeaConsoleCard';
import { Rtcm3MsgCard } from '@/components/Rtcm3MsgCard';
import { SnrChart } from '@/components/SnrChart';
import { SvinCard } from '@/components/SvinCard';
import { SvinControlCard } from './components/SvinControlCard';
import { Tmode3Card } from '@/components/Tmode3Card';
import { UartCard } from '@/components/UartCard';
import { UbxMsgCard } from '@/components/UbxMsgCard';
import { UbxVersionCard } from '@/components/UbxVersionCard';
import { UtilitiesCard } from '@/components/UtilitiesCard';
import { showNmeaConsole } from '@/components/NmeaConsoleCard';
import { RenogyDataCard } from './components/RenogyDataCard';

// TODO: potentially await ACK for each write that requires one (and notify on failure)

export const App = () => {
    const activeTab = useSignal("stats");

    const handleTabChange = (value: string) => {
        activeTab.value = value;
    };

    return (
        <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
            <div className="p-3">
                <ConnectionCard />
            </div>
            <div className="px-3">
                <Card>
                    <CardContent className="flex flex-col gap-3 p-3 sm:flex-row">
                        <div className="flex-none space-y-3">
                            <FixedBaseStatusCard />
                        </div>
                        <div className="flex-grow overflow-hidden rounded-xl border p-2">
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
                            {appConfig.value.renogySolar.enable && (
                                <TabsTrigger value="renogy">Solar Charger</TabsTrigger>
                            )}
                            <TabsTrigger value="svin">Location/Survey Status</TabsTrigger>
                            <TabsTrigger value="uart">UART Config</TabsTrigger>
                            <TabsTrigger value="services">Services</TabsTrigger>
                            <TabsTrigger value="utilities">Utilities</TabsTrigger>
                        </TabsList>
                        <TabsContent value="stats">
                            <div className="grid grid-cols-1 gap-3 md:grid-cols-[auto_auto_auto_1fr]">
                                <UbxVersionCard />
                                <UbxMsgCard />
                                <Rtcm3MsgCard />
                                {showNmeaConsole.value && (
                                    <div className="md:col-start-1 md:col-end-4">
                                        <NmeaConsoleCard />
                                    </div>
                                )}
                            </div>
                        </TabsContent>
                        <TabsContent value="renogy">
                            <RenogyDataCard />
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
                        <TabsContent value="services">
                            <div className="flex flex-wrap gap-3">
                                <ServicesCard />
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
};
