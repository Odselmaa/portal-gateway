var request = require('request');

module.exports = {
    send_request: function (options, callback) {
        request(options, function (error, response, body) {
            callback(error, response, body)
        });
    }
}