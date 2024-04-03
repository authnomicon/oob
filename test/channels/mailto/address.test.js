/* global describe, it, expect */

var expect = require('chai').expect;
var chai = require('chai');
var sinon = require('sinon');
var factory = require('../../../com/channels/mailto/address');


describe('channels/mailto/address', function() {
  
  it('should be annotated', function() {
    expect(factory['@implements']).to.deep.equal('module:@authnomicon/oob.AddressParser');
    expect(factory['@channel']).to.equal('mailto');
  });
  
  it('should parse email address', function() {
    var parse = factory();
    
    var addr = parse('alice@example.com');
    expect(addr).to.deep.equal({
      channel: 'mailto',
      address: 'alice@example.com'
    });
  });
  
  it('should throw when parsing phone number', function() {
    var parse = factory();
    
    expect(function() {
      parse('+1-201-555-0123');
    }).to.throw(TypeError);
  });
  
});
