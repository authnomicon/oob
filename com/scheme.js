// Module dependencies.
var Strategy = require('passport-oob');

exports = module.exports = function() {
  
  return new Strategy(function(address, transport, channel, cb) {
    return cb(null, { channel: channel, address: address }, { transport: transport });
  });
};

// Module annotations.
exports['@require'] = [];
