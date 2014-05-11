var mongodb = require('mongojs');
var async = require('async');

var resolveDeferred = function(model, next) {
  var callbacks = [];

  for (var key in model) {
    if (model.hasOwnProperty(key)) {

      // TODO: This should be configurable by some 'strategy' pattern
      if (model[key] instanceof mongodb.Cursor) {
        callbacks.push(function(cb) {
          model[key].toArray(function(err, arr) {
            if (err) { return cb(err); }

            model[key] = arr;

            cb();
          });
        });
      }
    }
  }

  async.series(callbacks, next);
};

// TODO: Should work with callbacks and promises
module.exports = function() {
  return function(req, res, next) {
    if (!req.model) {
      return next();
    }

    resolveDeferred(req.model, next);
  }
};