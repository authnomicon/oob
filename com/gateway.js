var Gateway = require('../lib/gateway');


exports = module.exports = function() {
  return new Gateway();
};

exports['@implements'] = 'module:@authnomicon/oob.Gateway';
exports['@singleton'] = true;
exports['@require'] = [
];
