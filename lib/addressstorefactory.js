function AddressStoreFactory() {
  this._stores = {};
}

AddressStoreFactory.prototype.use = function(channel, store) {
  this._stores[channel] = store;
}

AddressStoreFactory.prototype.create = function(channel) {
  var self = this;
  return new Promise(function(resolve, reject) {
    var s = self._stores[channel];
    if (!s) { return reject(new Error('Unsupported channel: ' + channel)); }
    return resolve(s);
  });
}

module.exports = AddressStoreFactory;
