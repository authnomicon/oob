/* global describe, it, expect */

var expect = require('chai').expect;
var chai = require('chai');
var $require = require('proxyquire');
var sinon = require('sinon');
var factory = require('../com/prompt');


describe('prompt', function() {
  
  it('should be annotated', function() {
    expect(factory['@implements']).to.deep.equal('http://i.authnomicon.org/prompts/http/Prompt');
    expect(factory['@name']).to.equal('oob');
  });
  
  it('should create handler', function() {
    var handler = factory();
    expect(handler).to.be.a('function');
  });
  
  describe('handler', function() {
  
    it('should redirect', function(done) {
      var handler = factory();
    
      chai.express.use(handler)
        .finish(function() {
          expect(this.statusCode).to.equal(302);
          expect(this.getHeader('Location')).to.equal('/login/oob');
          done();
        })
        .listen();
    }); // should redirect
    
    it('should redirect with address', function(done) {
      var handler = factory();
    
      chai.express.use(handler)
        .request(function(req, res) {
          res.locals = { address: 'janedoe@example.com' };
        })
        .finish(function() {
          expect(this.statusCode).to.equal(302);
          expect(this.getHeader('Location')).to.equal('/login/oob?address=janedoe%40example.com');
          done();
        })
        .listen();
    }); // should redirect with address
  
  }); // handler
  
});
