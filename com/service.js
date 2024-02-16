// Module dependencies.
var express = require('express');

exports = module.exports = function(promptHandler, initiateHandler, challengeHandler) {
  var router = express.Router();
  router.get('/', promptHandler);
  router.post('/', initiateHandler);
  router.get('/verify', challengeHandler);
  
  return router;
};

// Module annotations.
exports['@implements'] = 'http://i.bixbyjs.org/http/Service';
exports['@path'] = '/login/oob';
exports['@require'] = [
  './handlers/prompt',
  './handlers/initiate',
  './handlers/challenge'
];
