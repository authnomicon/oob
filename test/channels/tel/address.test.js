/* global describe, it, expect */

var expect = require('chai').expect;
var chai = require('chai');
var sinon = require('sinon');
var factory = require('../../../com/channels/tel/address');


describe('channels/tel/address', function() {
  
  it('should be annotated', function() {
    expect(factory['@implements']).to.deep.equal('module:@authnomicon/oob.AddressParser');
    expect(factory['@channel']).to.equal('tel');
  });
  
  it('should parse phone number', function() {
    var parse = factory();
    
    var addr = parse('+1-201-555-0123');
    expect(addr).to.deep.equal({
      channel: 'tel',
      address: '+12015550123'
    });
  });
  
  it('should throw when parsing email address', function() {
    var parse = factory();
    
    expect(function() {
      parse('alice@example.com');
    }).to.throw(Error, 'The string supplied did not seem to be a phone number');
  });
  
});
