import path from 'path';
import fs from 'fs/promises';

const createTimestampedFile = async (directory = '.', prefix = 'data', extension = 'bin') => {
    const date = new Date();
    const dateString = date.toISOString();
    const datePart = dateString.slice(0, 10).replace(/-/g, '');
    const timePart = dateString.slice(11, 19).replace(/:/g, '');
    const timestamp = `${datePart}-${timePart}`;
    const fileName = `${prefix}-${timestamp}.${extension}`;
    const filePath = path.join(directory, fileName);

    try {
        await fs.mkdir(directory, { recursive: true });
    } catch (error) {
        if ((error as NodeJS.ErrnoException).code !== 'EEXIST') {
            console.error('Failed to create directory:', error);
            throw error;
        }
    }

    try {
        await fs.writeFile(filePath, Buffer.alloc(0));
        console.log(`Log file opened: ${filePath}`);
        return filePath;
    } catch (error) {
        console.error('Failed to create log file:', error);
        throw error;
    }
};

export class StreamLogger {
    private _filePath: string | null = null;
    private _startTime: Date | null = null;

    public async open(directory: string, prefix: string, extension = 'bin') {
        try {
            this._filePath = await createTimestampedFile(directory, prefix, extension);
        } catch (error) {
            console.error('Logging error:', error);
        }
        this._startTime = new Date();
    }

    public async write(data: Uint8Array) {
        if (!this._filePath) return;

        try {
            await fs.appendFile(this._filePath, Buffer.from(data));
        } catch (error) {
            console.error('Logging error:', error);
        }
    }

    public async close() {
        if (!this._filePath) return;
        const closedPath = this._filePath;
        this._filePath = null;
        this._startTime = null;
        console.log(`Log file closed: ${closedPath}`);
    }

    public get isOpen() {
        return this._filePath !== null;
    }

    public get startTime() {
        return this._startTime;
    }
}
