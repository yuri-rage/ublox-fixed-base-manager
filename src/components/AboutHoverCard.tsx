import { version } from '../../package.json';
import logo from '@/assets/gps-pin.svg';
import viteLogo from '@/assets/vite.svg';
import expressJsLogo from '@/assets/expressJs.svg';
import { Button } from '@/components/ui/button';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { SystemTimeContent } from '@/components/SystemTimeContent';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faReact, faNodeJs } from '@fortawesome/free-brands-svg-icons';

export const AboutHoverCard = () => {
    return (
        <HoverCard>
            <HoverCardTrigger asChild>
                <Button variant="link">About</Button>
            </HoverCardTrigger>
            <HoverCardContent className="w-80">
                <div className="flex justify-between space-x-4">
                    <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                            <img src={logo} alt="" className="h-4 w-4" />
                            <h4 className="text-sm font-semibold">Fixed Base Manager v{version}</h4>
                        </div>
                        <div className="pb-0 pt-2 text-xs">
                            <SystemTimeContent />
                        </div>
                        <p className="pt-2 text-sm">
                            <a
                                href="https://github.com/yuri-rage/ublox-fixed-base-manager"
                                target="_blank"
                                rel="noreferrer"
                                className="text-blue-400 hover:underline"
                            >
                                Documentation on GitHub
                            </a>
                        </p>
                        <p className="text-sm">
                            <a
                                href="https://www.youtube.com/@YurisHomebrewDIY"
                                target="_blank"
                                rel="noreferrer"
                                className="text-blue-400 hover:underline"
                            >
                                YouTube Channel
                            </a>
                        </p>
                        <p className="flex items-center gap-2 pt-2 text-xs text-muted-foreground">
                            <img src={viteLogo} alt="" className="h-4 w-4" />
                            <FontAwesomeIcon icon={faReact} className="text-base" />
                            Powered by Vite + React
                        </p>
                        <p className="flex items-center gap-2 pt-1 text-xs  text-muted-foreground">
                            <FontAwesomeIcon icon={faNodeJs} className="text-base" />
                            <img src={expressJsLogo} alt="" className="h-4 w-4" />
                            Served by NodeJS + Express
                        </p>
                        <div className="flex items-center pt-1">
                            <span className="text-xs italic text-muted-foreground">
                                © 2024 --{' '}
                                <a
                                    href="https://discuss.ardupilot.org/u/yuri_rage/activity"
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-blue-400 hover:underline"
                                >
                                    Yuri
                                </a>
                            </span>
                        </div>
                    </div>
                </div>
            </HoverCardContent>
        </HoverCard>
    );
};
