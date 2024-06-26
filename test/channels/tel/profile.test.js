/* global describe, it, expect */

var expect = require('chai').expect;
var chai = require('chai');
var sinon = require('sinon');
var factory = require('../../../com/channels/tel/profile');


describe('channels/tel/profile', function() {
  
  it('should be annotated', function() {
    expect(factory['@implements']).to.deep.equal('module:@authnomicon/oob.ProfileBuilder');
    expect(factory['@channel']).to.equal('tel');
  });
  
  it('should build profile', function() {
    var build = factory();
    
    var profile = build({ address: '+1-201-555-0123' });
    expect(profile).to.deep.equal({
      phoneNumbers: [ { value: '+1-201-555-0123' } ]
    });
  });
  
});
