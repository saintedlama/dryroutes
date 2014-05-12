// # Dry Routes with Express
// <img src="public\images\dry.jpg" />

// # Tasks Application
// Yeah! Something new! Never saw a tasks app as an sample!
module.exports.list = function(req, res, next){
  db.tasks.find({completed: false}).toArray(function(error, tasks){
    if (error) return next(error);

    res.render('tasks', {
      title: 'Todo List',
      tasks: tasks || []
    });
  });
};

module.exports.add = function(req, res, next){
  if (!req.body || !req.body.name) return next(new Error('No data provided.'));

  db.tasks.save({
    name: req.body.name,
    completed: false
  }, function(error, task){

    if (error) return next(error);
    if (!task) return next(new Error('Failed to save.'));

    res.redirect('/tasks');
  })
};

module.exports.markAllCompleted = function(req, res, next) {
  if (!req.body.all_done || req.body.all_done !== 'true') return next();

  db.tasks.update({
    completed: false
  }, {$set: {
    completed: true
  }}, {multi: true}, function(error){
    if (error) return next(error);

    res.redirect('/tasks');
  })
};

module.exports.completed = function(req, res) {
  db.tasks.find({completed: true}).toArray(function(error, tasks) {

    res.render('tasks_completed', {
      title: 'Completed',
      tasks: tasks || []
    });
  });
};

module.exports.markCompleted = function(req, res, next) {
  if (!req.body.completed) return next(new Error('Param is missing'));

  db.tasks.updateById(req.task._id, {$set: {completed: req.body.completed === 'true'}}, function(error, count) {
    if (error) return next(error);
    if (count !==1) return next(new Error('Something went wrong.'));

    res.redirect('/tasks');
  })
};

module.exports.del = function(req, res, next) {
  db.tasks.removeById(req.task._id, function(error, count) {
    if (error) return next(error);
    if (count !==1) return next(new Error('Something went wrong.'));

    res.send(200);
  });
};

// # Not DRY!
//
// Routes are always executing the same __4__ actions
//
// * Validate Input
// * Act on Model
// * Prepare Model
// * Render
//


// # Conventions = Hacking Middleware
// <img src="public\images\smile.jpg" />


// # Extract Application
// The application and route handlers are split to reveal the application!
//
// The application is not the web, the web is our interface
//
// * Use app in Tests
// * Expose app via REST APIs
// * Expose app via (evil) SOAP API
//
var tasks = require('../tasks');

// # Middleware
//
// * Mount middleware
//   * Sets req.mount field to access the url path part this routes were mounted to
//
// * Redirect middleware
//   * Used to redirect to a 'success' url after a route handler succeeded
//
// * Load deferred middleware
//   * Loads any mongodb cursor to avoid callback hell
//
// * View middleware
//   * Sets req.view fields using conventions
//
// * Render middleware
//   * Uses view and model fields from req to render the view via res.render


// # Setup the router
//
// * Create a router
// * Register router middleware
// * Register routes
//
var mount = require('../middleware/mount');
var redirect = require('../middleware/redirect');
var deferred = require('../middleware/deferred');
var view = require('../middleware/view');
var render = require('../middleware/render');

module.exports = function() {
  var express = require('express');

  var router = new express.Router();
  router.use(mount());
  router.use(view('tasks'));

  routes(router);

  router.use(deferred());
  router.use(render());
  router.use(redirect());

  return router;
};

var validateAddTask = function(req, res, next) {
  if (!req.body || !req.body.name) return next(new Error('No data provided.'));

  next();
};

// # Routes
// Slick!
function routes(router) {
    router.get('/', function(req, res, next) {
      req.model = {
        tasks : tasks.all()
      };

      next();
    });

    router.post('/', validateAddTask, function(req, res, next){
        tasks.add(req.body.name, next);
    });

    router.get('/complete', function(req, res, next) {
      req.model = {
          tasks: tasks.completed()
      };

      next();
    });

    router.post('/complete', function(req, res, next) {
        tasks.completeAll(next);
    }, redirect());

    router.post('/:id', function(req, res, next) {
        tasks.complete(req.params.id, next);
    });

    router.delete('/:id', function(req, res, next) {
        tasks.del(req.params.id, function(err) {
            if (err) { return next(err); }

            res.send(200);
        });
    });
}

// # Thanks to
//
// ## Dryer Image
// <a href="https://www.flickr.com/photos/fuzzysaurus/5280819101" title="dryer by Jeremiah, on Flickr"><img src="https://farm6.staticflickr.com/5164/5280819101_dff0d09edd_s.jpg" style="width:75px;height:75px;" alt="dryer"></a>
// ## Tasks application by <a href="http://github.com/azat-co/todo-express">azat-co</a>.
// ## Evil Smile Image
// <a href="https://www.flickr.com/photos/joyousjoym/3040689761" title="SMILE Bigg by ♫ joyousjoym~ Blessings♥, on Flickr"><img src="https://farm4.staticflickr.com/3244/3040689761_0639dd0ec9_s.jpg" style="width:75px;height:75px;" alt="SMILE Bigg"></a>