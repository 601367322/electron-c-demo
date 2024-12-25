const NdiHandler = require("./lib/binding.js");
const assert = require("assert");
const { EventEmitter } = require('node:events');
const fs = require('fs');

// assert(NdiHandler, "The expected module is undefined");
const instance = new NdiHandler('');

class Socket extends EventEmitter {
    constructor () {
        super();
        instance.setVideoCallback(this.emit.bind(this));
    }
}

const socket = new Socket();

socket.on('video', (width, height, data_buffer, data_size) => {
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

function test() {
    
    // assert(instance.start, "The expected method is not defined");
    
    let res = instance.start('ZC-DEVELOP (VLC)');
    console.log("ndi-handler start, res:" + res);
}

test();

setTimeout(() => {
    console.log('Main thread is still running after delay');
  }, 6000*1000);
