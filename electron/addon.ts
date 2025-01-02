import { EventEmitter } from 'node:events';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'url';

const require = createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// 使用绝对路径加载原生模块
const addon = require(path.join(__dirname, 'c/smp-addon-lib.node'));

export class NdiHandler extends EventEmitter {
    private addonInstance: any;

    constructor(name: string = '') {
        super();
        this.addonInstance = new addon.NdiHandler(name);
        this.setupVideoCallback();
    }

    private setupVideoCallback(): void {
        this.addonInstance.setVideoCallback(this.emit.bind(this));
    }

    public start(sourceName: string): boolean {
        return this.addonInstance.start(sourceName);
    }

}
