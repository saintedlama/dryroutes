module.exports = function() {
  return function(req, res, next){
    if (req.view && req.model) {
      return res.render(req.view, req.model);
    }

    next();
  }
};
