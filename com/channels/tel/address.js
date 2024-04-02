var phoneUtil = require('google-libphonenumber').PhoneNumberUtil.getInstance();
var PNF = require('google-libphonenumber').PhoneNumberFormat;

// https://www.rfc-editor.org/rfc/rfc3966.html


exports = module.exports = function() {
  
  return function(address) {
    var number = phoneUtil.parseAndKeepRawInput(address, 'US');
    return { scheme: 'tel', address: phoneUtil.format(number, PNF.E164) };
  };
};

// Module annotations.
exports['@implements'] = 'module:@authnomicon/oob.AddressParser';
exports['@scheme'] = 'tel';
