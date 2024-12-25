const addon = require('../bin/win32-x64-130/smp-addon-lib.node');

function NdiHandler(name) {
    var _addonInstance = new addon.NdiHandler(name);

    this.start = function(str) {
        return _addonInstance.start(str);
    }

    this.setVideoCallback = function(callback) {
        _addonInstance.setVideoCallback(callback);
    }
}

module.exports = NdiHandler;
