import net from 'net';

type DataCallback = (data: any) => void;

export default class TransparentTcpLink {
    private server: net.Server | null = null;
    private clients: net.Socket[] = [];

    public create(port: number, onData: DataCallback) {
        this.server = net.createServer((socket) => {
            this.clients.push(socket);
            console.log(`New transparent TCP link client (${this.clients.length} total)`);

            socket.on('data', onData);

            socket.on('close', () => {
                const index = this.clients.indexOf(socket);
                if (index !== -1) {
                    this.clients.splice(index, 1);
                }
                socket.removeAllListeners();
                console.log(`Transparent TCP link client disconnected (${this.clients.length} remain)`);
            });
        });

        this.server.on('close', () => {
            console.log('Transparent TCP link closed');
        });

        this.server.listen(port, () => {
            console.log(`Transparent TCP link listening on *:${port}`);
        });
    }

    public write(data: any) {
        if (this.server) {
            this.clients.forEach((client) => {
                client.write(data);
            });
        }
    }

    public get isActive(): boolean {
        return this.server?.listening || false;
    }

    public get port(): number {
        if (this.server) {
            const serverAddress = this.server.address();
            if (serverAddress && typeof serverAddress === 'object') {
                return serverAddress.port;
            }
        }
        return 0;
    }

    public close(): Promise<void> {
        return new Promise((resolve, reject) => {
            if (this.server) {
                this.server.close((err) => {
                    if (err) {
                        console.error('Error closing transparent TCP link:', err);
                        reject(err);
                    } else {
                        this.clients.forEach((client) => {
                            client.destroy();
                        });
                        this.clients = [];
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
        this.server = null;
    }
}
