var h = require('./helper.js')
const rp = require('request-promise')
const urls = require('./urls.js')
let auth_servers = [urls.AUTH_API_ROOT
    ,
      'https://portal-auth1.herokuapp.com',
      'https://portal-auth2.herokuapp.com',
      'https://portal-auth3.herokuapp.com',
      'https://portal-auth4.herokuapp.com',
      'https://portal-auth5.herokuapp.com',
      'https://portal-auth6.herokuapp.com'

    ]
let current = 0

function getAuthUrl(){
    auth_url = auth_servers[current]
    current = (current + 1) % auth_servers.length
    return auth_url
}

function check_auth(token, res, next) {
    var options = {
        uri: `${getAuthUrl()}/api/check_authorization/${token}`,
        method: 'GET',
        json: {}
    };
    rp(options).then((response) => {
        // console.log(response)
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

    }
}
