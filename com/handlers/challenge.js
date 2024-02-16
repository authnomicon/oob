// Module dependencies.
var path = require('path')
  , ejs = require('ejs');

exports = module.exports = function(store) {
  
  function challenge(req, res, next) {
    res.locals.csrfToken = req.csrfToken();
    
    res.render('login/oob/challenge', function(err, str) {
      if (err && err.view) {
        var view = path.resolve(__dirname, '../views/challenge.ejs');
        ejs.renderFile(view, res.locals, function(err, str) {
          if (err) { return next(err); }
          res.send(str);
        });
        return;
      } else if (err) {
        return next(err);
      }
      res.send(str);
    });
  }
  
  
  return [
    require('csurf')(),
    require('flowstate')({ store: store }),
    challenge
  ];
};

exports['@require'] = [
  'module:flowstate.Store'
];
