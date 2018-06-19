var h = require('../helper.js')
const urls = require('../urls.js')

module.exports = {
 report_api:function(req, res){
    var status = req.params.status
    var options = {
        uri: urls.REPORT_API_ROOT  + req.url,
        json: req.body,
        method:  req.method
        };
    h.send_request(options, function (error, response, body, req) {
        res.json(body)
    })  
}
}