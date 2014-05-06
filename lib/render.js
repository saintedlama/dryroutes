module.exports = function() {
  return function(req, res, next){
    if (req.view) {
      return res.render(req.view, req.model);
    }

    next();
  }
};