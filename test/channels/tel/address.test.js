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
  
  it('should parse address', function() {
    var parse = factory();
    
    var addr = parse('+1-201-555-0123');
    expect(addr).to.deep.equal({
      scheme: 'tel',
      address: '+12015550123'
    });
  });
  
  // TODO: non-phone test case
  
});
