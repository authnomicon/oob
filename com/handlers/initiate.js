exports = module.exports = function(gateway, Address, store) {
  
  function initiate(req, res, next) {
    // TODO: error if no address
    
    var address = req.body.address
      , transport = req.body.transport;
    
    var addr = Address.parse(address, transport);
    
    gateway.challenge(addr.scheme, addr.address, transport, function(err, ctx) {
      if (err) { return next(err); }
      
      var state ={};
      state.channel = addr.scheme;
      state.address = addr.address;
      state.transport = ctx.transport;
      state.secret = ctx.secret;
      req.pushState(state, '/login/oob/verify');
      res.redirect('/login/oob/verify');
    });
    
    
    
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
  'module:@authnomicon/oob/address',
  'module:flowstate.Store'
];
