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

    let u = require('./controllers/user-controller.js')
    let r = require('./controllers/report-controller.js')
    let c = require('./controllers/chat-controller.js')
    // var n = require('./controllers/news_controller.js')
    let rv = require('./controllers/review-controller.js')
    let m = require('./middleware.js')

    let app = express()
    let http = require('http').Server(app)


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

    let cur = 0
    let servers = [USER_API_ROOT,"https://portal-user-app.herokuapp.com", "https://portal-user1.herokuapp.com","https://portal-user2.herokuapp.com" ]
    const userServiceProxy = httpProxy(USER_API_ROOT)
    const reportServiceProxy = httpProxy(REPORT_API_ROOT)
    const chatServiceProxy = httpProxy(CHAT_API_ROOT)
    const authServiceProxy = httpProxy(AUTH_API_ROOT)
    const newsServiceProxy = httpProxy(NEWS_API_ROOT)
    const reviewServiceProxy = httpProxy(REVIEW_API_ROOT)

    // function userAPI(req, res, next){
    //     cur = (cur + 1) % servers.length
    //     console.log(cur)
    //     userServiceProxy(req, res, next)
    // }
    function getUserUrl(){
        url = servers[cur]
        cur = (cur + 1) % servers.length
        console.log(url)
        return url
    }

    app.post('/api/auth', userServiceProxy)
    app.get('/api/user', [m.authMiddleware], httpProxy(getUserUrl))
    app.post('/api/user',  httpProxy(getUserUrl))
    app.get('/api/user/:user_id',[m.authMiddleware],  httpProxy(getUserUrl))
    app.put('/api/user/:user_id', [m.authMiddleware], httpProxy(getUserUrl))
    app.get('/api/user/:user_id/friend', [m.authMiddleware], httpProxy(getUserUrl))
    app.post('/api/user/:user_id/friend/:friend_id', [m.authMiddleware], httpProxy(getUserUrl))
    app.delete('/api/user/:user_id/friend/:friend_id', [m.authMiddleware], httpProxy(getUserUrl))
    app.post('/api/user/:user_id/block', [m.authMiddleware], httpProxy(getUserUrl))
    // app.get('/api/university/:lang',  (req, res, next)=>{         userServiceProxy(req, res, next)     })
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


    app.get('/api/chair', [m.authMiddleware],userServiceProxy)
    app.get('/api/chair/:id', [m.authMiddleware], userServiceProxy)
    app.get('/api/chair/department/:dep_id', [m.authMiddleware], userServiceProxy)

    app.get('/api/languages', [m.authMiddleware],userServiceProxy)
    app.get('/api/gender', [m.authMiddleware],userServiceProxy)

    app.get('/api/country',[m.authMiddleware], userServiceProxy)

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
        .put('/api/news/:news_id', [m.authMiddleware],newsServiceProxy)
        .delete('/api/news/:news_id', [m.authMiddleware],newsServiceProxy)

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