import { Card } from '@/components/ui/card';
import { NtripCardContent } from '@/components/NtripCardContent';
import { TcpCardContent } from '@/components/TcpCardContent';

export const NetworkServicesCard = () => {
    return (
        <Card>
            <NtripCardContent />
            <TcpCardContent />
        </Card>
    );
};
