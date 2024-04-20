import net from 'net';

type DataCallback = (data: any) => void;

export class TransparentTcpLink {
    private _server: net.Server | null = null;
    private _clients: net.Socket[] = [];
    private _startTime: Date | null = null;

    public create(port: number, onData: DataCallback): Promise<void> {
        return new Promise((resolve, reject) => {
            this._server = net.createServer((socket) => {
                this._clients.push(socket);
                console.log(`New transparent TCP link client (${this._clients.length} total)`);

                socket.on('data', onData);

                socket.on('error', (err) => {
                    console.error('Transparent TCP link error:', err);
                });

                socket.on('close', () => {
                    const index = this._clients.indexOf(socket);
                    if (index !== -1) {
                        this._clients.splice(index, 1);
                    }
                    socket.removeAllListeners();
                    console.log(`Transparent TCP link client disconnected (${this._clients.length} remain)`);
                });
            });

            this._server.on('close', () => {
                console.log('Transparent TCP link closed');
                this._startTime = null;
            });

            this._server.listen(port, () => {
                console.log(`Transparent TCP link started on *:${port}`);
                this._startTime = new Date();
                resolve();
            });

            this._server.on('error', reject);
        });
    }

    public write(data: any) {
        if (this._server) {
            this._clients.forEach((client) => {
                client.write(data);
            });
        }
    }

    public get isActive(): boolean {
        return this._server?.listening || false;
    }

    public get startTime(): Date | null {
        return this._startTime;
    }

    public get port(): number {
        if (this._server) {
            const serverAddress = this._server.address();
            if (serverAddress && typeof serverAddress === 'object') {
                return serverAddress.port;
            }
        }
        return 0;
    }

    public close(): Promise<void> {
        return new Promise((resolve, reject) => {
            if (this._server) {
                this._server.close((err) => {
                    if (err) {
                        console.error('Error closing transparent TCP link:', err);
                        reject(err);
                    } else {
                        this._clients.forEach((client) => {
                            client.destroy();
                        });
                        this._clients = [];
                        resolve();
                    }
                });
            } else {
                resolve();
            }
        });
    }

    public destroy() {
        this.close();
        this._server = null;
    }
}
