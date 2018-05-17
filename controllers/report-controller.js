var h = require('../helper.js')
module.exports = {
 report_api:function(req, res){
    var status = req.params.status
    var options = {
        uri: REPORT_API_ROOT  + req.url,
        json: req.body,
        method:  req.method,
        headers: req.headers
    };
    h.send_request(options, function (error, response, body, req) {
        res.status(body.statusCode).json(body)
    })  
}
}