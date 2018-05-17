var h = require('../helper.js')

function get(options) {
    var promise = new Promise(function (resolve, reject) {
        h.send_request(options, function (error, response, body, req) {
            // user[user_id] = body.response
            
            resolve(body.response)
        })
    });
    return promise
}

function get_users(req, users, next) {
    // var reviews = body.response.reviews
    var promises = []
    fields = ['firstname', 'lastname'].join(',')
    var options = {
        json: { },
        method: 'GET',
        headers: {
            "Authorization": req.headers.authorization
        }
    };
    for (var i = 0; i < users.length; i++) {
        options.uri = `${USER_API_ROOT}/api/user/${users[i]}?fields=${fields}`
        promises.push(get(options))
    }

    Promise.all(promises).then((values) => {
        authors = {}
        // 
        for (var i = 0; i < values.length; i++) {
            if (values[i] != undefined)
                authors[values[i]._id] = values[i]
        }
        next(authors)
    })
}

function get_departments(req, deps, next) {
    // var reviews = body.response.reviews
    var promises = []
    var options = {
        json: {
        },
        method: 'GET',
        headers: {
            "Authorization": req.headers.authorization
        }
    };
    for (var i = 0; i < deps.length; i++) {
        options.uri = `${USER_API_ROOT}/api/department/${deps[i]}?lang=${lang}&fields=name`
        promises.push(get(options))
    }

    Promise.all(promises).then((values) => {
        departments = {}
        // 
        for (var i = 0; i < values.length; i++) {
            if (values[i] != undefined)
            departments[values[i]._id] = values[i]
        }
        next(departments)
    })
}

module.exports = {
    review_api: function (req, res) {
        var options = {
            uri: REVIEW_API_ROOT + req.url,
            json: req.body,
            method: req.method,
            headers: req.headers
        };
        h.send_request(options, function (error, response, body, req) {
            res.json(body)
        })
    },

    dep_review_api: function (req, res) {
        var options = {
            uri: REVIEW_API_ROOT + req.url,
            json: req.body,
            method: req.method,
            headers: {
                "Authorization": req.headers.authorization
            }
        };
        h.send_request(options, function (error, response, body, request) {
            if (body.statusCode == 200) {
                users = []
                reviews = body.response.reviews
                for (var i = 0; i < reviews.length; i++) {
                    users.push(reviews[i].author)
                }

                get_users(req, users, (authors) => {
                    body.response.authors = authors
                    res.json(body)
                })
                // 
            } else
                res.json(body)
        })
    },

    dep_review_report_api: function (req, res) {

        var options = {
            uri: REVIEW_API_ROOT + req.url,
            json: req.body,
            method: req.method,
            headers: {
                "Authorization": req.headers.authorization
            }
        };
        h.send_request(options, function (error, response, body, request) {
            if (!error && body.statusCode == 200) {
                dep_ids = []
                deps = body.response
                for (var i = 0; i < deps.length; i++) {
                    dep_ids.push(deps[i]._id)
                }

                get_departments(req, dep_ids, (departments) => {
                    report = body.response
                    body.response = {report: report}
                    body.response.departments = departments
                    res.json(body)
                })
            } else
                res.json(body)
        })
    }
}