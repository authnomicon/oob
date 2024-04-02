function ProfileBuilderFactory() {
  this._builders = {};
}

ProfileBuilderFactory.prototype.use = function(channel, fn) {
  this._builders[channel] = fn;
}

ProfileBuilderFactory.prototype.create = function(channel) {
  var self = this;
  return new Promise(function(resolve, reject) {
    var fn = self._builders[channel];
    if (!fn) { return reject(new Error('Unsupported channel: ' + channel)); }
    return resolve(fn);
  });
}

module.exports = ProfileBuilderFactory;
