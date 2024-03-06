/* global describe, it, expect */

var expect = require('chai').expect;
var chai = require('chai');
var $require = require('proxyquire');
var sinon = require('sinon');
var factory = require('../../com/handlers/prompt');


describe('handlers/prompt', function() {
  
  it('should create handler', function() {
    var bodyParserSpy = sinon.spy();
    var csurfSpy = sinon.spy();
    var flowstateSpy = sinon.spy();
    var factory = $require('../../com/handlers/prompt', {
      'body-parser': { urlencoded: bodyParserSpy },
      'csurf': csurfSpy,
      'flowstate': flowstateSpy
    });
    
    var store = new Object();
    var handler = factory(undefined, undefined, store);
    
    expect(handler).to.be.an('array');
    expect(bodyParserSpy).to.be.calledOnce;
    expect(bodyParserSpy).to.be.calledBefore(csurfSpy);
    expect(bodyParserSpy).to.be.calledWith({ extended: false });
    expect(csurfSpy).to.be.calledOnce;
    expect(csurfSpy).to.be.calledBefore(flowstateSpy);
    expect(flowstateSpy).to.be.calledOnce;
    expect(flowstateSpy).to.be.calledWith({ store: store });
  });
  
  describe('handler', function() {
    
    it('should challenge telephone number via sms by default', function(done) {
      var channel = new Object();
      channel.transmit = sinon.stub().yieldsAsync(null, { transport: 'sms' });
      var channelFactory = new Object();
      channelFactory.create = sinon.stub().resolves(channel);
      var address = new Object();
      address.parse = sinon.stub().returns({ scheme: 'tel', address: '+1-201-555-0123' });
      var store = new Object();
      store.set = sinon.stub().yieldsAsync(null);
      var handler = factory(channelFactory, address, store);
    
      chai.express.use(handler)
        .request(function(req, res) {
          req.url = '/login/oob';
          req.headers = {
            'host': 'www.example.com'
          }
          req.body = {
            address: '201-555-0123'
          };
          req.session = {};
          req.connection = { encrypted: true };
        })
        .finish(function() {
          expect(address.parse).to.have.been.calledOnceWith('201-555-0123');
          expect(channelFactory.create).to.have.been.calledOnceWith('tel');
          expect(store.set).to.have.been.calledOnce;
          var state = store.set.getCall(0).args[2];
          expect(channel.transmit).to.have.been.calledOnceWith('+1-201-555-0123', undefined, state.secret);
          expect(state).to.deep.equal({
            location: 'https://www.example.com/login/oob',
            channel: 'tel',
            address: '+1-201-555-0123',
            transport: 'sms',
            secret: state.secret
          });
          expect(state.secret).to.have.length(6);
          
          expect(this).to.have.status(200);
          expect(this).to.render('login/oob');
          expect(this).to.include.locals([ 'channel', 'address', 'transport', 'csrfToken' ]);
          expect(this.locals.channel).to.equal('tel');
          expect(this.locals.address).to.equal('+1-201-555-0123');
          expect(this.locals.transport).to.equal('sms');
          done();
        })
        .listen();
    }); // should challenge telephone number via sms by default
    
    it('should challenge telephone number via call by request', function(done) {
      var channel = new Object();
      channel.transmit = sinon.stub().yieldsAsync(null, { transport: 'call' });
      var channelFactory = new Object();
      channelFactory.create = sinon.stub().resolves(channel);
      var address = new Object();
      address.parse = sinon.stub().returns({ scheme: 'tel', address: '+1-201-555-0123' });
      var store = new Object();
      store.set = sinon.stub().yieldsAsync(null);
      var handler = factory(channelFactory, address, store);
    
      chai.express.use(handler)
        .request(function(req, res) {
          req.url = '/login/oob';
          req.headers = {
            'host': 'www.example.com'
          }
          req.body = {
            address: '201-555-0123',
            transport: 'call'
          };
          req.session = {};
          req.connection = { encrypted: true };
        })
        .finish(function() {
          expect(address.parse).to.have.been.calledOnceWith('201-555-0123');
          expect(channelFactory.create).to.have.been.calledOnceWith('tel');
          expect(store.set).to.have.been.calledOnce;
          var state = store.set.getCall(0).args[2];
          expect(channel.transmit).to.have.been.calledOnceWith('+1-201-555-0123', 'call', state.secret);
          expect(state).to.deep.equal({
            location: 'https://www.example.com/login/oob',
            channel: 'tel',
            address: '+1-201-555-0123',
            transport: 'call',
            secret: state.secret
          });
          expect(state.secret).to.have.length(6);
          
          expect(this).to.have.status(200);
          expect(this).to.render('login/oob');
          expect(this).to.include.locals([ 'channel', 'address', 'transport', 'csrfToken' ]);
          expect(this.locals.channel).to.equal('tel');
          expect(this.locals.address).to.equal('+1-201-555-0123');
          expect(this.locals.transport).to.equal('call');
          done();
        })
        .listen();
    }); // should challenge telephone number via call by request
    
    it('should challenge email address', function(done) {
      var channel = new Object();
      channel.transmit = sinon.stub().yieldsAsync(null);
      var channelFactory = new Object();
      channelFactory.create = sinon.stub().resolves(channel);
      var address = new Object();
      address.parse = sinon.stub().returns({ scheme: 'mailto', address: 'alice@example.com' });
      var store = new Object();
      store.set = sinon.stub().yieldsAsync(null);
      var handler = factory(channelFactory, address, store);
    
      chai.express.use(handler)
        .request(function(req, res) {
          req.url = '/login/oob';
          req.headers = {
            'host': 'www.example.com'
          }
          req.body = {
            address: 'alice@example.com'
          };
          req.session = {};
          req.connection = { encrypted: true };
        })
        .finish(function() {
          expect(address.parse).to.have.been.calledOnceWith('alice@example.com');
          expect(channelFactory.create).to.have.been.calledOnceWith('mailto');
          expect(store.set).to.have.been.calledOnce;
          var state = store.set.getCall(0).args[2];
          expect(channel.transmit).to.have.been.calledOnceWith('alice@example.com', undefined, state.secret);
          expect(state).to.deep.equal({
            location: 'https://www.example.com/login/oob',
            channel: 'mailto',
            address: 'alice@example.com',
            secret: state.secret
          });
          expect(state.secret).to.have.length(6);
          
          expect(this).to.have.status(200);
          expect(this).to.render('login/oob');
          expect(this).to.include.locals([ 'channel', 'address', 'csrfToken' ]);
          expect(this.locals.channel).to.equal('mailto');
          expect(this.locals.address).to.equal('alice@example.com');
          expect(this.locals.transport).to.be.undefined;
          done();
        })
        .listen();
    }); // should challenge email address
    
    /*
    
    it('should challenge application to return secret displayed as text', function(done) {
      var gateway = new Object();
      gateway.challenge = sinon.stub().yieldsAsync(null, { transactionID: '00000000-0000-0000-0000-000000000000', secret: '123456' });
      var address = new Object();
      address.parse = sinon.stub().returns({ scheme: 'acct', address: 'alice@example.com' });
      var store = new Object();
      store.set = sinon.stub().yieldsAsync(null);
      var handler = factory(gateway, address, store);
    
      chai.express.use(handler)
        .request(function(req, res) {
          req.headers = {
            'host': 'www.example.com'
          }
          req.body = {
            address: 'alice'
          };
          req.session = {};
          req.connection = { encrypted: true };
        })
        .finish(function() {
          expect(address.parse).to.have.been.calledOnceWith('alice', undefined);
          expect(gateway.challenge).to.have.been.calledOnceWith('acct', 'alice@example.com', undefined);
          expect(store.set).to.have.been.calledOnce;
          expect(store.set.getCall(0).args[2]).to.deep.equal({
            location: 'https://www.example.com/login/oob/confirm',
            channel: 'acct',
            address: 'alice@example.com',
            transactionID: '00000000-0000-0000-0000-000000000000',
            secret: '123456'
          });
          
          expect(this).to.have.status(302);
          expect(this._headers['Location']).to.startWith('/login/oob/confirm?');
          done();
        })
        .listen();
    }); // should challenge application to return secret displayed as text
    
    it('should challenge application to return secret displayed as text and QR code', function(done) {
      var gateway = new Object();
      gateway.challenge = sinon.stub().yieldsAsync(null, { transactionID: '00000000-0000-0000-0000-000000000000', secret: '123456', qrCode: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAgAAZABkAAD' });
      var address = new Object();
      address.parse = sinon.stub().returns({ scheme: 'acct', address: 'alice@example.com' });
      var store = new Object();
      store.set = sinon.stub().yieldsAsync(null);
      var handler = factory(gateway, address, store);
    
      chai.express.use(handler)
        .request(function(req, res) {
          req.headers = {
            'host': 'www.example.com'
          }
          req.body = {
            address: 'alice'
          };
          req.session = {};
          req.connection = { encrypted: true };
        })
        .finish(function() {
          expect(address.parse).to.have.been.calledOnceWith('alice', undefined);
          expect(gateway.challenge).to.have.been.calledOnceWith('acct', 'alice@example.com', undefined);
          expect(store.set).to.have.been.calledOnce;
          expect(store.set.getCall(0).args[2]).to.deep.equal({
            location: 'https://www.example.com/login/oob/confirm',
            channel: 'acct',
            address: 'alice@example.com',
            transactionID: '00000000-0000-0000-0000-000000000000',
            secret: '123456',
            qrCode: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAgAAZABkAAD'
          });
          
          expect(this).to.have.status(302);
          expect(this._headers['Location']).to.startWith('/login/oob/confirm?');
          done();
        })
        .listen();
    }); // should challenge application to return secret displayed as text and QR code
    
    it('should challenge application to approve transaction', function(done) {
      var gateway = new Object();
      gateway.challenge = sinon.stub().yieldsAsync(null, { transactionID: '00000000-0000-0000-0000-000000000000' });
      var address = new Object();
      address.parse = sinon.stub().returns({ scheme: 'acct', address: 'alice@example.com' });
      var store = new Object();
      store.set = sinon.stub().yieldsAsync(null);
      var handler = factory(gateway, address, store);
    
      chai.express.use(handler)
        .request(function(req, res) {
          req.headers = {
            'host': 'www.example.com'
          }
          req.body = {
            address: 'alice'
          };
          req.session = {};
          req.connection = { encrypted: true };
        })
        .finish(function() {
          expect(address.parse).to.have.been.calledOnceWith('alice', undefined);
          expect(gateway.challenge).to.have.been.calledOnceWith('acct', 'alice@example.com', undefined);
          expect(store.set).to.have.been.calledOnce;
          expect(store.set.getCall(0).args[2]).to.deep.equal({
            location: 'https://www.example.com/login/oob/confirm',
            channel: 'acct',
            address: 'alice@example.com',
            transactionID: '00000000-0000-0000-0000-000000000000'
          });
          
          expect(this).to.have.status(302);
          expect(this._headers['Location']).to.startWith('/login/oob/confirm?');
          done();
        })
        .listen();
    }); // should challenge application to approve transaction
    
    it('should error when gateway encounters an error', function(done) {
      var gateway = new Object();
      gateway.challenge = sinon.stub().yieldsAsync(new Error('something went wrong'));
      var address = new Object();
      address.parse = sinon.stub().returns({ scheme: 'tel', address: '+1-201-555-0123' });
      var store = new Object();
      store.set = sinon.stub().yieldsAsync(null);
      var handler = factory(gateway, address, store);
    
      chai.express.use(handler)
        .request(function(req, res) {
          req.headers = {
            'host': 'www.example.com'
          }
          req.body = {
            address: '201-555-0123'
          };
          req.session = {};
          req.connection = { encrypted: true };
        })
        .next(function(err) {
          expect(address.parse).to.have.been.calledOnceWith('201-555-0123', undefined);
          expect(gateway.challenge).to.have.been.calledOnceWith('tel', '+1-201-555-0123', undefined);
          expect(store.set).to.not.have.been.called;
          
          expect(err).to.be.an.instanceOf(Error);
          expect(err.message).to.equal('something went wrong');
          done();
        })
        .listen();
    }); // should error when gateway encounters an error
    
    it('should error when missing address parameter', function(done) {
      var gateway = new Object();
      gateway.challenge = sinon.stub().yieldsAsync(null, { transport: 'sms', secret: '123456' });
      var address = new Object();
      address.parse = sinon.stub().returns({ scheme: 'tel', address: '+1-201-555-0123' });
      var store = new Object();
      store.set = sinon.stub().yieldsAsync(null);
      var handler = factory(gateway, address, store);
    
      chai.express.use(handler)
        .request(function(req, res) {
          req.headers = {
            'host': 'www.example.com'
          }
          req.body = {
          };
          req.session = {};
          req.connection = { encrypted: true };
        })
        .next(function(err) {
          expect(address.parse).to.not.have.been.called;
          expect(gateway.challenge).to.not.have.been.called;
          expect(store.set).to.not.have.been.called;
          
          expect(err).to.be.an.instanceOf(Error);
          expect(err.status).to.equal(400);
          expect(err.message).to.equal('Missing required parameter: address');
          done();
        })
        .listen();
    }); // should error when missing address parameter
    */
    
  }); // handler
  
});
