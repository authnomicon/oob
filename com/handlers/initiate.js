exports = module.exports = function(gateway, Address, store) {
  
  function initiate(req, res, next) {
    console.log('initiate oob auth...');
    
    // TODO: error if no address
    
    var address = req.body.address
      , transport = req.body.transport;
    
    var addr = Address.parse(address);
    
    console.log(addr);
    
    
    try {
      var self = this;
      
      gateway.challenge(addr.address, transport, addr.scheme, function(err, ctx) {
        console.log('gateway challenged!!');
        console.log(err);
        console.log(ctx);
        
        var state ={};
        state.channel = addr.scheme;
        state.address = addr.address;
        state.transport = ctx.transport;
        state.secret = ctx.secret;
        req.pushState(state, '/login/oob/verify');
        res.redirect('/login/oob/verify');
        
        //req.pushState(state, self._verifyURL, function(err, h) {
        
        
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
  ];
};

exports['@require'] = [
  'module:@authnomicon/oob.Gateway',
  '../address',
  'module:flowstate.Store'
];
