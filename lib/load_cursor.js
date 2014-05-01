var mongodb = require('mongojs');

module.exports = function(req, res, next) {
  var expressRender = res.render;

  res.render = function(view, model) {
    var self  = this;

    var cursors = [];

    for (var key in model) {
      if (model.hasOwnProperty(key)) {
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
        console.log(err);
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