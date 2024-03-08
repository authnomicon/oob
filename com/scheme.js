// Module dependencies.
var Strategy = require('passport-oob');

var defer = typeof setImmediate === 'function'
  ? setImmediate
  : function(fn){ process.nextTick(fn.bind.apply(fn, arguments)); };

exports = module.exports = function(addressStoreFactory, Address) {
  
  return new Strategy({
    verifyURL: '/login/oob/verify'
  }, function verify(address, transport, channel, cb) {
    
    console.log('verify oob...');
    console.log(address);
    console.log(transport);
    console.log(channel);
    
    addressStoreFactory.create(channel)
      .then(function(store) {
      }, function(err) {
        defer(cb, err);
      });
    
    
    /*
    addressStore.find(address, channel, function(err, user) {
      console.log('FOUND USER');
      console.log(err);
      console.log(user);
      
      if (!user) {
        
      } else {
        return cb(null, user);
      }
      
    });
    */
  });
};

// Module annotations.
exports['@require'] = [
  'module:@authnomicon/credentials.OOBAddressStoreFactory'
];
