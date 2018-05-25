var h = require('./helper.js')
const rp = require('request-promise')

function check_auth(token, res, next) {
    var options = {
        uri: `${AUTH_API_ROOT}/api/check_authorization/${token}`,
        method: 'GET',
        json: {}
    };
    rp(options).then((response) => {
        console.log(response)
        if (response.statusCode == 200)
            next()
        else {
            // b = JSON.parse(body)
            res.status(response.statusCode).json(body)
        }
    }).catch((error)=>{
        res.status(400).json({error:error})
    })
    // next()
}

module.exports = {
    authMiddleware: function (req, res, next) {
        auth_header = req.headers.authorization
        console.log(auth_header)
        if (auth_header != undefined) {
            tokens = auth_header.split(" ")
            if (tokens.length == 2) {
                check_auth(tokens[1], res, next)
            } else
                res.status(400).json({
                    response: "Bad request",
                    statusCode: 400
                })
        } else
            res.status(401).json({
                response: "Authorization required",
                statusCode: 401
            })
        // next()
        // var options = {
        //     uri: AUTH_API_ROOT  + '/api/check_authorization/',
        //     json: req.body,
        //     method: req.method,
        //     headers: {"Authorization": req.headers.authorization}
        // };
        // h.send_request(options, function (error, response, body, req) {

        // })

    }
}
