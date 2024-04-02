var Address = require('address-rfc2821').Address;

// https://www.rfc-editor.org/rfc/rfc6068.html

exports = module.exports = function() {
  
  return function(address) {
    var parsed = new Address(address);
    return { scheme: 'mailto', address: parsed.address() };
  };
};

// Module annotations.
exports['@implements'] = 'module:@authnomicon/oob.AddressParser';
exports['@scheme'] = 'mailto';
