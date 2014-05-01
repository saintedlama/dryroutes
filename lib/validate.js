module.exports = function(validate) {
  return function(req, res, next) {
    validate(req, res, function(err) {
      next(err);
    });
  }
};

