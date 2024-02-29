var Gateway = require('../lib/gateway');


exports = module.exports = function(randomSecret) {
  return new Gateway(randomSecret);
};

exports['@implements'] = 'module:@authnomicon/oob.Gateway';
exports['@singleton'] = true;
exports['@require'] = [
  'module:@authnomicon/oob.randomSecretFn'
];
