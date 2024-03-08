var AddressStoreFactory = require('../lib/addressstorefactory');


exports = module.exports = function(C, logger) {
  var factory = new AddressStoreFactory();
  
  return Promise.resolve(factory)
    .then(function(factory) {
      return new Promise(function(resolve, reject) {
        // TODO: figure out how this interplays with service discovery and multiple stores, but
        //.      that don't have corresponding databases
        var components = C.components('module:@authnomicon/credentials.OOBAddressStore');
    
        (function iter(i) {
          var component = components[i];
          if (!component) {
            return resolve(factory);
          }
        
          component.create()
            .then(function(store) {
              logger.info('Loaded OOB address store: ' + component.a['@name']);
              factory.use(component.a['@name'], store);
              iter(i + 1);
            }, function(err) {
              // TODO: Print the package name in the error, so it can be found
              // TODO: Make the error have the stack of dependencies.
              if (err.code == 'IMPLEMENTATION_NOT_FOUND') {
                logger.notice(err.message + ' while loading component ' + component.id);
                return iter(i + 1);
              }
          
              reject(err);
            })
        })(0);
      });
    });
};

exports['@implements'] = 'module:@authnomicon/credentials.OOBAddressStoreFactory';
exports['@singleton'] = true;
exports['@require'] = [
  '!container',
  'http://i.bixbyjs.org/Logger'
];
