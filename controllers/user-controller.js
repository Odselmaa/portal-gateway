var h = require('../helper.js')

module.exports = {
    user_api: function (req, res) {
        var options = {
            uri: USER_API_ROOT + req.url,
            json: req.body,
            method: req.method,
            // headers: req.headers,
            // rejectUnauthorized: false
        };
        h.send_request(options, function (error, response, body, req) {
            console.log(error)
            res.json(body)
        })
    },
    depr_aggregation_api: function (req, res) {
        var lang = req.query.lang
        var get_department = function (options) {
            var promise = new Promise(function (resolve, reject) {

                h.send_request(options, function (error, response, body, req) {
                    if (body.statusCode == 200) {
                        resolve(body);
                    } else {
                        resolve({});
                    }
                })
            });
            return promise;
        };
        var get_chairs = function (department) {
            // 
            var promise = new Promise(function (resolve, reject) {
                var options = {
                    uri: USER_API_ROOT + `/api/chair/department/${department.response._id}?lang=${lang}`,
                    json: {},
                    method: req.method,
                    headers: {
                        "Authorization": req.headers.authorization
                    }
                };
                h.send_request(options, function (error, response, body, req) {
                    if (body.statusCode == 200) {
                        department.response.chairs = body.response
                    } else {
                        department.response.chairs = []
                    }
                    resolve(department);
        
                })
            });
            return promise;
        };


        var options = {
            uri: USER_API_ROOT + req.url,
            json: req.body,
            method: req.method,
            headers: {
                "Authorization": req.headers.authorization
            }
        };
        // 
        get_department(options)
            .then(get_chairs)
            .then((body) => {
                
                res.json(body)
            }).catch(() => {
                res.json({
                    response: "Not okay",
                    statusCode: 400
                })

            });
    },

    auth_api: function (req, res) {
        var options = {
            uri: AUTH_API_ROOT + req.url,
            json: req.body,
            method: req.method,
            // headers: req.headers
        };
        h.send_request(options, function (error, response, body, req) {
            res.json(body)
        })
    }
}