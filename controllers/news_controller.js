var h = require('../helper.js')
const urls = require('../urls.js')

module.exports = {
    news_api: function (req, res) {
        var options = {
            uri: urls.NEWS_API_ROOT + req.url,
            json: req.body,
            method: req.method,
            headers: req.headers,
            query: req.query
        };
        h.send_request(options, function (error, response, body, req) {
            res.json(body)
        })
    }
}