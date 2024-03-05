// Module dependencies.
var httpErrors = require('http-errors');

/**
 * Create out-of-band initiation handler.
 *
 * Returns an HTTP handler that initiates out-of-band authentication via a
 * device associated with a given address.  The user will be prompted to perform
 * one of the following actions:
 *
 *   1. Input a code received by the out-of-band device into the web browser.
 *   2. Transfer a code displayed in the web browser to the out-of-band device.
 *   3. Confirm their intent to authenticate in the out-of-band device,
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
exports = module.exports = function(gateway, Address, store) {
  
  function validate(req, res, next) {
    if (!req.body.address) { return next(new httpErrors.BadRequest('Missing required parameter: address')); }
    next();
  }
  
  function initiate(req, res, next) {
    var address = req.body.address
      , transport = req.body.transport;
    
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
  }
  
  
  return [
    require('body-parser').urlencoded({ extended: false }),
    require('csurf')({ value: function(req){ return req.body && req.body.csrf_token; } }),
    require('flowstate')({ store: store }),
    validate,
    initiate
  ];
};

// Module annotations.
exports['@require'] = [
  'module:@authnomicon/oob.Gateway',
  'module:@authnomicon/oob/address',
  'module:flowstate.Store'
];
