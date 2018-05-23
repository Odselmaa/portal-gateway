var request = require('request');

module.exports = {
    send_request: function (options, callback) {
        options.timeout = 20000
        request(options, function (error, response, body) {
            callback(error, response, body)
        });
    }
}