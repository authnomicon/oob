// Module dependencies.
var express = require('express');

exports = module.exports = function(promptHandler, initiateHandler) {
  var router = express.Router();
  router.get('/', promptHandler);
  router.post('/', initiateHandler);
  
  return router;
};

// Module annotations.
exports['@implements'] = 'http://i.bixbyjs.org/http/Service';
exports['@path'] = '/login/oob';
exports['@require'] = [
  './handlers/prompt',
  './handlers/initiate'
];
