/* global describe, it, expect */

var expect = require('chai').expect;
var chai = require('chai');
var $require = require('proxyquire');
var sinon = require('sinon');
var factory = require('../../com/handlers/verify');


describe('handlers/verify', function() {
  
  it('should create handler', function() {
    var bodyParserSpy = sinon.spy();
    var csurfSpy = sinon.spy();
    var flowstateSpy = sinon.spy();
    var factory = $require('../../com/handlers/verify', {
      'body-parser': { urlencoded: bodyParserSpy },
      'csurf': csurfSpy,
      'flowstate': flowstateSpy
    });
    
    var scheme = new Object();
    var authenticator = new Object();
    authenticator.authenticate = sinon.spy();
    var store = new Object();
    var handler = factory(undefined, undefined, scheme, authenticator, store);
    
    expect(handler).to.be.an('array');
    expect(bodyParserSpy).to.be.calledOnce;
    expect(bodyParserSpy).to.be.calledBefore(csurfSpy);
    expect(bodyParserSpy).to.be.calledWith({ extended: false });
    expect(csurfSpy).to.be.calledOnce;
    expect(csurfSpy).to.be.calledBefore(flowstateSpy);
    expect(flowstateSpy).to.be.calledOnce;
    expect(flowstateSpy).to.be.calledWith({ store: store });
    expect(flowstateSpy).to.be.calledBefore(authenticator.authenticate);
    expect(authenticator.authenticate).to.be.calledOnce;
    expect(authenticator.authenticate).to.be.calledWith(scheme, { assignProperty: 'oobUser' });
  });
  
  describe('handler', function() {
    
    var noopStateStore = new Object();
    
    it('should provision user, log in, and resume state', function(done) {
      var store = new Object();
      store.find = sinon.stub().yieldsAsync(null);
      store.add = sinon.stub().yieldsAsync(null);
      var storeFactory = new Object();
      storeFactory.create = sinon.stub().resolves(store);
      var directory = new Object();
      directory.create = sinon.stub().yieldsAsync(null, {
        id: '703887',
        displayName: 'Jane Doe'
      });
      directory.read = sinon.spy();
      var authenticator = new Object();
      authenticator.authenticate = function(name, options) {
        return function(req, res, next) {
          req.oobUser = { channel: 'tel', address: '+1-201-555-0123' };
          next();
        };
      };
      
      var handler = factory(storeFactory, directory, undefined, authenticator, noopStateStore);
      
      chai.express.use(handler)
        .request(function(req, res) {
          req.login = sinon.stub().yieldsAsync(null);
          
          req.method = 'POST';
          req.body = {
            code: '123456',
            return_to: '/logged-in',
            csrf_token: '3aev7m03-1WTaAw4lJ_GWEMkjwFBu_lwNWG8'
          };
          req.session = {
            csrfSecret: 'zbVXAFVVUSXO0_ZZLBYVP9ue'
          };
          req.connection = {};
        })
        .finish(function() {
          //expect(this.req.user).to.deep.equal({
          //  id: '248289761001',
          //  displayName: 'Jane Doe'
          //});
          
          
          expect(storeFactory.create).to.have.been.calledOnceWith('tel');
          expect(store.find).to.have.been.calledOnceWith('+1-201-555-0123');
          expect(directory.create).to.have.been.calledOnceWith(
            {
              emails: [ { value: '+1-201-555-0123' } ]
            }
          );
          expect(store.add).to.have.been.calledOnceWith(
            '+1-201-555-0123',
            {
              id: '703887',
              displayName: 'Jane Doe'
            }
          );
          expect(directory.read).to.not.have.been.called;
          expect(this.req.login).to.have.been.calledOnceWith({
            id: '703887',
            displayName: 'Jane Doe'
          });
          
          expect(this.statusCode).to.equal(302);
          expect(this.getHeader('Location')).to.equal('/logged-in');
          done();
        })
        .listen();
    }); // should resume state if available
    
    it.skip('should redirect as final handler', function(done) {
      var handler = factory(undefined, mockAuthenticator, noopStateStore);
      
      chai.express.use(handler)
        .request(function(req, res) {
          req.method = 'POST';
          req.body = {
            code: '123456',
            csrf_token: '3aev7m03-1WTaAw4lJ_GWEMkjwFBu_lwNWG8'
          };
          req.session = {
            csrfSecret: 'zbVXAFVVUSXO0_ZZLBYVP9ue'
          };
          req.connection = {};
        })
        .finish(function() {
          expect(this.req.user).to.deep.equal({
            id: '248289761001',
            displayName: 'Jane Doe'
          });
          
          expect(this.statusCode).to.equal(302);
          expect(this.getHeader('Location')).to.equal('/');
          done();
        })
        .listen();
    }); // should redirect as final handler
    
  }); // handler
  
});
