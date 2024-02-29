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
  }, function transmit(address, transport, cb) {
    console.log('trasmit oob...');
    console.log(address);
    
    var parsed = Address.parse(address);
    console.log('parsed it!');
    console.log(parsed);
    
    
    //return;
    
    try {
      oobGateway.transmit(parsed.address, transport, parsed.scheme, function(err, ctx) {
        return cb(err, ctx);
      });
    } catch (ex) {
      console.log("EX!")
      console.log(ex);
      return cb(ex);
    }
  });
};

// Module annotations.
exports['@require'] = [
  'module:@authnomicon/oob.Gateway',
  './address'
  //'module:@authnomicon/core.Directory'
];
