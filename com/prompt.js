var url = require('url');

exports = module.exports = function() {
  
  return function(req, res, next) {
    var q = {};
    //if (res.locals.loginHint) { q.login_hint = res.locals.loginHint; }
    
    return res.redirect(url.format({
      pathname: '/login/oob',
      query: q
    }));
  };
};

exports['@implements'] = 'http://i.authnomicon.org/prompts/http/Prompt';
exports['@name'] = 'oob';
