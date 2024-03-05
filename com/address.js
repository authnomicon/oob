exports = module.exports = function(parser) {
  
  return {
    parse: function(address) {
      return parser.parse(address);
    }
  };
};

// Module annotations.
exports['@implements'] = 'module:@authnomicon/oob/address';
exports['@singleton'] = true;
exports['@require'] = [
  './address/parser'
];
