var cluster = require('cluster');
const PORT = process.env.PORT || 5000

if (cluster.isMaster) {
    var cpuCount = require('os').cpus().length;
    // Create a worker for each CPU
    for (var i = 0; i < cpuCount; i += 1) {
        cluster.fork();
    }
} else {
    let express = require('express')
    let body_parser = require("body-parser")
    let morgan = require('morgan')
    let httpProxy = require('express-http-proxy')
    const cache = require('./cache-provider.js')

    let u = require('./controllers/user-controller.js')
    let r = require('./controllers/report-controller.js')
    let c = require('./controllers/chat-controller.js')
    // var n = require('./controllers/news_controller.js')
    let rv = require('./controllers/review-controller.js')
    let m = require('./middleware.js')
    const urls = require('./urls.js')

    let app = express()
    let http = require('http').Server(app)

    var resourceMonitorMiddlewareCB = require('express-watcher').resourceMonitorMiddlewareCB


    app.use(body_parser.json())
    app.use(body_parser.urlencoded({
        extended: false
    }))
    app.use(morgan('combined'))
    app.use(function (req, res, next) {
        resourceMonitorMiddlewareCB(req, res, next, function (diffJson) {
            console.log(' diffJson : ', diffJson)
        })
    })


    let cur = 0
    let servers = [
        urls.USER_API_ROOT
        // "https://portal-user-app.herokuapp.com",
        // "https://portal-user1.herokuapp.com",
        // "https://portal-user2.herokuapp.com"
        // "https://portal-user3.herokuapp.com",
        // "https://portal-user4.herokuapp.com",
        // "https://portal-user5.herokuapp.com",
        // "https://portal-user6.herokuapp.com",
        // "https://portal-user7.herokuapp.com",
        // "https://portal-user8.herokuapp.com",
        // "https://portal-user-9.herokuapp.com",
        // "https://portal-user10.herokuapp.com",
        // "https://portal-user11.herokuapp.com"

    ]

    const userServiceProxy = httpProxy(urls.USER_API_ROOT, {
        userResHeaderDecorator(headers, userReq, userRes, proxyReq, proxyRes) {
          // recieves an Object of headers, returns an Object of headers.
          console.log(userRes)
          return headers;
        }
    });
    const reportServiceProxy = httpProxy(urls.REPORT_API_ROOT)
    const chatServiceProxy = httpProxy(urls.CHAT_API_ROOT)
    const authServiceProxy = httpProxy(urls.AUTH_API_ROOT)
    const newsServiceProxy = httpProxy(urls.NEWS_API_ROOT)
    const reviewServiceProxy = httpProxy(urls.REVIEW_API_ROOT)



    app.use(function (req, res, next) {
        if (req.method == 'GET') {
            try {
                value = cache.instance().get(req.url, true);
                res.json(value)
            } catch (err) {
                
                next()
            }
        } else
            next();
    });

    function getUserUrl() {
        url = servers[cur]
        cur = (cur + 1) % servers.length
        console.log(url)
        return url
    }

    app.post('/api/auth', httpProxy(getUserUrl))
    app.get('/api/user', [m.authMiddleware], httpProxy(getUserUrl))
    app.post('/api/user', httpProxy(getUserUrl))
    app.get('/api/user/:user_id', [m.authMiddleware], httpProxy(getUserUrl))
    app.put('/api/user/:user_id', [m.authMiddleware], httpProxy(getUserUrl))
    app.get('/api/user/:user_id/friend', [m.authMiddleware], httpProxy(getUserUrl))
    app.post('/api/user/:user_id/friend/:friend_id', [m.authMiddleware], httpProxy(getUserUrl))
    app.delete('/api/user/:user_id/friend/:friend_id', [m.authMiddleware], httpProxy(getUserUrl))
    app.post('/api/user/:user_id/block', [m.authMiddleware], httpProxy(getUserUrl))
    app.get('/api/department', [m.authMiddleware], httpProxy(getUserUrl))
    app.get('/api/department/:dep_id', [m.authMiddleware], (req, res) => {

        fields = req.query.fields.split(',');
        index = fields.indexOf('chairs')
        if (index > -1) {
            fields.splice(index, 1)
            u.depr_aggregation_api(req, res)
        } else {
            u.user_api(req, res)
        }
    })


    app.get('/api/chair', [m.authMiddleware], userServiceProxy)
    app.get('/api/chair/:id', [m.authMiddleware], userServiceProxy)
    app.get('/api/chair/department/:dep_id', [m.authMiddleware], userServiceProxy)
    app.get('/api/buddy', [m.authMiddleware], userServiceProxy)
    app.get('/api/buddy/:_id', [m.authMiddleware], userServiceProxy)


    app.get('/api/languages', [m.authMiddleware], userServiceProxy)
    app.get('/api/gender', [m.authMiddleware], userServiceProxy)

    app.get('/api/country', [m.authMiddleware], userServiceProxy)

    app.get('/api/report/:status', [m.authMiddleware], reportServiceProxy)
        .put('/api/report/:status', [m.authMiddleware], reportServiceProxy)
    app.post('/api/report', [m.authMiddleware], reportServiceProxy)
    app.get('/api/report', [m.authMiddleware], reportServiceProxy)

    app.get('/api/chat/:chat_id', [m.authMiddleware], chatServiceProxy)
    app.get('/api/chat/user/:user1', [m.authMiddleware], c.chats_aggregation)
    app.get('/api/chat/users/:user1/:user2', [m.authMiddleware], chatServiceProxy)
        .post('/api/chat/users/:user1/:user2', [m.authMiddleware], chatServiceProxy)
    app.get('/api/chat/:chat_id/message', [m.authMiddleware], chatServiceProxy)
    app.get('/api/chat/user/user_id/message', [m.authMiddleware], chatServiceProxy)
    app.post('/api/chat/:chat_id/user/:user_id', [m.authMiddleware], chatServiceProxy)

    app.get('/api/news', [m.authMiddleware], newsServiceProxy)
        .post('/api/news', [m.authMiddleware], newsServiceProxy)
    app.get('/api/news/:news_id', [m.authMiddleware], newsServiceProxy)
        .put('/api/news/:news_id', [m.authMiddleware], newsServiceProxy)
        .delete('/api/news/:news_id', [m.authMiddleware], newsServiceProxy)

    app.get('/api/review', [m.authMiddleware], reviewServiceProxy)
        .post('/api/review', [m.authMiddleware], reviewServiceProxy)

    app.get('/api/review/:id', [m.authMiddleware], reviewServiceProxy)
    app.put('/api/review/:id', [m.authMiddleware], reviewServiceProxy)
    app.delete('/api/review/:id', [m.authMiddleware], reviewServiceProxy)

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