var Address = require('address-rfc2821').Address;

function EmailAddressParser() {
}

EmailAddressParser.prototype.parse = function(address) {
  var parsed = new Address(address);
  return { type: 'email', address: parsed.address() }
}


exports = module.exports = function(redirectHandler) {
  return new EmailAddressParser();
};

// Module annotations.
exports['@implements'] = 'module:@authnomicon/oob.AddressParser';
exports['@type'] = 'email';
