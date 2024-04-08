import React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export const styledButtonHeight = 'h-8';
export const styledButtonClassName = `${styledButtonHeight} rounded-sm bg-gradient-to-t from-[#c9e08e] to-[#96c223] hover:from-[#9bb166] hover:to-[#779b1a] active:from-[#7b8f4a] active:to-[#618014]`;

export const StyledButton = React.forwardRef<
    HTMLButtonElement,
    React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ children, className, ...props }, ref) => {
    return (
        <Button ref={ref} className={cn(styledButtonClassName, className)} {...props}>
            {children}
        </Button>
    );
});
