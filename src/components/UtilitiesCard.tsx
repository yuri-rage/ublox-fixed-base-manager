import { useSignalEffect } from '@preact/signals-react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPowerOff, faRotateLeft } from '@fortawesome/free-solid-svg-icons';
import { toast } from 'sonner';
import { requestLogStatus, socket, ubx } from '@/globals';
import { UBX } from '@/core/ublox-interface';
import { Card, CardContent } from '@/components/ui/card';
import { ConfirmButton } from '@/components/ui/ConfirmButton';
import { LogEnableSwitch } from './ui/LogEnableSwitch';
import { SaveButton } from '@/components/ui/SaveButton';

export const UtilitiesCard = () => {
    useSignalEffect(() => {
        requestLogStatus();
    });

    const onRevertDefaultsClick = () => {
        ubx.write(ubx.generate.resetToDefaults());
        toast('u-Blox GPS module reset to defaults');
    };

    const onRevertToSavedClick = () => {
        ubx.write(ubx.generate.revertToSaved());
        toast('u-Blox GPS module reset to last saved configuration');
    };

    const onHotRestartClick = () => {
        ubx.write(ubx.generate.reboot(UBX.MASK.RESET_TYPE.HOT_START));
        toast('Rebooting u-Blox GPS module');
    };

    const onWarmRestartClick = () => {
        ubx.write(ubx.generate.reboot(UBX.MASK.RESET_TYPE.WARM_START));
        toast('Rebooting u-Blox GPS module');
    };

    const onColdRestartClick = () => {
        ubx.write(ubx.generate.reboot(UBX.MASK.RESET_TYPE.COLD_START));
        toast('Rebooting u-Blox GPS module');
    };

    const onDisableTmode3Click = () => {
        ubx.write(ubx.generate.disableTmode3());
        ubx.write(ubx.generate.configNavStationary());
        ubx.write(ubx.generate.poll(UBX.CFG.CLASS, UBX.CFG.TMODE3));
    };

    const onRebootClick = () => {
        socket.emit('reboot');
        toast('Rebooting Raspberry Pi');
    };

    const onShutdownClick = () => {
        socket.emit('shutdown');
        toast('Shutting down Raspberry Pi');
    };

    return (
        <Card>
            <CardContent className="flex flex-col justify-between p-3">
                <div className="flex gap-3">
                    <div className="flex flex-col gap-3">
                        <ConfirmButton
                            alertTitle="Revert to Default?"
                            alertDescription="This will erase all GPS module settings. This action cannot be undone."
                            onClick={onRevertDefaultsClick}
                        >
                            Revert to Default Config
                        </ConfirmButton>
                        <ConfirmButton
                            alertDescription="Reverting to the last saved settings will undo any changes since the last save."
                            onClick={onRevertToSavedClick}
                        >
                            Revert to Last Saved Config
                        </ConfirmButton>
                        <SaveButton />
                    </div>
                    <div className="flex flex-col gap-3">
                        <ConfirmButton
                            alertTitle="Reboot GPS?"
                            alertDescription="This will hot start the GPS module (and retain ephemeris data)."
                            onClick={onHotRestartClick}
                        >
                            u-Blox Hot Restart
                        </ConfirmButton>
                        <ConfirmButton
                            alertTitle="Reboot GPS?"
                            alertDescription="This will warm start the GPS module (and re-obtain existing ephemeris data if necessary)."
                            onClick={onWarmRestartClick}
                        >
                            u-Blox Warm Restart
                        </ConfirmButton>
                        <ConfirmButton
                            alertTitle="Reboot GPS?"
                            alertDescription="This will cold start the GPS module (and re-obtain ephemeris data)."
                            onClick={onColdRestartClick}
                        >
                            u-Blox Cold Restart
                        </ConfirmButton>
                    </div>
                    <div className="flex flex-col gap-3">
                        <ConfirmButton
                            alertTitle="Disable fixed base operation?"
                            alertDescription="Disabling TMODE3 will revert the GPS module to normal (non-fixed mode) operation."
                            onClick={onDisableTmode3Click}
                        >
                            Disable TMODE3
                        </ConfirmButton>
                        <ConfirmButton
                            className="flex w-full items-center bg-gradient-to-t from-[#ffcc00] to-[#ff9800] hover:from-[#e6a700] hover:to-[#cc7a00] active:from-[#ff5722] active:to-[#e65100]"
                            alertTitle="Reboot Raspberry Pi?"
                            alertDescription="This will issue an OS level reboot command."
                            onClick={onRebootClick}
                        >
                            <FontAwesomeIcon icon={faRotateLeft} className="flex-shrink-0" />
                            <span className="flex-1 text-center">Reboot</span>
                        </ConfirmButton>
                        <ConfirmButton
                            className="flex w-full items-center space-x-1 bg-gradient-to-t from-[#ef5350] to-[#d32f2f] hover:from-[#c62828] hover:to-[#b71c1c] active:from-[#d32f2f] active:to-[#b71c1c]"
                            alertTitle="Shut down Raspberry Pi?"
                            alertDescription="This will issue an OS level shutdown command."
                            onClick={onShutdownClick}
                        >
                            <FontAwesomeIcon icon={faPowerOff} className="flex-shrink-0" />
                            <span className="flex-1 text-center">Shut Down</span>
                        </ConfirmButton>
                    </div>
                </div>
                <LogEnableSwitch className="px-2 pt-4" />
            </CardContent>
        </Card>
    );
};
