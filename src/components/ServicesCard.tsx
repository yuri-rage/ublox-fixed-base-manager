import { Card } from '@/components/ui/card';
import { NtripCardContent } from '@/components/NtripCardContent';
import { TcpCardContent } from '@/components/TcpCardContent';
import { RenogyCardContent } from './RenogyCardContent';

export const ServicesCard = () => {
    return (
        <Card>
            <NtripCardContent />
            <TcpCardContent />
            <RenogyCardContent />
        </Card>
    );
};
