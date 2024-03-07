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
          expect(state.secret).to.match(/^[0-9]*$/);
          
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
          expect(state.secret).to.match(/^[0-9]*$/);
          
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
          expect(state.secret).to.match(/^[0-9]*$/);
          
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
    
    it('should challenge user to enter code into out-of-band device', function(done) {
      var channel = new Object();
      channel.present = sinon.spy(function(secret, cb) {
        process.nextTick(function() {
          cb(null, { transactionID: '123e4567-e89b-12d3-a456-426614174000' });
        });
      });
      var channelFactory = new Object();
      channelFactory.create = sinon.stub().resolves(channel);
      var address = new Object();
      address.parse = sinon.stub().returns();
      var store = new Object();
      store.set = sinon.stub().yieldsAsync(null);
      var handler = factory(channelFactory, address, store);
    
      chai.express.use(handler)
        .request(function(req, res) {
          req.url = '/login/oob';
          req.headers = {
            'host': 'www.example.com'
          }
          req.session = {};
          req.connection = { encrypted: true };
        })
        .finish(function() {
          expect(address.parse).to.not.have.been.called;
          expect(channelFactory.create).to.have.been.calledOnceWith(undefined);
          expect(channel.present).to.have.been.calledOnceWith(this.locals.secret);
          expect(store.set).to.have.been.calledOnce;
          var state = store.set.getCall(0).args[2];
          expect(state).to.deep.equal({
            location: 'https://www.example.com/login/oob',
            transactionID: '123e4567-e89b-12d3-a456-426614174000'
          });
          
          expect(this).to.have.status(200);
          expect(this).to.render('login/oob');
          expect(this).to.include.locals([ 'transactionID', 'secret', 'csrfToken' ]);
          expect(this.locals.transactionID).to.equal('123e4567-e89b-12d3-a456-426614174000');
          expect(this.locals.secret).to.have.length(6);
          expect(this.locals.secret).to.match(/^[0-9]*$/);
          done();
        })
        .listen();
    }); // should challenge user to enter code into out-of-band authenticator
    
    it('should challenge user to scan QR code with out-of-band device', function(done) {
      var channel = new Object();
      channel.present = sinon.spy(function(cb) {
        process.nextTick(function() {
          cb(null, { transactionID: '123e4567-e89b-12d3-a456-426614174000', qrCode: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAgAAZABkAAD' });
        });
      });
      var channelFactory = new Object();
      channelFactory.create = sinon.stub().resolves(channel);
      var address = new Object();
      address.parse = sinon.stub().returns();
      var store = new Object();
      store.set = sinon.stub().yieldsAsync(null);
      var handler = factory(channelFactory, address, store);
    
      chai.express.use(handler)
        .request(function(req, res) {
          req.url = '/login/oob';
          req.headers = {
            'host': 'www.example.com'
          }
          req.session = {};
          req.connection = { encrypted: true };
        })
        .finish(function() {
          expect(address.parse).to.not.have.been.called;
          expect(channelFactory.create).to.have.been.calledOnceWith(undefined);
          expect(channel.present).to.have.been.calledOnce;
          expect(store.set).to.have.been.calledOnce;
          var state = store.set.getCall(0).args[2];
          expect(state).to.deep.equal({
            location: 'https://www.example.com/login/oob',
            transactionID: '123e4567-e89b-12d3-a456-426614174000'
          });
          
          expect(this).to.have.status(200);
          expect(this).to.render('login/oob');
          expect(this).to.include.locals([ 'transactionID', 'qrCode', 'csrfToken' ]);
          expect(this.locals.transactionID).to.equal('123e4567-e89b-12d3-a456-426614174000');
          expect(this.locals.qrCode).to.equal('data:image/jpeg;base64,/9j/4AAQSkZJRgABAgAAZABkAAD');
          expect(this.locals.secret).to.be.undefined;
          done();
        })
        .listen();
    }); // should challenge user to scan QR code with out-of-band device
    
    it('should error when channel transmit encounters an error', function(done) {
      var channel = new Object();
      channel.transmit = sinon.stub().yieldsAsync(new Error('something went wrong'));
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
        .next(function(err) {
          expect(address.parse).to.have.been.calledOnceWith('201-555-0123');
          expect(channelFactory.create).to.have.been.calledOnceWith('tel');
          expect(channel.transmit).to.have.been.calledOnceWith('+1-201-555-0123', undefined);
          expect(store.set).to.not.have.been.called;
          
          expect(err).to.be.an.instanceOf(Error);
          expect(err.message).to.equal('something went wrong');
          done();
        })
        .listen();
    });
    
    /*
    
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
