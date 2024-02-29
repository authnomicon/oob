exports = module.exports = function(parser) {
  
  return {
    parse: function(address) {
      return parser.parse(address);
    }
  };
};

// Module annotations.
exports['@singleton'] = true;
exports['@implements'] = 'module:@authnomicon/oob.address';
exports['@require'] = [
  './address/parser'
];
