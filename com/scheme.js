var Strategy = require('passport-oob');

exports = module.exports = function(oobGateway, Address) {
  
  return new Strategy({
    verifyURL: '/login/oob/verify'
  }, function verify(address, transport, ctx, code, cb) {
    
    console.log('verify oob...');
    console.log(address);
    console.log(transport);
    console.log(code);
    console.log(ctx);
  });
};

// Module annotations.
exports['@require'] = [
  'module:@authnomicon/oob.Gateway',
  './address'
  //'module:@authnomicon/core.Directory'
];
