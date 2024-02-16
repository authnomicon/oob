exports = module.exports = function(store) {
  
  function initiate(req, res, next) {
    console.log('transmit code....');
    console.log(req.body);
    
    res.redirect('/login/oob/verify');
  }
  
  
  return [
    require('body-parser').urlencoded({ extended: false }),
    require('csurf')({ value: function(req){ return req.body && req.body.csrf_token; } }),
    require('flowstate')({ store: store }),
    initiate
  ];
};

exports['@require'] = [
  'module:flowstate.Store'
];
