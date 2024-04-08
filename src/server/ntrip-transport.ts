import http2 from 'http2';
import { Socket } from 'net';
import { version } from '../../package.json';

// TODO: implement a reconnection scheme (check for and handle disconnects)

const USER_AGENT = 'FixedBaseManager';
const RAPID_RETRIES = 3;
const RAPID_RETRY_INTERVAL = 5000;
const LONG_RETRY_INTERVAL = 300000; // 5 minutes

export const hasInternet = (timeout = 5000): Promise<boolean> => {
    return new Promise((resolve) => {
        const client = http2.connect('https://www.google.com');
        const timeoutId = setTimeout(() => {
            client.destroy();
            resolve(false);
        }, timeout);
        client.on('connect', () => {
            clearTimeout(timeoutId);
            resolve(true);
            client.destroy();
        });
        client.on('error', () => {
            clearTimeout(timeoutId);
            resolve(false);
            client.destroy();
        });
    });
};

export class NtripTransport {
    private _client: Socket | null = null;
    private _enabled = false;
    private _startTime: Date | null = null;

    public async connect(
        host: string,
        port: number,
        mountPoint: string,
        password: string,
        delay = RAPID_RETRY_INTERVAL,
    ) {
        this._enabled = true;

        // always wait at least a few seconds before attempting NTRIP connection
        // slightly hacky way of avoiding immediate failures on startup, prior to internet connectivity
        setTimeout(() => this._connect(host, port, mountPoint, password), delay);
    }

    private async _connect(host: string, port: number, mountPoint: string, password: string) {
        if (!this._enabled) return;
        let internetAvailable = false;
        for (let attempt = 1; attempt <= RAPID_RETRIES; attempt++) {
            internetAvailable = await hasInternet();
            if (internetAvailable) break;
            console.log(`Failed to reach NTRIP host, retrying in ${RAPID_RETRY_INTERVAL / 1000} seconds...`);
            await new Promise((resolve) => setTimeout(resolve, RAPID_RETRY_INTERVAL));
        }
        if (!internetAvailable) {
            console.log(
                `NTRIP transport service failed (no Internet), retrying in ${LONG_RETRY_INTERVAL / 60000} minutes...`,
            );
            setTimeout(() => this._connect(host, port, mountPoint, password), LONG_RETRY_INTERVAL);
            return;
        }

        this._client = new Socket();

        this._client.on('error', (error) => {
            console.error('NTRIP connection error:', error);
            this._startTime = null;
        });

        this._client.on('data', (data) => {
            const response = data.toString();
            console.log('NTRIP host response:', response);

            if (response.includes('ICY 200 OK')) {
                console.log('NTRIP transport service connected');
                this._startTime = new Date();
                return;
            }

            // else connection failed, and we should probably disable reattempts
            if (response.includes('ICY 401')) {
                console.log('NTRIP client authorization failed: bad password or mount point');
            } else if (response.includes('sandbox')) {
                console.log('NTRIP host appears to have banned this IP address');
            } else {
                console.log('NTRIP host: unexpected response');
            }
            this.close();
            console.log('NTRIP service disabled, user attention required');
        });

        this._client.on('close', () => {
            console.log('NTRIP connection closed');
            this._startTime = null;
            if (this._enabled) {
                console.log(
                    `Unexpected NTRIP host disconnection, attempting reconnect in ${RAPID_RETRY_INTERVAL / 1000} seconds...`,
                );
                setTimeout(() => this._connect(host, port, mountPoint, password), RAPID_RETRY_INTERVAL);
            }
        });

        this._client.connect(port, host, () => {
            console.log(`Connecting to NTRIP host: ${host}:${port}/${mountPoint}`);
            const credentials = `SOURCE ${password} /${mountPoint}\r\nSource-Agent: NTRIP ${USER_AGENT}/v${version}\r\n\r\n`;
            if (this._client) {
                this._client.write(credentials);
            }
        });
    }

    public get isActive() {
        return this._startTime !== null;
    }

    public get startTime() {
        return this._startTime;
    }

    public write(data: Uint8Array) {
        if (this._startTime !== null && this._client) {
            this._client.write(Buffer.from(data));
        }
    }

    public close() {
        if (this._client) {
            this._client.end();
            this._startTime = null;
            this._enabled = false;
        }
    }

    public destroy() {
        if (this._client) {
            this._client.destroy();
            this._client = null;
        }
    }
}
