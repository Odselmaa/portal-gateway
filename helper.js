var request = require('request');

module.exports = {
    send_request: function (options, callback) {
        options.timeout = 500000
        request(options, function (error, response, body) {
            callback(error, response, body)
        });
    }
}