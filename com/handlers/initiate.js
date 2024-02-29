exports = module.exports = function(scheme, authenticator, gateway, Address, store) {
  
  function initiate(req, res, next) {
    console.log('initiate oob auth...');
    
    // TODO: error if no address
    
    var address = req.body.address
      , transport = req.body.transport;
    
    var addr = Address.parse(address);
    
    console.log(addr);
    
    
    try {
      gateway.challenge(addr.address, transport, addr.scheme, function(err, ctx) {
        console.log('gateway challenged!!');
        console.log(err);
        console.log(ctx);
        
        //return cb(err, ctx);
      });
    } catch (ex) {
      console.log("EX!")
      console.log(ex);
      return next(ex);
    }
    
    
    
  }
  
  
  
  return [
    require('body-parser').urlencoded({ extended: false }),
    require('csurf')({ value: function(req){ return req.body && req.body.csrf_token; } }),
    require('flowstate')({ store: store }),
    initiate
    //authenticator.authenticate(scheme)
  ];
};

exports['@require'] = [
  '../scheme',
  'module:passport.Authenticator',
  'module:@authnomicon/oob.Gateway',
  '../address',
  'module:flowstate.Store'
];
