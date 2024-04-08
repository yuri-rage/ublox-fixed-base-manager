import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@/components/ui/tooltip';

interface TooltipContainerProps {
    children: React.ReactNode;
    className?: string;
    tooltipText: string;
}

export const TooltipContainer: React.FC<TooltipContainerProps> = ({
    children,
    className,
    tooltipText,
    ...props
}) => {
    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <span className={className} {...props}>
                        {children}
                    </span>
                </TooltipTrigger>
                <TooltipContent>{tooltipText}</TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
};
