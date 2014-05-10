// # Dry Routes with Express
// Don't repeat yourself build your own conventions!

// # Anatomy of a Route
// * Routes and route handlers depend on each other (TODO: Ghost example!)
// * Routes define the __interface__ of your application
// * Routes are not your application!
// * Routes and route handlers

// # Route Flows
//
// Every route handler consists of these steps
//
// * Validate
// * Act
// * Prepare Model
// * Render

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


// # Refactor
//
// * Reveal the app
// * Move out boilerplate
// * Establish conventions
//

// # Application
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

// ## Load deferred middleware
// Loads any cursor, promise and callbacks to avoid async callback hell
// when rendering views.
// TODO: Move to  view and make view more versatile - including callback and promise!
var loadCursor = require('../middleware/deferred');

// ## Success middleware
// Used to redirect to a 'success' url after a route handler succeeded
var success = require('../middleware/success');

// ## Mount middleware
// sets req.mount field to access the url path part this routes were mounted to
var mount = require('../middleware/mount');

// ## View middleware
// Sets req.view fields using conventions
// Create a view function passing the 'tasks' hint to advice view to
// where to search for task views
var view = require('../middleware/view');
var tasksView = view('tasks');

// ## Routes
// Code is clean and shiny. So shiny! So shiny!
function routes(router) {
    router.get('/', loadCursor, tasksView, function(req, res, next){
        req.model = {
            tasks : tasks.all()
        };

        next();
    });

    router.post('/', validateAddTask, loadCursor, success, function(req, res, next){
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

    router.post('/:id', success, function(req, res, next) {
        tasks.complete(req.params.id, function(err) {
            if (err) return next(err);

            res.success();
        });
    });

    router.delete('/:id', function(req, res, next) {
        tasks.del(req.params.id, function(err) {
            if (err) { return next(err); }

            res.send(200);
        });
    });
}

// ## Setup the router
// Pulled to the bottom to reveal our routes
//
// * Creates a router
// * register router middleware
// * register routes
//
module.exports = function() {
  var express = require('express');
  var render = require('../middleware/render');

  var router = new express.Router();
  router.use(mount());

  routes(router);

  router.use(render());

  return router;
};
