import { Signal } from "@preact/signals-react";
import { Input } from "@/components/ui/input";

interface CoordinateInputsProps {
    strX: Signal<string>;
    strY: Signal<string>;
    strZ: Signal<string>;
    minAccuracy: Signal<string>;
}

export const CoordinateInputs: React.FC<CoordinateInputsProps> = ({ strX, strY, strZ, minAccuracy }) => {
    return (
        <>
            <Input
                placeholder="Latitude or ECEF X"
                value={strX.value}
                onChange={(event) => (strX.value = event.target.value)}
            />
            <Input
                placeholder="Longitude or ECEF Y"
                value={strY.value}
                onChange={(event) => (strY.value = event.target.value)}
            />
            <Input
                placeholder="Elevation (m) or ECEF Z"
                value={strZ.value}
                onChange={(event) => (strZ.value = event.target.value)}
            />
            <Input
                placeholder="Min Accuracy (m)"
                value={minAccuracy.value}
                onChange={(event) => (minAccuracy.value = event.target.value.replace(/[^\d.]/g, ''))}
            />
        </>
    );
};