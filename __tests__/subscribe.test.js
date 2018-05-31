import should from 'should';
import supertest from 'supertest';
const domain = process.env.DOMAIN;
const server = supertest.agent(domain);

describe('test subscribe & send with 3 types', () => {
  it('1) unsubscribe first to clear old data', (done) => {
    const requestBody = {
      deviceId: '36A71C52-D2DB-49C5-AFF8-2CDCA2D6D42C',
    };
    server
      .post('/sns/unsubscribe')
      .send(requestBody)
      .set('Accept', 'application/json')
      .expect('Content-type', /json/)
      .expect(200) // THis is HTTP response
      .end((err, res) => {
        res.status.should.equal(200);
        res.body.should.have.property('code');
        res.body.should.have.property('isSuccess');
        res.body.code.should.equal(200);
        res.body.isSuccess.should.equal(true);
        done();
      });
  });
  it('2) subscribe', (done) => {
    const requestBody = {
      deviceId: '36A71C52-D2DB-49C5-AFF8-2CDCA2D6D42C',
      userId: 'lamdaUserId',
      groupId: 'lamdaGroupId',
      deviceToken: 'F04AD3AD3B5C6F8FAFB65A8517297AAC',
    };
    server
      .post('/sns/subscribe')
      .send(requestBody)
      .set('Accept', 'application/json')
      .expect('Content-type', /json/)
      .expect(200) // THis is HTTP response
      .end((err, res) => {
        res.status.should.equal(200);
        res.body.should.have.property('code');
        res.body.should.have.property('isSuccess');
        res.body.code.should.equal(200);
        res.body.isSuccess.should.equal(true);

        res.body.data.should.have.property('subscriptionArns').with.lengthOf(2);
        res.body.data.should.have.property('endpointArn');
        done();
      });
  });
  it('3) send By Group', (done) => {
    const requestBody = {
      title: 'lamdaTitle',
      content: 'lamdaContent',
      groupId: 'lamdaGroupId',
    };
    server
      .post('/sns/sendByGroup')
      .send(requestBody)
      .set('Accept', 'application/json')
      .expect('Content-type', /json/)
      .expect(200) // THis is HTTP response
      .end((err, res) => {
        res.status.should.equal(200);
        res.body.should.have.property('code');
        res.body.should.have.property('isSuccess');
        res.body.code.should.equal(200);
        res.body.isSuccess.should.equal(true);

        res.body.data.ResponseMetadata.should.have.property('RequestId');
        res.body.data.should.have.property('MessageId');
        done();
      });
  });
  it('4) send By User', (done) => {
    const requestBody = {
      title: 'lamdaTitle',
      content: 'lamdaContent',
      groupId: 'lamdaGroupId',
      userId: 'lamdaUserId',
    };
    server
      .post('/sns/sendByUser')
      .send(requestBody)
      .set('Accept', 'application/json')
      .expect('Content-type', /json/)
      .expect(200) // THis is HTTP response
      .end((err, res) => {
        res.status.should.equal(200);
        res.body.should.have.property('code');
        res.body.should.have.property('isSuccess');
        res.body.code.should.equal(200);
        res.body.isSuccess.should.equal(true);

        (res.body.data.publishCb.length).should.be.above(0);
        (res.body.data.items.length).should.be.above(0);
        done();
      });
  });
  it('5) send By Device', (done) => {
    const requestBody = {
      title: 'lamdaTitle',
      content: 'lamdaContent',
      deviceId: '36A71C52-D2DB-49C5-AFF8-2CDCA2D6D42C',
    };
    server
      .post('/sns/sendByDevice')
      .send(requestBody)
      .set('Accept', 'application/json')
      .expect('Content-type', /json/)
      .expect(200) // THis is HTTP response
      .end((err, res) => {
        res.status.should.equal(200);
        res.body.should.have.property('code');
        res.body.should.have.property('isSuccess');
        res.body.code.should.equal(200);
        res.body.isSuccess.should.equal(true);

        (res.body.data.publishCb.length).should.be.above(0);
        (res.body.data.items.length).should.be.above(0);
        done();
      });
  });
  it('6) unsubscribe', (done) => {
    const requestBody = {
      deviceId: '36A71C52-D2DB-49C5-AFF8-2CDCA2D6D42C',
    };
    server
      .post('/sns/unsubscribe')
      .send(requestBody)
      .set('Accept', 'application/json')
      .expect('Content-type', /json/)
      .expect(200) // THis is HTTP response
      .end((err, res) => {
        res.status.should.equal(200);
        res.body.should.have.property('code');
        res.body.should.have.property('isSuccess');
        res.body.code.should.equal(200);
        res.body.isSuccess.should.equal(true);
        done();
      });
  });
});
