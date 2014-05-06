var mongodb = require('mongojs');

// TODO: should be renamed to deferred loading and should work with callbacks and promises
module.exports = function(req, res, next) {
  var expressRender = res.render;

  res.render = function(view, model) {
    var self  = this;

    var cursors = [];

    for (var key in model) {
      if (model.hasOwnProperty(key)) {
        // TODO: This should be configurable by strategy
        if (model[key] instanceof mongodb.Cursor) {
          cursors.push(function(next) {
            model[key].toArray(function(err, arr) {
              if (err) { return next(err); }

              model[key] = arr;

              next();
            });
          });
        }
      }
    }

    var i=0;

    var pickNext = function(err) {
      // TODO: Handle err
      if (err) {
        next(err);
      }

      if (i < cursors.length) {
        var cursor = cursors[i];
        i++;
        cursor(pickNext);
      }
      else {
        expressRender.call(self, view, model);
      }
    };

    pickNext();
  };

  next();
};