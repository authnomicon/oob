var url = require('url');

exports = module.exports = function() {
  
  return function(req, res, next) {
    var q = {};
    if (res.locals.address) { q.address = res.locals.address; }
    
    return res.redirect(url.format({
      pathname: '/login/oob',
      query: q
    }));
  };
};

exports['@implements'] = 'http://i.authnomicon.org/prompts/http/Prompt';
exports['@name'] = 'oob';
