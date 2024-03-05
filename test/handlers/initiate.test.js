/* global describe, it, expect */

var expect = require('chai').expect;
var chai = require('chai');
var $require = require('proxyquire');
var sinon = require('sinon');
var factory = require('../../com/handlers/initiate');


describe('handlers/initiate', function() {
  
  it('should create handler', function() {
    var bodyParserSpy = sinon.spy();
    var csurfSpy = sinon.spy();
    var flowstateSpy = sinon.spy();
    var factory = $require('../../com/handlers/initiate', {
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
            address: '201-555-0123'
          };
          req.session = {};
          req.connection = { encrypted: true };
        })
        .finish(function() {
          expect(address.parse).to.have.been.calledOnceWith('201-555-0123', undefined);
          expect(gateway.challenge).to.have.been.calledOnceWith('tel', '+1-201-555-0123', undefined);
          expect(store.set).to.have.been.calledOnce;
          expect(store.set.getCall(0).args[2]).to.deep.equal({
            location: 'https://www.example.com/login/oob/verify',
            channel: 'tel',
            address: '+1-201-555-0123',
            transport: 'sms',
            secret: '123456'
          });
          
          expect(this).to.have.status(302);
          expect(this._headers['Location']).to.startWith('/login/oob/verify?');
          done();
        })
        .listen();
    }); // should challenge telephone number via sms by default
    
    it('should challenge telephone number via call by request', function(done) {
      var gateway = new Object();
      gateway.challenge = sinon.stub().yieldsAsync(null, { transport: 'call', secret: '123456' });
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
            address: '201-555-0123',
            transport: 'call'
          };
          req.session = {};
          req.connection = { encrypted: true };
        })
        .finish(function() {
          expect(address.parse).to.have.been.calledOnceWith('201-555-0123', 'call');
          expect(gateway.challenge).to.have.been.calledOnceWith('tel', '+1-201-555-0123', 'call');
          expect(store.set).to.have.been.calledOnce;
          expect(store.set.getCall(0).args[2]).to.deep.equal({
            location: 'https://www.example.com/login/oob/verify',
            channel: 'tel',
            address: '+1-201-555-0123',
            transport: 'call',
            secret: '123456'
          });
          
          expect(this).to.have.status(302);
          expect(this._headers['Location']).to.startWith('/login/oob/verify?');
          done();
        })
        .listen();
    }); // should challenge telephone number via call by request
    
    it('should challenge email address', function(done) {
      var gateway = new Object();
      gateway.challenge = sinon.stub().yieldsAsync(null, { secret: '123456' });
      var address = new Object();
      address.parse = sinon.stub().returns({ scheme: 'mailto', address: 'alice@example.com' });
      var store = new Object();
      store.set = sinon.stub().yieldsAsync(null);
      var handler = factory(gateway, address, store);
    
      chai.express.use(handler)
        .request(function(req, res) {
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
          expect(address.parse).to.have.been.calledOnceWith('alice@example.com', undefined);
          expect(gateway.challenge).to.have.been.calledOnceWith('mailto', 'alice@example.com', undefined);
          expect(store.set).to.have.been.calledOnce;
          expect(store.set.getCall(0).args[2]).to.deep.equal({
            location: 'https://www.example.com/login/oob/verify',
            channel: 'mailto',
            address: 'alice@example.com',
            secret: '123456'
          });
          
          expect(this).to.have.status(302);
          expect(this._headers['Location']).to.startWith('/login/oob/verify?');
          done();
        })
        .listen();
    }); // should challenge email address
    
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
    
  }); // handler
  
});
