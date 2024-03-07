// Module dependencies.
var express = require('express');

/**
 * Create out-of-band authentication service.
 *
 * Returns an HTTP service that authenticates a user using an out-of-band
 * authenticator.
 *
 * @param {express.RequestHandler} promptHandler - Handler which prompts the
 *          user to authenticate using an out-of-band device.
 * @param {express.RequestHandler} verifyHandler - Handler which verifies the
 *.         user's authentication via an an out-of-band device.
 * @returns {express.Router}
 */
exports = module.exports = function(promptHandler, verifyHandler) {
  var router = express.Router();
  router.get('/', promptHandler);
  router.post('/', verifyHandler);
  
  return router;
};

// Module annotations.
exports['@implements'] = 'http://i.bixbyjs.org/http/Service';
exports['@path'] = '/login/oob';
exports['@require'] = [
  './handlers/prompt',
  './handlers/verify'
];
