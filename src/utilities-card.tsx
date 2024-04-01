import { Card, CardContent } from './components/ui/card';
import StyledButton from './styled-button';
import { ubx } from './globals';
import { UBX } from './lib/ublox-interface';

// TODO: use ShadCN Alert Dialog to confirm reversion/reboot actions

export default function UtilitiesCard() {
    return (
        <Card>
            <CardContent className="flex gap-3 p-3">
                <div className="flex flex-col gap-3">
                    <StyledButton onClick={() => ubx.write(ubx.generate.resetToDefaults())}>
                        Revert to Default Configuration
                    </StyledButton>
                    <StyledButton onClick={() => ubx.write(ubx.generate.revertToSaved())}>
                        Revert to Last Saved Configuration
                    </StyledButton>
                    <StyledButton onClick={() => ubx.write(ubx.generate.saveConfig())}>
                        Save Configuration
                    </StyledButton>
                </div>
                <div className="flex flex-col gap-3">
                    <StyledButton
                        onClick={() => ubx.write(ubx.generate.reboot(UBX.MASK.RESET_TYPE.HOT_START))}
                    >
                        Reboot (Hot Start)
                    </StyledButton>
                    <StyledButton
                        onClick={() => ubx.write(ubx.generate.reboot(UBX.MASK.RESET_TYPE.WARM_START))}
                    >
                        Reboot (Warm Start)
                    </StyledButton>
                    <StyledButton
                        onClick={() => ubx.write(ubx.generate.reboot(UBX.MASK.RESET_TYPE.COLD_START))}
                    >
                        Reboot (Cold Start)
                    </StyledButton>
                </div>
            </CardContent>
        </Card>
    );
}
