function Gateway() {
  this._channels = {};
}

Gateway.prototype.use = function(scheme, channel) {
  this._channels[scheme] = channel;
}

Gateway.prototype.transmit = function(address, transport, channel, cb) {
  console.log('OOB transmit')
  console.log(address)
  console.log(transport)
  console.log(channel);
  
  
  //return cb(null, { code: '111222' });
}

module.exports = Gateway;
