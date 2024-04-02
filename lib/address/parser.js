function Parser() {
  this._parsers = [];
}

Parser.prototype.use = function(fn) {
  this._parsers.push(fn);
}

Parser.prototype.parse = function(address) {
  console.log('parse!')
  console.log('len: ' + this._parsers.length)
  
  
  var parser
    , parsed
    , i, len;
  for (i = 0, len = this._parsers.length; i < len; ++i) {
    console.log('ATTEMPTING PARSER: ' + i);
    parser = this._parsers[i];
    console.log(parser);
    try {
      parsed = parser(address);
      return parsed;
    } catch(ex) {
      console.log(ex);
    }
  }
  
  console.log('not parseable: ' + address);
  // TODO: throw error
}

module.exports = Parser;
