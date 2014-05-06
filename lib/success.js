// TODO: Make this a factory function and allow a lookup strategy to be passed in or a string
module.exports = function(req, res, next) {
  res.success = function () {
    if (req.mount) {
      return res.redirect(req.mount);
    }

    return res.redirect('/');
  };

  next();
};