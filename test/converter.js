process.env.NODE_ENV = 'test';

let chai = require('chai');
let server = require('../app.js');
let chaiHttp = require('chai-http');
let jwt = require('jsonwebtoken')

let should = chai.should();
let token = 'vMzXeYn3Yeebh40QySq3Ccd9VNEY3bvbKZbh7RqUlQFXnixo1QtmsLO7ACJcMROU'
chai.use(chaiHttp);

describe('/GET something CHECK auth', () => {
    it('it should be UNAUTHORIZED 401', (done) => {
        chai.request(server)
            .get('/api/chair/1')
            .end((err, res) => {
                res.body.should.have.property('response');
                res.body.should.have.property('statusCode');
                res.should.have.status(401);
                done();
            });
    });
    it('it should be NOT FOUND 404', (done) => {
        chai.request(server)
            .get('/api/chair/1')
            .set('Authorization', 'Bearer jfkldsjflk')
            .end((err, res) => {
                res.body.should.have.property('response');
                res.body.should.have.property('statusCode');
                res.body.should.status(404)
                done();
            });
    });

    it('it should be BAD REQUEST, 400', (done) => {
        chai.request(server)
            .get('/api/chair/1')
            .set('Authorization', 'Bfdsf')
            .end((err, res) => {
                res.body.should.have.property('response');
                res.body.should.have.property('statusCode');
                res.body.should.status(400)
                done();
            });
    });

    it('it should be SUCCESS, 200', (done) => {
        chai.request(server)
            .get('/api/chair/1')
            .set('Authorization', `Bearer ${token}`)
            .end((err, res) => {
                res.body.should.have.property('response');
                res.body.should.have.property('statusCode');
                res.body.should.status(200)
                done();
            });
    });
});

describe('/POST login authorization', () => {
    user = {
        email: "se11d002@gmail.com",
        password: "blabla"
    }
    payload = jwt.sign(user, 'f*ckyou');

    it('it should be FAIL, 400', (done) => {
        chai.request(server)
        .post('/api/auth')
        .end((err, res) => {
            // res.body.should.have.property('response');
            // res.body.should.have.property('statusCode');
            res.body.should.status(400)
            done();
        });
    });

    it('it should be FAIL, 400', (done) => {
        chai.request(server)
        .post('/api/auth')
        .end((err, res) => {
            res.body.should.status(400)
            done();
        });
    });

    // it('it should be SUCCESS, 200', (done) => {
    //     chai.request(server)
    //     .post('/api/auth')
    //     .send({payload: payload})
    //     .end((err, res) => {
    //         // res.body.should.have.property('response');
    //         // res.body.should.have.property('statusCode');
    //         res.body.should.status(200)
    //         done();
    //     });
    // });
})
