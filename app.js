var cluster = require('cluster');
const PORT = process.env.PORT || 5000

// if (cluster.isMaster) {
//     var cpuCount = require('os').cpus().length;
//     // Create a worker for each CPU
//     for (var i = 0; i < 2; i += 1) {
//         cluster.fork();
//     }
// } else {
var express = require('express')
var body_parser = require("body-parser")
var morgan = require('morgan')
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

USER_API_ROOT = 'https://portal-user.herokuapp.com'
REPORT_API_ROOT = USER_API_ROOT
CHAT_API_ROOT = 'http://127.0.0.1:5002'
AUTH_API_ROOT = USER_API_ROOT
NEWS_API_ROOT = 'http://127.0.0.1:5003'
REVIEW_API_ROOT = 'http://127.0.0.1:5004'

app.post('/api/auth', u.auth_api)

app.get('/api/user', u.user_api)
app.post('/api/user', [m.authMiddleware], u.user_api)
app.get('/api/user/:user_id',u.user_api)
app.put('/api/user/:user_id', [m.authMiddleware], u.user_api)
app.get('/api/user/:user_id/friend', [m.authMiddleware], u.user_api)
app.post('/api/user/:user_id/friend/:friend_id', [m.authMiddleware], u.user_api)
app.delete('/api/user/:user_id/friend/:friend_id', [m.authMiddleware], u.user_api)
app.post('/api/user/:user_id/block', [m.authMiddleware], u.user_api)
// app.get('/api/university/:lang', u.user_api)
app.get('/api/department', [m.authMiddleware], [m.authMiddleware], u.user_api)
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


app.get('/api/chair', [m.authMiddleware], u.user_api)
app.get('/api/chair/:id', [m.authMiddleware], u.user_api)
app.get('/api/chair/department/:dep_id', [m.authMiddleware], u.user_api)

app.get('/api/languages', [m.authMiddleware], u.user_api)
app.get('/api/gender', [m.authMiddleware], u.user_api)
app.get('/api/country', [m.authMiddleware], u.user_api)

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

app.get('/api/news', [m.authMiddleware], n.news_api)
    .post('/api/news', [m.authMiddleware], n.news_api)
app.get('/api/news/:news_id', [m.authMiddleware], n.news_api)
    .put('/api/news/:news_id', [m.authMiddleware], n.news_api)
    .delete('/api/news/:news_id', [m.authMiddleware], n.news_api)

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


// if (!module.parent) {
//     // app.listen(3000);

    var server = http.listen(PORT, () => {
        console.log("server is listening on port", server.address().port)
    })
// }
module.exports = app; // for testing

// }