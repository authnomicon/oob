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
  
  it('should parse address', function() {
    var parse = factory();
    
    var addr = parse('alice@example.com');
    expect(addr).to.deep.equal({
      scheme: 'mailto',
      address: 'alice@example.com'
    });
  });
  
});
