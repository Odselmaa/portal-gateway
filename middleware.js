var h = require('./helper.js')

AUTH_API_ROOT = 'https://portal-user.herokuapp.com/api'

function check_auth(token, res,  next){
    var options = {
        uri: `${AUTH_API_ROOT}/check_authorization/${token}`,
        method: 'GET',
        json: {}
    };
    h.send_request(options, function (error, response, body, req) {
        if(response.statusCode==200)
            next()
        else{
            // b = JSON.parse(body)
            res.json(body)
        }
    })
}

module.exports = {
    authMiddleware: function (req, res, next) {
        auth_header = req.headers.authorization
        if(auth_header!=undefined){
            tokens = auth_header.split(" ")
            if(tokens.length == 2){
                check_auth(tokens[1], res, next)
            }
            else
                res.status(400).json({response: "Bad request", statusCode: 400})
        }else
            res.status(401).json({response: "Authorization required", statusCode: 401})

        // var options = {
        //     uri: AUTH_API_ROOT  + '/api/check_authorization/',
        //     json: req.body,
        //     method: req.method,
        //     headers: {"Authorization": req.headers.authorization}
        // };
        // h.send_request(options, function (error, response, body, req) {
        //     
        // })
       
    }
}