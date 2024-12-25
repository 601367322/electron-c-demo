import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'url';
import { EventEmitter } from 'node:events';
import fs from 'fs';

const require = createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// 使用绝对路径加载原生模块
const addon = require(path.join(__dirname, 'smp-addon-lib/bin/win32-x64-130/smp-addon-lib.node'));

const NdiHandler = (name: string) => {
    var _addonInstance = new addon.NdiHandler(name);

    var start = function(str: string) {
        return _addonInstance.start(str);
    }

    var setVideoCallback = function(callback: (width: number, height: number, data_buffer: Buffer, data_size: number) => void) {
        _addonInstance.setVideoCallback(callback);
    }

    return {
        start,
        setVideoCallback
    }
}



const instance = NdiHandler('');

class Socket extends EventEmitter {
    constructor () {
        super();
        instance.setVideoCallback((width: number, height: number, data_buffer: Buffer, data_size: number) => {
            this.emit('video', width, height, data_buffer, data_size);
        });
    }
}

const socket = new Socket();

socket.on('video', (width: number, height: number, data_buffer: Buffer, data_size: number) => {
    console.log("ndi-handler setVideoCallback, width:%d, height:%d, data_size:%d", width, height, data_size);

    const buffer = Buffer.from(data_buffer);
    // 使用同步方式写入文件
    try {
        fs.appendFileSync('D:/output.rgb', buffer);
        console.log('file write success');
    } catch (err) {
        console.error('file write error:', err);
    }

});

export function test() {
    let res = instance.start('ZC-DEVELOP (VLC)');
}
