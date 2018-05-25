var h = require('../helper.js')
const rp = require('request-promise')



module.exports = {
    user_api: async function (req, res) {

        var options = {
            uri: USER_API_ROOT + req.url,
            json: req.body,
            method: req.method,
            timeout: 50000,
            // headers: req.headers,
            // rejectUnauthorized: false
        };
        // h.send_request(options, function (error, response, body, req) {
        //     // console.log(body)
        //     res.status(response.statusCode).json(body)
        // })
        try {
            const response = await rp(options);
            return Promise.resolve(response);
        } catch (error) {
            return Promise.resolve({error:error});
        }
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

    auth_api: async function (req, res) {

        var options = {
            uri: AUTH_API_ROOT + req.url,
            json: req.body,
            method: req.method,
            // headers: req.headers,
        };
        // h.send_request(options, function (error, response, body, req) {
        //     console.log(body)
        //     res.status(response.statusCode).json(body)
        // })
        rp(options)
            .then(function (body) {
                console.log(body)

                res.json(body)
            })
            .catch(function (err) {
                res.json({
                    error: err
                })
            });
    }
}