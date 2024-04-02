/* global describe, it, expect */

var expect = require('chai').expect;
var chai = require('chai');
var sinon = require('sinon');
var factory = require('../../../com/channels/mailto/profile');


describe('channels/mailto/profile', function() {
  
  it('should build profile', function() {
    var build = factory();
    
    var profile = build({ address: 'alice@example.com' });
    expect(profile).to.deep.equal({
      emails: [ { value: 'alice@example.com' } ]
    });
  });
  
});
