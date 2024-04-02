var ChannelFactory = require('../lib/channelfactory');


exports = module.exports = function(C, logger) {
  var gateway = new ChannelFactory();
  
  return Promise.resolve(gateway)
    .then(function(gateway) {
      return new Promise(function(resolve, reject) {
        var components = C.components('module:@authnomicon/oob.Channel');
    
        (function iter(i) {
          var component = components[i];
          if (!component) {
            return resolve(gateway);
          }
        
          component.create()
            .then(function(channel) {
              logger.info('Loaded OOB authentication channel: ' + component.a['@name']);
              gateway.use(component.a['@name'], channel);
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

exports['@implements'] = 'module:@authnomicon/oob.ChannelFactory';
exports['@singleton'] = true;
exports['@require'] = [
  '!container',
  'http://i.bixbyjs.org/Logger'
];
