/* global describe, it, expect */

var expect = require('chai').expect;
var factory = require('../com/service');


describe('service', function() {
  
  it('should be annotated', function() {
    expect(factory['@implements']).to.deep.equal('http://i.bixbyjs.org/http/Service');
    expect(factory['@path']).to.equal('/login/oob');
  });
  
  it('should create service', function() {
    function promptHandler() {};
    function initiateHandler() {};
    function challengeHandler() {};
    function verifyHandler() {};
  
    var service = factory(promptHandler, initiateHandler, challengeHandler, verifyHandler);
    
    expect(service).to.be.a('function');
    expect(service.length).to.equal(3);
  });
  
});
