module.exports = function() {
  return function(req, res, next){
    if (req.view && req.model) {
      console.log('model and view are set for render', req.view, req.model);

      return res.render(req.view, req.model);
    }

    console.log('model or view are NOT set, calling next',req.view, req.model);

    next();
  }
};