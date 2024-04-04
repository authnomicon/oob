var defer = typeof setImmediate === 'function'
  ? setImmediate
  : function(fn){ process.nextTick(fn.bind.apply(fn, arguments)); };

exports = module.exports = function(storeFactory, builderFactory, directory, scheme, authenticator, store) {
  
  function login(req, res, next) {
    storeFactory.create(req.oobUser.channel)
      .then(function(store) {
        store.find(req.oobUser.address, function(err, user) {
          if (err) { return next(err); }
          
          if (!user) {
            // JIT the user
            builderFactory.create(req.oobUser.channel)
              .then(function(build) {
                var profile = build(req.oobUser);
                directory.create(profile, function(err, user) {
                  if (err) { return next(err); }
              
                  store.add(req.oobUser.address, user, function(err) {
                    if (err) { return next(err); }
                
                    // TODO: add transport as context
                    req.login(user, function(err) {
                      if (err) { return next(err); }
                      return next();
                    });
                  });
                });
              }, function(err) {
                defer(next, err);
              });
          } else {
            directory.read(user.id, function(err, user) {
              if (err) { return next(err); }
              // TODO: Handle undefined user
              
              // TODO: add transport as context
              req.login(user, function(err) {
                if (err) { return next(err); }
                return next();
              });
            });
          }
        });
      }, function(err) {
        defer(next, err);
      });
  }
  
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
    // TODO: flag state as required
    require('flowstate')({ store: store }),
    // TODO: add a "secondary channel" authentication scheme here
    authenticator.authenticate(scheme, { assignProperty: 'oobUser' }),
    login,
    resume,
    redirect
  ];
};

exports['@require'] = [
  'module:@authnomicon/credentials.OOBAddressStoreFactory',
  'module:@authnomicon/oob.ProfileBuilderFactory',
  'module:@authnomicon/core.Directory',
  '../scheme',
  'module:passport.Authenticator',
  'module:flowstate.Store'
];
