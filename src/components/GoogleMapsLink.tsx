import { CoordinateTranslator } from '@/core/coordinate-translator';

interface GoogleMapsLinkProps extends React.HTMLProps<HTMLAnchorElement> {
    coordTranslator: CoordinateTranslator;
}

export const GoogleMapsLink = ({ coordTranslator, ...props }: GoogleMapsLinkProps) => {
    const getGoogleMapsLink = (t: CoordinateTranslator) => {
        const [lat, lon] = t.lla;

        // commented line is the official Google Maps API format (roadmap view only)
        // return `https://www.google.com/maps/search/?api=1&query=${lat.toFixed(9)}%2C${lon.toFixed(9)}`;

        // actual return value is a deprecated format that still works for satellite view
        return `http://maps.google.com/maps?t=k&q=loc:${lat.toFixed(9)}+${lon.toFixed(9)}`;
    };

    return (
        <a
            href={getGoogleMapsLink(coordTranslator)}
            target="_blank"
            rel="noreferrer"
            className="text-sm text-blue-400 hover:underline"
            {...props}
        >
            View on Google Maps
        </a>
    );
};
