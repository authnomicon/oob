var rand = require('rand-token');

exports = module.exports = function() {
  
  return function(size, chars) {
    return rand.generate(size, chars);
  };
};

// Module annotations.
exports['@singleton'] = true;
exports['@implements'] = 'module:@authnomicon/oob.randomSecretFn';
