var Address = require('address-rfc2821').Address;

// https://www.rfc-editor.org/rfc/rfc6068.html

function EmailAddressParser() {
}

EmailAddressParser.prototype.parse = function(address) {
  var parsed = new Address(address);
  return { scheme: 'mailto', address: parsed.address() }
}


exports = module.exports = function(redirectHandler) {
  return new EmailAddressParser();
};

// Module annotations.
exports['@implements'] = 'module:@authnomicon/oob.AddressParser';
exports['@scheme'] = 'mailto';
