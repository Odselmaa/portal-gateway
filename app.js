var cluster = require('cluster');
const PORT = process.env.PORT || 5000

if (cluster.isMaster) {
    var cpuCount = require('os').cpus().length;
    // Create a worker for each CPU
    for (var i = 0; i < cpuCount; i += 1) {
        cluster.fork();
    }
} else {
    var express = require('express')
    var body_parser = require("body-parser")
    var morgan = require('morgan')
    const httpProxy = require('express-http-proxy')

    var app = express()
    var http = require('http').Server(app)
    var u = require('./controllers/user-controller.js')
    var r = require('./controllers/report-controller.js')
    var c = require('./controllers/chat-controller.js')
    var n = require('./controllers/news_controller.js')
    var rv = require('./controllers/review-controller.js')

    var h = require('./helper.js')
    var m = require('./middleware.js')
    app.use(body_parser.json())
    app.use(body_parser.urlencoded({
        extended: false
    }))
    app.use(morgan('combined'))

    USER_API_ROOT = 'https://portal-user.herokuapp.com' // "http://localhost:5004"
    REPORT_API_ROOT = USER_API_ROOT
    CHAT_API_ROOT = 'https://portal-chat.herokuapp.com' //"http://localhost:5002"
    AUTH_API_ROOT = USER_API_ROOT
    NEWS_API_ROOT = 'https://portal-news-api.herokuapp.com'
    REVIEW_API_ROOT = 'https://portal-review.herokuapp.com'

    const userServiceProxy = httpProxy(USER_API_ROOT)
    const reportServiceProxy = httpProxy(REPORT_API_ROOT)
    const chatServiceProxy = httpProxy(CHAT_API_ROOT)
    const authServiceProxy = httpProxy(AUTH_API_ROOT)
    const newsServiceProxy = httpProxy(NEWS_API_ROOT)
    const reviewServiceProxy = httpProxy(REVIEW_API_ROOT)


    app.post('/api/auth', (req, res, next) => {
        userServiceProxy(req, res, next)
    })

    app.get('/api/user', (req, res, next) => {
        userServiceProxy(req, res, next)
    })
    app.post('/api/user', [m.authMiddleware], (req, res, next) => {
        userServiceProxy(req, res, next)
    })
    app.get('/api/user/:user_id', (req, res, next) => {
        userServiceProxy(req, res, next)
    })

    app.put('/api/user/:user_id', [m.authMiddleware], (req, res, next) => {
        userServiceProxy(req, res, next)
    })
    app.get('/api/user/:user_id/friend', [m.authMiddleware], (req, res, next) => {
        userServiceProxy(req, res, next)
    })
    app.post('/api/user/:user_id/friend/:friend_id', [m.authMiddleware], (req, res, next) => {
        userServiceProxy(req, res, next)
    })
    app.delete('/api/user/:user_id/friend/:friend_id', [m.authMiddleware], (req, res, next) => {
        userServiceProxy(req, res, next)
    })
    app.post('/api/user/:user_id/block', [m.authMiddleware], (req, res, next) => {
        userServiceProxy(req, res, next)
    })
    // app.get('/api/university/:lang',  (req, res, next)=>{         userServiceProxy(req, res, next)     })
    app.get('/api/department', [m.authMiddleware], [m.authMiddleware], (req, res, next) => {
        userServiceProxy(req, res, next)
    })

    app.get('/api/department/:dep_id', [m.authMiddleware], [m.authMiddleware], (req, res) => {

        fields = req.query.fields.split(',');
        index = fields.indexOf('chairs')
        if (index > -1) {
            fields.splice(index, 1)

            u.depr_aggregation_api(req, res)
        } else {
            u.user_api(req, res)
        }
    })


    app.get('/api/chair', [m.authMiddleware], (req, res, next) => {
        userServiceProxy(req, res, next)
    })
    app.get('/api/chair/:id', [m.authMiddleware], (req, res, next) => {
        userServiceProxy(req, res, next)
    })
    app.get('/api/chair/department/:dep_id', [m.authMiddleware], (req, res, next) => {
        userServiceProxy(req, res, next)
    })

    app.get('/api/languages', [m.authMiddleware], (req, res, next) => {
        userServiceProxy(req, res, next)
    })

    app.get('/api/gender', [m.authMiddleware], (req, res, next) => {
        userServiceProxy(req, res, next)
    })

    app.get('/api/country', (req, res, next) => {
        userServiceProxy(req, res, next)
    })

    app.get('/api/report/:status', [m.authMiddleware], r.report_api)
        .put('/api/report/:status', [m.authMiddleware], r.report_api)
    app.post('/api/report', [m.authMiddleware], r.report_api)
    app.get('/api/report', [m.authMiddleware], r.report_api)

    app.get('/api/chat/:chat_id', [m.authMiddleware], c.chat_api)
    app.get('/api/chat/user/:user1', [m.authMiddleware], c.chats_aggregation)
    app.get('/api/chat/users/:user1/:user2', [m.authMiddleware], c.chat_api)
        .post('/api/chat/users/:user1/:user2', [m.authMiddleware], c.chat_api)
    app.get('/api/chat/:chat_id/message', [m.authMiddleware], c.chat_api)
    app.get('/api/chat/user/user_id/message', [m.authMiddleware], c.chat_api)
    app.post('/api/chat/:chat_id/user/:user_id', [m.authMiddleware], c.chat_api)

    app.get('/api/news', [m.authMiddleware], (req, res, next) => {
            newsServiceProxy(req, res, next)
        })
        .post('/api/news', [m.authMiddleware], (req, res, next) => {
            newsServiceProxy(req, res, next)
        })
    app.get('/api/news/:news_id', [m.authMiddleware], (req, res, next) => {
            newsServiceProxy(req, res, next)
        })
        .put('/api/news/:news_id', [m.authMiddleware], (req, res, next) => {
            newsServiceProxy(req, res, next)
        })
        .delete('/api/news/:news_id', [m.authMiddleware], (req, res, next) => {
            newsServiceProxy(req, res, next)
        })

    app.get('/api/review', [m.authMiddleware], rv.review_api)
        .post('/api/review', [m.authMiddleware], rv.review_api)

    app.get('/api/review/:id', [m.authMiddleware], rv.review_api)
    app.put('/api/review/:id', [m.authMiddleware], rv.review_api)
    app.delete('/api/review/:id', [m.authMiddleware], rv.review_api)

    app.post('/api/review/department', [m.authMiddleware], rv.dep_review_api)
    app.get('/api/review/department/report', rv.dep_review_report_api)

    app.get('/api/review/department/:id', [m.authMiddleware], rv.dep_review_api)
    app.get('/api/review/chair/:id', [m.authMiddleware], rv.dep_review_api)
    app.post('/api/review/chair', [m.authMiddleware], rv.dep_review_api)

    app.use(function (err, req, res, next) {
        console.error(err.stack)
        res.status(500).json({
            response: 'Something broke!',
            statusCode: 500
        })
    })

    var server = http.listen(PORT, () => {
        console.log("server is listening on port", server.address().port)
    })
    process.on('uncaughtException', function (err) {
        console.log(err);
    });

    module.exports = app; // for testing

}