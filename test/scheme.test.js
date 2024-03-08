/* global describe, it, expect */

var $require = require('proxyquire');
var expect = require('chai').expect;
var sinon = require('sinon');
var factory = require('../com/scheme');
var Strategy = require('passport-oob');


describe('scheme', function() {
  
  it('should verify address', function(done) {
    var passwords = new Object();
    passwords.verify = sinon.stub().yieldsAsync(null, true);
    //var users = new Object();
    //users.find = sinon.stub().yieldsAsync(null, { id: '248289761001', displayName: 'Jane Doe' });
    
    var StrategySpy = sinon.spy(Strategy);
    var factory = $require('../com/scheme',
      { 'passport-oob': StrategySpy });
    
    var scheme = factory(passwords);
    expect(StrategySpy).to.have.been.calledOnce;
    expect(scheme).to.be.an.instanceOf(Strategy);
    
    done();
    
  });
  
});
