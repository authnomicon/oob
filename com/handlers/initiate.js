exports = module.exports = function(scheme, authenticator, store) {
  
  return [
    require('body-parser').urlencoded({ extended: false }),
    require('csurf')({ value: function(req){ return req.body && req.body.csrf_token; } }),
    require('flowstate')({ store: store }),
    authenticator.authenticate(scheme)
  ];
};

exports['@require'] = [
  '../scheme',
  'module:passport.Authenticator',
  'module:flowstate.Store'
];
