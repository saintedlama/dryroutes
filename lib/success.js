// TODO: Make this a factory function and allow a lookup strategy to be passed in or a string
module.exports = function(req, res, next) {
  console.log('res.success', res.success);

  res.success = function () {
    var redirect = req.route.path.replace('/', '');
    var idx = redirect.indexOf('/');

    if (idx >= 0) {
      redirect = redirect.substring(0, idx);
    }

    console.log('redirect', redirect);

    res.redirect(redirect);
  };

  next();
};