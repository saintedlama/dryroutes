// TODO: Make this a factory function and allow a lookup strategy to be passed in or a string
// TODO: Does not work for :id path!
module.exports = function(req, res, next) {
  var expressRender = res.render;

  res.render = function (model) {
    var self = this;

    var viewName = req.route.path.replace('/', '').replace('/', '_');

    // TODO: Remove
    console.log(viewName);

    expressRender.call(self, viewName, model);
  };

  next();
};