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
    var handler = factory(undefined, undefined, undefined, scheme, authenticator, store);
    
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
    
    it('should provision user and log in', function(done) {
      var store = new Object();
      store.find = sinon.stub().yieldsAsync(null);
      store.add = sinon.stub().yieldsAsync(null);
      var storeFactory = new Object();
      storeFactory.create = sinon.stub().resolves(store);
      var builder = sinon.stub().returns({
        phoneNumbers: [ { value: '+1-201-555-0123' } ]
      });
      var builderFactory = new Object();
      builderFactory.create = sinon.stub().resolves(builder);
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
      
      var handler = factory(storeFactory, builderFactory, directory, undefined, authenticator, noopStateStore);
      
      chai.express.use(handler)
        .request(function(req, res) {
          req.login = sinon.stub().yieldsAsync(null);
          
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
          expect(storeFactory.create).to.have.been.calledOnceWith('tel');
          expect(store.find).to.have.been.calledOnceWith('+1-201-555-0123');
          expect(builderFactory.create).to.have.been.calledOnceWith('tel');
          expect(builder).to.have.been.calledOnceWith({ channel: 'tel', address: '+1-201-555-0123' });
          expect(directory.create).to.have.been.calledOnceWith(
            {
              phoneNumbers: [ { value: '+1-201-555-0123' } ]
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
          expect(this.getHeader('Location')).to.equal('/');
          done();
        })
        .listen();
    }); // should provision user and log in
    
    it('should login previously provisioned user', function(done) {
      var store = new Object();
      store.find = sinon.stub().yieldsAsync(null, {
        id: '703887'
      });
      store.add = sinon.stub().yieldsAsync(null);
      var storeFactory = new Object();
      storeFactory.create = sinon.stub().resolves(store);
      var builder = sinon.stub().returns({
        phoneNumbers: [ { value: '+1-201-555-0123' } ]
      });
      var builderFactory = new Object();
      builderFactory.create = sinon.stub().resolves(builder);
      var directory = new Object();
      directory.create = sinon.spy();
      directory.read = sinon.stub().yieldsAsync(null, {
        id: '703887',
        displayName: 'Jane Doe'
      });
      var authenticator = new Object();
      authenticator.authenticate = function(name, options) {
        return function(req, res, next) {
          req.oobUser = { channel: 'tel', address: '+1-201-555-0123' };
          next();
        };
      };
      
      var handler = factory(storeFactory, builderFactory, directory, undefined, authenticator, noopStateStore);
      
      chai.express.use(handler)
        .request(function(req, res) {
          req.login = sinon.stub().yieldsAsync(null);
          
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
          expect(storeFactory.create).to.have.been.calledOnceWith('tel');
          expect(store.find).to.have.been.calledOnceWith('+1-201-555-0123');
          expect(directory.read).to.have.been.calledOnceWith('703887');
          expect(builderFactory.create).to.not.have.been.called;
          expect(builder).to.not.have.been.called;
          expect(directory.create).to.not.have.been.called;
          expect(store.add).to.not.have.been.called;
          expect(this.req.login).to.have.been.calledOnceWith({
            id: '703887',
            displayName: 'Jane Doe'
          });
          
          expect(this.statusCode).to.equal(302);
          expect(this.getHeader('Location')).to.equal('/');
          done();
        })
        .listen();
    }); // should provision user and log in
    
    it('should provision user, log in, and resume', function(done) {
      var store = new Object();
      store.find = sinon.stub().yieldsAsync(null);
      store.add = sinon.stub().yieldsAsync(null);
      var storeFactory = new Object();
      storeFactory.create = sinon.stub().resolves(store);
      var builder = sinon.stub().returns({
        phoneNumbers: [ { value: '+1-201-555-0123' } ]
      });
      var builderFactory = new Object();
      builderFactory.create = sinon.stub().resolves(builder);
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
      
      var handler = factory(storeFactory, builderFactory, directory, undefined, authenticator, noopStateStore);
      
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
          expect(storeFactory.create).to.have.been.calledOnceWith('tel');
          expect(store.find).to.have.been.calledOnceWith('+1-201-555-0123');
          expect(builderFactory.create).to.have.been.calledOnceWith('tel');
          expect(builder).to.have.been.calledOnceWith({ channel: 'tel', address: '+1-201-555-0123' });
          expect(directory.create).to.have.been.calledOnceWith(
            {
              phoneNumbers: [ { value: '+1-201-555-0123' } ]
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
    }); // should provision user, log in, and resume
    
    it('should next with error when address store fails to be created', function(done) {
      var store = new Object();
      store.find = sinon.stub().yieldsAsync(null);
      store.add = sinon.stub().yieldsAsync(null);
      var storeFactory = new Object();
      storeFactory.create = sinon.stub().rejects(new Error('something went wrong'));
      var builderFactory = new Object();
      builderFactory.create = sinon.spy();
      var directory = new Object();
      directory.create = sinon.spy();
      directory.read = sinon.spy();
      var authenticator = new Object();
      authenticator.authenticate = function(name, options) {
        return function(req, res, next) {
          req.oobUser = { channel: 'tel', address: '+1-201-555-0123' };
          next();
        };
      };
      
      var handler = factory(storeFactory, builderFactory, directory, undefined, authenticator, noopStateStore);
      
      chai.express.use(handler)
        .request(function(req, res) {
          req.login = sinon.stub().yieldsAsync(null);
          
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
        .next(function(err, req, res) {
          expect(err).to.be.an.instanceOf(Error);
          expect(err.message).to.equal('something went wrong');
          
          expect(store.find).to.not.have.been.called;
          expect(store.add).to.not.have.been.called;
          expect(builderFactory.create).to.not.have.been.called;
          expect(directory.create).to.not.have.been.called;
          expect(directory.read).to.not.have.been.called;
          expect(req.login).to.not.have.been.called;
          
          done();
        })
        .listen();
    }); // should next with error when address store fails to be created
    
    it('should next with error when user fails to be found based on out-of-band address', function(done) {
      var store = new Object();
      store.find = sinon.stub().yieldsAsync(new Error('something went wrong'));
      store.add = sinon.stub().yieldsAsync(null);
      var storeFactory = new Object();
      storeFactory.create = sinon.stub().resolves(store);
      var builderFactory = new Object();
      builderFactory.create = sinon.spy();
      var directory = new Object();
      directory.create = sinon.spy();
      directory.read = sinon.spy();
      var authenticator = new Object();
      authenticator.authenticate = function(name, options) {
        return function(req, res, next) {
          req.oobUser = { channel: 'tel', address: '+1-201-555-0123' };
          next();
        };
      };
      
      var handler = factory(storeFactory, builderFactory, directory, undefined, authenticator, noopStateStore);
      
      chai.express.use(handler)
        .request(function(req, res) {
          req.login = sinon.stub().yieldsAsync(null);
          
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
        .next(function(err, req, res) {
          expect(err).to.be.an.instanceOf(Error);
          expect(err.message).to.equal('something went wrong');
          
          expect(store.find).to.have.been.called;
          expect(store.add).to.not.have.been.called;
          expect(builderFactory.create).to.not.have.been.called;
          expect(directory.create).to.not.have.been.called;
          expect(directory.read).to.not.have.been.called;
          expect(req.login).to.not.have.been.called;
          
          done();
        })
        .listen();
    }); // should next with error when user fails to be found based on out-of-band address
    
    it('should next with error when profile builder fails to be created', function(done) {
      var store = new Object();
      store.find = sinon.stub().yieldsAsync(null);
      store.add = sinon.stub().yieldsAsync(null);
      var storeFactory = new Object();
      storeFactory.create = sinon.stub().resolves(store);
      var builderFactory = new Object();
      builderFactory.create = sinon.stub().rejects(new Error('something went wrong'));
      var directory = new Object();
      directory.create = sinon.spy();
      directory.read = sinon.spy();
      var authenticator = new Object();
      authenticator.authenticate = function(name, options) {
        return function(req, res, next) {
          req.oobUser = { channel: 'tel', address: '+1-201-555-0123' };
          next();
        };
      };
      
      var handler = factory(storeFactory, builderFactory, directory, undefined, authenticator, noopStateStore);
      
      chai.express.use(handler)
        .request(function(req, res) {
          req.login = sinon.stub().yieldsAsync(null);
          
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
        .next(function(err, req, res) {
          expect(err).to.be.an.instanceOf(Error);
          expect(err.message).to.equal('something went wrong');
          
          expect(store.find).to.have.been.called;
          expect(store.add).to.not.have.been.called;
          expect(builderFactory.create).to.have.been.called;
          expect(directory.create).to.not.have.been.called;
          expect(directory.read).to.not.have.been.called;
          expect(req.login).to.not.have.been.called;
          
          done();
        })
        .listen();
    }); // should next with error when profile builder fails to be created
    
  }); // handler
  
});
