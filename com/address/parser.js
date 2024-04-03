var Parser = require('../../lib/address/parser');

exports = module.exports = function(C, logger) {
  var parser = new Parser();
  
  return Promise.resolve(parser)
    .then(function(parser) {
      return new Promise(function(resolve, reject) {
        var components = C.components('module:@authnomicon/oob.AddressParser');
      
        (function iter(i) {
          var component = components[i];
          if (!component) {
            return resolve(parser);
          }
          
          component.create()
            .then(function(p) {
              logger.info('Loaded address parser: ' + component.a['@channel']);
              parser.use(p);
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

exports['@singleton'] = true;
exports['@require'] = [
  '!container',
  'http://i.bixbyjs.org/Logger'
];
