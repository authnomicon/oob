// Module dependencies.
var express = require('express');

exports = module.exports = function(promptHandler) {
  var router = express.Router();
  router.get('/', promptHandler);
  
  return router;
};

// Module annotations.
exports['@implements'] = 'http://i.bixbyjs.org/http/Service';
exports['@path'] = '/login/oob';
exports['@require'] = [
  './handlers/prompt'
];
