import { Socket } from 'net';

const APP_VERSION = '0.1a';
const USER_AGENT = 'RubusIdaeus';

export default class NtripTransport {
    private client: Socket | null = null;
    private alive = false; // TODO: find a better way to do this (and maybe reconnect on failure)

    public connect(host: string, port: number, mountPoint: string, password: string) {
        this.client = new Socket();
        this.client.on('ready', () => {
            console.log(`Streaming RTCM3 data to : ${host}:${port}/${mountPoint}`);
            this.alive = true;
        });

        this.client.on('error', (error) => {
            console.error('NTRIP connection error:', error);
        });

        this.client.on('data', (data) => {
            console.log('NTRIP server response:', data.toString());
            if (data.toString().includes('sandbox')) {
                // TODO: fix this - but it's a good way for now to know if we're IP banned by RTK2Go
                this.alive = false;
            }
        });

        this.client.on('close', () => {
            console.log('NTRIP connection closed');
        });

        // TODO: figure out why the client spams requests on disconnect (and don't do that)
        this.client.connect(port, host, () => {
            console.log(`Connecting to NTRIP host: ${host}:${port}/${mountPoint}`);
            const credentials = `SOURCE ${password} /${mountPoint}\r\nSource-Agent: NTRIP ${USER_AGENT}/v${APP_VERSION}\r\n\r\n`;
            if (this.client) {
                this.client.write(credentials);
            }
        });
    }

    public get isActive() {
        return this.alive;
    }

    public write(data: Uint8Array) {
        if (this.alive && this.client) {
            this.client.write(Buffer.from(data));
        }
    }

    public close() {
        if (this.client) {
            this.client.end();
        }
    }

    public destroy() {
        if (this.client) {
            this.client.destroy();
            this.client = null;
        }
    }
}
