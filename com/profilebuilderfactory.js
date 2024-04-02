var ProfileBuilderFactory = require('../lib/profilebuilderfactory');


exports = module.exports = function(C, logger) {
  var factory = new ProfileBuilderFactory();
  
  return Promise.resolve(factory)
    .then(function(factory) {
      return new Promise(function(resolve, reject) {
        var components = C.components('module:@authnomicon/oob.ProfileBuilder');
    
        (function iter(i) {
          var component = components[i];
          if (!component) {
            return resolve(factory);
          }
        
          component.create()
            .then(function(fn) {
              logger.info('Loaded OOB profile builder: ' + component.a['@name']);
              factory.use(component.a['@name'], fn);
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

exports['@implements'] = 'module:@authnomicon/oob.ProfileBuilderFactory';
exports['@singleton'] = true;
exports['@require'] = [
  '!container',
  'http://i.bixbyjs.org/Logger'
];
