var h = require('../helper.js')

module.exports = {
    chat_api: function (req, res) {
        var options = {
            uri: CHAT_API_ROOT + req.url,
            json: req.body,
            method: req.method,
            headers: req.headers
        };
        h.send_request(options, function (error, response, body, req) {
            res.json(body)
        })
    },

    chats_aggregation: function (request, res) {
        var user1 = request.params.user1
        var headers = request.headers
        new Promise(function (resolve, reject) {
            var options = {
                uri: CHAT_API_ROOT + request.url,
                json: request.body,
                method: request.method,
                headers: request.headers
            };
            h.send_request(options, function (error, response, body, req) {
                if (!error && body.statusCode == 200) resolve(body)
                else reject(new Error("Whoops!"));
            })
        })
        .then(function (body) { // (**)
            return new Promise((resolve, reject) => {
                chats = body.response
                body.participants = {}
                var promises = [];
                var index_chat = 0;
                var index_parts = 0;
                for (var i = 0; i < chats.length; i++) {
                    parts = chats[i].participants
                    for (var j = 0; j < parts.length; j++) {
                        _id = parts[j]['id']
                        if (_id != user1) {
                            var opt = {
                                uri: USER_API_ROOT + '/api/user/' + _id,
                                json: {
                                    fields: ["firstname", "lastname", "profile"]
                                },
                                method: 'GET',
                                headers: {
                                    Authorization: headers.authorization
                                }
                            };
                            var prom = new Promise(function (resolve, reject) {
                                h.send_request(opt, function (error, response, body1, req) {

                                    if (!error && body1.statusCode == 200) {
                                        body.response[index_chat].participants = body1.response
                                        resolve(body1.response)
                                    } else {
                                        reject(new Error("In chat api, something went wrong"))
                                    }
                                    index_chat++;
                                })
                            })
                            promises.push(prom)
                        }
                        index_parts++
                    }
                    index_parts = 0
                }
                Promise.all(promises).then((result) => {
                    // body.participants = result
                    resolve(body)
                });
            })
        }).then(function (body) {

            res.json(body)
        })
    }
}