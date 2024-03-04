// Module dependencies.
var path = require('path')
  , ejs = require('ejs');
  
/**
 * Create address prompt handler.
 *
 * Returns an HTTP handler that prompts the user to enter an address, which will
 * be authenticated via an out-of-band device.  The prompt is rendered via HTML
 * and the response will be submitted to the `initiate` handler via an HTML form.
 *
 * @param {flowstate.Store} store - Per-request state store.
 * @returns {express.RequestHandler[]}
 */
exports = module.exports = function(store) {
  
  function prompt(req, res, next) {
    res.locals.csrfToken = req.csrfToken();
    
    res.render('login/oob', function(err, str) {
      if (err && err.view) {
        var view = path.resolve(__dirname, '../views/prompt.ejs');
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
    prompt
    // Should GET requests that error with a state destroy the state?  I think not
    // There needs to be an option for it (external?) that does, for eg OAuth
    //errorLogging()
  ];
};

// Module annotations.
exports['@require'] = [
  'module:flowstate.Store'
];
