// # Dry Routes with Express
// Don't repeat yourself by build your own conventions!


//
// ## Tasks Application
// From http://github.com/azat-co/todo-express.
// * These routes are __not__ dry
// * The application is buried under web framework code
//
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

// ## Anatomy of a Route
// * Routes and route handlers depend on each other (TODO: Ghost example!)
// * Routes define the __interface__ of your application
// * Routes are not your application!
// * Routes and route handlers
//

// ## Route Flows
//
// Every route handler consists of these steps
//
// * Validate
// * Act
// * Prepare Model
// * Render
//

// ## Validate
// Validates input sent via http
var validateAddTask = function(req, res, next) {
    if (!req.body || !req.body.name) return next(new Error('No data provided.'));

    next();
};

// ## Act
// Calls your application code
// Typically 'changes' some app state

// ## Prepare model
// Prepare the model to be rendered
// Load data

// ## Render
// Render the view
// Redirect __is__ render, we're talking HTTP here


// ## Refactor
//
// * Reveal the app
// * Move out boilerplate
// * Establish conventions
//

// ## Application
// Our application and route handlers are split to reveal the application!
//
// The application is not HTTP based, HTTP is our interface
//
// Application interfaces
//
// * Tests/test runners
// * Think of exposing your application as REST APIs
// * Think of exposing your application as evil SOAP API
//
var tasks = require('../tasks');

// ## Middleware
// ### Mount middleware
// Sets req.mount field to access the url path part this routes were mounted to
// Someone forgot to expose the mount url in express.js
var mount = require('../middleware/mount');

// ### Redirect middleware
// Used to redirect to a 'success' url after a route handler succeeded
var redirect = require('../middleware/redirect');

// ### Load deferred middleware
// Loads any mongodb cursor (promise and callbacks) to avoid async callback hell
// when rendering views.
var deferred = require('../middleware/deferred');

// ### View middleware
// Sets req.view fields using conventions.
var view = require('../middleware/view');

// ### Render middleware
// Uses view and model fields from __req__ to render the view via __res.render__
var render = require('../middleware/render');

// ## Setup the router
//
// * Creates a router
// * Register router middleware
// * Register routes
//
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


// ## Routes
// Code is clean and shiny. So shiny! So shiny!
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