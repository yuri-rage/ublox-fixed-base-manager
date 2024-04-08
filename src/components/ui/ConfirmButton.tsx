import React from 'react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel } from '@/components/ui/alert-dialog';
import { AlertDialogContent, AlertDialogDescription, AlertDialogFooter } from '@/components/ui/alert-dialog';
import { AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { StyledButton, styledButtonClassName, styledButtonHeight } from '@/components/ui/StyledButton';

interface ConfirmButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    alertTitle?: string;
    alertDescription?: string;
}

export const ConfirmButton = React.forwardRef<HTMLButtonElement, ConfirmButtonProps>(
    ({ children, onClick, alertTitle, alertDescription, ...props }, ref) => {
        return (
            <AlertDialog>
                <AlertDialogTrigger asChild>
                    <StyledButton ref={ref} {...props}>
                        {children}
                    </StyledButton>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{alertTitle || 'Are you sure?'}</AlertDialogTitle>
                        <AlertDialogDescription>
                            {alertDescription || 'This may be irreversible...'}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className={styledButtonHeight}>Cancel</AlertDialogCancel>
                        <AlertDialogAction className={styledButtonClassName} onClick={onClick}>
                            Continue
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        );
    },
);
