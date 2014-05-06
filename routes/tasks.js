var express = require('express');

var tasks = require('../tasks');

var loadCursor = require('../lib/load_cursor');
var validate = require('../lib/validate');
var success = require('../lib/success');

var mount = require('../lib/mount');
var view = require('../lib/view');
var render = require('../lib/render');

var validateAddTask = function(req, res, next) {
  if (!req.body || !req.body.name) return next(new Error('No data provided.'));

  next();
};

var tasksView = view('tasks');

// ## Routing
module.exports = function() {
  var router = new express.Router();

  router.use(mount());

  router.get('/', loadCursor, tasksView, function(req, res, next){
    req.model = {
      tasks : tasks.all()
    };

    next();
  });

  router.post('/', validate(validateAddTask), loadCursor, success, function(req, res, next){
    tasks.add(req.body.name, function(err) {
      if (err) { return next(err); }

      res.success();
    });
  });

  router.get('/complete', loadCursor, tasksView, function(req, res, next) {
    req.model = {
      tasks: tasks.completed()
    };

    next();
  });

  router.post('/complete', success, function(req, res, next) {
    tasks.completeAll(function(err) {
      if (err) return next(err);

      res.success();
    });
  });

  router.post('/:task_id', success, function(req, res, next) {
    tasks.complete(req.params.task_id, function(err) {
      if (err) return next(err);

      res.success();
    });
  });

  router.delete('/:task_id', function(req, res, next) {
    tasks.del(req.params.task_id, function(err) {
      if (err) { return next(err); }

      res.send(200);
    });
  });

  router.use(render());

  return router;
};