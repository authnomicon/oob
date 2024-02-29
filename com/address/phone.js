var phoneUtil = require('google-libphonenumber').PhoneNumberUtil.getInstance();
var PNF = require('google-libphonenumber').PhoneNumberFormat;

// https://www.rfc-editor.org/rfc/rfc3966.html


function PhoneNumberClassifier() {
}

PhoneNumberClassifier.prototype.parse = function(address) {
  console.log('phone classify: ' + address);
  
  var number = phoneUtil.parseAndKeepRawInput(address, 'US');
  console.log(number)
  return { scheme: 'tel', address: phoneUtil.format(number, PNF.E164) }
}


exports = module.exports = function() {
  return new PhoneNumberClassifier();
};

// Module annotations.
exports['@implements'] = 'module:@authnomicon/oob.AddressParser';
exports['@scheme'] = 'tel';
