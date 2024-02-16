exports = module.exports = function(store) {
  
  function verify(req, res, next) {
    console.log('verify code....');
    console.log(req.body);
    
    //res.redirect('/login/oob/verify');
  }
  
  
  return [
    require('body-parser').urlencoded({ extended: false }),
    require('csurf')({ value: function(req){ return req.body && req.body.csrf_token; } }),
    require('flowstate')({ store: store }),
    verify
  ];
};

exports['@require'] = [
  'module:flowstate.Store'
];
