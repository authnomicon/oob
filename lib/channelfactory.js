function ChannelFactory() {
  this._channels = {};
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

module.exports = ChannelFactory;
