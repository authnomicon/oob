exports = module.exports = function(scheme, authenticator, store) {
  
  function resume(req, res, next) {
    res.resumeState(next);
  }
  
  function redirect(req, res, next) {
    // TODO: Add an optional service that will be injected here which determines
    // the default application, and how to redirect to it (OpenID IdP init, etc)
    
    res.redirect('/');
  }
  
  
  return [
    require('body-parser').urlencoded({ extended: false }),
    require('csurf')({ value: function(req){ return req.body && req.body.csrf_token; } }),
    require('flowstate')({ store: store }),
    authenticator.authenticate(scheme),
    resume,
    redirect
  ];
};

exports['@require'] = [
  '../scheme',
  'module:passport.Authenticator',
  'module:flowstate.Store'
];
