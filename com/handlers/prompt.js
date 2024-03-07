// Module dependencies.
var rand = require('rand-token')
  , merge = require('utils-merge')
  , path = require('path')
  , ejs = require('ejs');

var NUMERIC = '0123456789';

var defer = typeof setImmediate === 'function'
  ? setImmediate
  : function(fn){ process.nextTick(fn.bind.apply(fn, arguments)); };

/**
 * Create out-of-band challenge handler.
 *
 * Returns an HTTP handler that challenges the user to autenticate with an
 * out-of-band device.  The challenge is rendered via HTML and the response
 * will be submitted to the `verify` handler via an HTML form.
 *
 * Depending on the type of out-of-band authenticator, one of the following
 * will take place:
 *
 *   1. A code will be transmitted to the out-of-band authenticator.  The user
 *      will be prompted to enter this code into their web browser.
 *   2. A code will be displayed to the user in their web browser.  The user
 *      will be prompted to enter this code into their out-of-band device.
 *   3. The user will be prompted to approve their login attempt on their out-
 *      of-band device.  Optionally, a code may be displayed to the user on both
 *      their web browser and out-of-band device, which the user can compare
 *      before approval.
 *
 * @param {@authnomicon/oob.ChannelFactory} channelFactory - Factory which
 *          creates channels for challenging out-of-band authenticators.
 * @param {@authnomicon/oob/address} address - Module providing utilities for
 *          address parsing.
 * @param {flowstate.Store} store - Per-request state store.
 * @returns {express.RequestHandler[]}
 */
exports = module.exports = function(channelFactory, Address, store) {
  
  function initiate(req, res, next) {
    var address = req.query.address
      , transport = req.query.transport
      , addr;
    
    if (address) { addr = Address.parse(address); }
    channelFactory.create(addr && addr.scheme)
      .then(function(channel) {
        if (channel.transmit) {
          var secret = rand.generate(6, NUMERIC);
          channel.transmit(addr.address, transport, secret, function(err, ctx) {
            if (err) { return defer(next, err); }
            
            ctx = ctx || {};
            req.state.channel = addr.scheme;
            req.state.address = addr.address;
            if (ctx.transport) { req.state.transport = ctx.transport; }
            // Store secret in state, to bind primary and secondary channels.
            req.state.secret = secret;
            
            res.locals.channel = addr.scheme;
            res.locals.address = addr.address;
            if (ctx.transport) { res.locals.transport = ctx.transport; }
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
          });
        } else {
          function presenter(secret) {
            return function(err, ctx) {
              if (err) { return defer(next, err); }
            
              // TODO: err if not ctx.transactionID
            
              // Store the transactionID in state, which is bound to the session.  This
              // binds the primary and secondary channels.
              req.state.transactionID = ctx.transactionID;
            
              merge(res.locals, ctx);
              if (secret) { res.locals.secret = secret; }
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
            };
          }
          
          var arity = channel.present.length;
          switch (arity) {
          case 2:
            var secret = rand.generate(6, NUMERIC);
            return channel.present(secret, presenter(secret));
          default:
            return channel.present(presenter());
          }
        }
      }, function(err) {
        defer(next, err);
      });
  }
  
  
  return [
    require('csurf')(),
    require('flowstate')({ store: store }),
    initiate
  ];
};

// Module annotations.
exports['@require'] = [
  'module:@authnomicon/oob.ChannelFactory',
  'module:@authnomicon/oob/address',
  'module:flowstate.Store'
];
