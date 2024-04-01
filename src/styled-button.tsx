import { Button } from './components/ui/button';

export default function StyledButton({
    children,
    onClick,
    className,
    ...props
}: {
    children: React.ReactNode;
    onClick: () => void;
    className?: string;
}) {
    const defaultClassName =
        'h-8 rounded-sm bg-gradient-to-t from-[#c9e08e] to-[#96c223] hover:from-[#9bb166] hover:to-[#779b1a] active:from-[#7b8f4a] active:to-[#618014]';
    const wrapperClassName = className ? `${defaultClassName} ${className}` : defaultClassName;
    return (
        <Button onClick={onClick} className={wrapperClassName} {...props}>
            {children}
        </Button>
    );
}
