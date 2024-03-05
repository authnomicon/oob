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
    
    it('should challenge address', function(done) {
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
          expect(gateway.challenge).to.have.been.calledOnceWith('+1-201-555-0123', undefined, 'tel');
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
    }); // should challenge address
    
    it('should challenge address via transport', function(done) {
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
          expect(gateway.challenge).to.have.been.calledOnceWith('+1-201-555-0123', 'call', 'tel');
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
    }); // should challenge address via transport
    
  });
  
});
