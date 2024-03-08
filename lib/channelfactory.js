var NUMERIC = '0123456789';

function ChannelFactory(randomSecret) {
  this._channels = {};
  this._randomSecret = randomSecret;
}

ChannelFactory.prototype.use = function(scheme, channel) {
  this._channels[scheme] = channel;
}

ChannelFactory.prototype.create = function(channel) {
  var self = this;
  return new Promise(function(resolve, reject) {
    var c = self._channels[channel];
    if (!c) { return reject(new Error('Unsupported channel: ' + channel)); }
    return resolve(c);
  });
}


ChannelFactory.prototype.challenge = function(channel, address, transport, cb) {
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

module.exports = ChannelFactory;
