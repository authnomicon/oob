// Module dependencies.
var rand = require('rand-token')
  , httpErrors = require('http-errors');
var path = require('path')
  , ejs = require('ejs');

var NUMERIC = '0123456789';

var defer = typeof setImmediate === 'function'
  ? setImmediate
  : function(fn){ process.nextTick(fn.bind.apply(fn, arguments)); };

/**
 * Create out-of-band initiation handler.
 *
 * Returns an HTTP handler that initiates out-of-band authentication via a
 * device associated with a given address.  The user will be prompted to perform
 * one of the following actions:
 *
 *   1. Input a code received by the out-of-band device into the web browser.
 *   2. Transfer a code displayed in the web browser to the out-of-band device.
 *   3. Approve their intent to authenticate in the out-of-band device,
 *      optionally after comparing a code displayed by both the web browser and
 *      the out-of-band device.
 *
 * @param {@authnomicon/oob.Gateway} gateway - Gateway for challenging OOB
 *          devices.
 * @param {@authnomicon/oob/address} address - Module providing utilities for
 *          address parsing.
 * @param {flowstate.Store} store - Per-request state store.
 * @returns {express.RequestHandler[]}
 */
exports = module.exports = function(channelFactory, Address, store) {
  
  function validate(req, res, next) {
    if (req.body.code) { console.log('VERIFY CODE'); return next('route'); }
    
    
    //if (!req.body.address) { return next(new httpErrors.BadRequest('Missing required parameter: address')); }
    next();
  }
  
  function initiate(req, res, next) {
    var address = req.body.address || req.query.address
      , transport = req.body.transport || req.query.transport;
    
    var addr = Address.parse(address);
    channelFactory.create(addr.scheme)
      .then(function(channel) {
        if (channel.transmit) {
          var secret = rand.generate(6, NUMERIC);
          channel.transmit(addr.address, transport, secret, function(err, ctx) {
            if (err) { return defer(next, err); }
            
            req.state.secret = secret;
            
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
            
            //ctx = ctx || {};
            //ctx.channel = addr.scheme;
            //ctx.address = addr.address;
            //ctx.secret = secret;
            //req.pushState(ctx, '/login/oob/verify');
            //res.redirect('/login/oob/verify');
          });
        }
      }, function(err) {
        defer(next, err);
      });
    
    
    /*
    var addr = Address.parse(address, transport);
    gateway.challenge(addr.scheme, addr.address, transport, function(err, ctx) {
      if (err) { return next(err); }
      
      ctx.channel = addr.scheme;
      ctx.address = addr.address;
      
      if (!ctx.transactionID) {
        req.pushState(ctx, '/login/oob/verify');
        res.redirect('/login/oob/verify');
      } else {
        req.pushState(ctx, '/login/oob/confirm');
        res.redirect('/login/oob/confirm');
      }
    });
    */
  }
  
  
  return [
    require('body-parser').urlencoded({ extended: false }),
    require('csurf')(),
    require('flowstate')({ store: store }),
    validate,
    initiate
  ];
};

// Module annotations.
exports['@require'] = [
  'module:@authnomicon/oob.ChannelFactory',
  'module:@authnomicon/oob/address',
  'module:flowstate.Store'
];
