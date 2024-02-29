var NUMERIC = '0123456789';

function Gateway(randomSecret) {
  this._channels = {};
  this._randomSecret = randomSecret;
}

Gateway.prototype.use = function(scheme, channel) {
  this._channels[scheme] = channel;
}

Gateway.prototype.challenge = function(address, transport, channel, cb) {
  console.log('OOB challenge')
  console.log(address)
  console.log(transport)
  console.log(channel);
  
  var secret = this._randomSecret(6, NUMERIC);
  console.log(secret);
  
  
  var c = this._channels[channel];
  if (!c) {
    // TODO: Make a unique error with an error code so it can be handled
    throw new Error('Unsupported channel: ' + channel);
  }
  
  
  console.log('challenge it...');
  
  
  c.transmit(address, transport, secret, function(err) {
    console.log('TRANSMITTED!');
    
    if (err) { return cb(err); }
    return cb(null, { secret: secret });
  });
  
  
  return;
  
  
  
  return c.transmit(address, transport, cb);
  
  //return cb(null, { code: '111222' });
}

module.exports = Gateway;
