let nodeCache = require('node-cache');
let cache = null;

exports.start = function(done) {
    if (cache) return done();
    cache = new nodeCache();
}

exports.instance = function() {
    return cache;
}

exports.TTL = 10000;
exports.FR_TTL = 100;
exports.CONFIRM_TTL = 60 * 60 * 24 * 5