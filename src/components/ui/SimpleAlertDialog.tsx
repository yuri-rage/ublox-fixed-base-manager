import { Signal } from '@preact/signals-react';
import * as AlertDialogPrimitive from '@radix-ui/react-alert-dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel } from '@/components/ui/alert-dialog';
import { AlertDialogContent, AlertDialogDescription, AlertDialogFooter } from '@/components/ui/alert-dialog';
import { AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { styledButtonHeight, styledButtonClassName } from '@/components/ui/StyledButton';

interface SimpleAlertDialogProps extends AlertDialogPrimitive.AlertDialogProps {
    triggerSignal: Signal<boolean>;
    alertTitle?: string;
    alertDescription?: string;
    onContinue?: () => void;
}

export const SimpleAlertDialog: React.FC<SimpleAlertDialogProps> = ({
    triggerSignal,
    alertTitle,
    alertDescription,
    onContinue,
    ...props
}) => {
    return (
        <AlertDialog
            open={triggerSignal.value}
            onOpenChange={(open) => (triggerSignal.value = open)}
            {...props}
        >
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{alertTitle || 'Are you sure?'}</AlertDialogTitle>
                    <AlertDialogDescription>
                        {alertDescription || 'This may be irreversible...'}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel className={styledButtonHeight}>Cancel</AlertDialogCancel>
                    <AlertDialogAction className={styledButtonClassName} onClick={onContinue}>
                        Continue
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};
