/* global describe, it, expect */

var $require = require('proxyquire');
var expect = require('chai').expect;
var sinon = require('sinon');
var factory = require('../com/scheme');
var Strategy = require('passport-oob');


describe('scheme', function() {
  
  it('should verify address', function(done) {
    var StrategySpy = sinon.spy(Strategy);
    var factory = $require('../com/scheme',
      { 'passport-oob': StrategySpy });
    
    var scheme = factory();
    expect(StrategySpy).to.have.been.calledOnce;
    expect(scheme).to.be.an.instanceOf(Strategy);
    
    var verify = StrategySpy.args[0][0];
    verify('+1-201-555-0123', 'sms', 'tel', function(err, user, info) {
      if (err) { return done(err); }
      
      expect(user).to.deep.equal({
        channel: 'tel',
        address: '+1-201-555-0123'
      });
      expect(info).to.deep.equal({
        transport: 'sms'
      });
      done();
    });
  }); // should verify address
  
});
