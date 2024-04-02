exports = module.exports = function() {
  
  return function(oob) {
    return {
      phoneNumbers: [ { value: oob.address } ]
    };
  };
};

// Module annotations.
exports['@implements'] = 'module:@authnomicon/oob.ProfileBuilder';
exports['@scheme'] = 'tel';
