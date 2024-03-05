// Module dependencies.
var express = require('express');

/**
 * Create out-of-band authentication service.
 *
 * Returns an HTTP service that authenticates a user using an out-of-band
 * authenticator.
 *
 * @param {express.RequestHandler} promptHandler - Handler which prompts the
 *          user to enter an address to be authenticated via an out-of-band
 *          device.
 * @param {express.RequestHandler} initiateHandler - Handler which initiates
 *          out-of-band authentication via a device associated with a given
 *          address.
 * @param {express.RequestHandler} inputHandler - Handler which prompts the user
 *          to input a code received by the out-of-band device.
 * @param {express.RequestHandler} verifyHandler - Handler which verifies the
 *          code received by the out-of-band device.
 * @returns {express.Router}
 */
exports = module.exports = function(promptHandler, initiateHandler, inputHandler, verifyHandler) {
  var router = express.Router();
  //router.get('/', promptHandler);
  //router.post('/', initiateHandler);
  router.get('/', initiateHandler);
  
  router.get('/verify', inputHandler);
  router.post('/verify', verifyHandler);
  // TODO: /confirm, transferHandler  Handler which displays the code for the user
  //.       to transfer to the out-of-band-device.
  // TODO: /confirm, confirmHandler Handler which confirms that authentication has
  //.       been completed on the secondary channel
  
  return router;
};

// Module annotations.
exports['@implements'] = 'http://i.bixbyjs.org/http/Service';
exports['@path'] = '/login/oob';
exports['@require'] = [
  './handlers/prompt',
  './handlers/initiate',
  './handlers/input',
  './handlers/verify'
];
