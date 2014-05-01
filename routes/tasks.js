var db = require('../lib/db');
var mongodb = require('mongojs');

// # Dry your routes
//
// Route handlers have 4 basic steps - everywhere in every app. Really. Trust me
//
// * validate
// * act
// * prepare
// * render
//

//
// ## Take this router, it lists tasks
//
// * prepare Load tasks from db.tasks collection
// * render Combined with prepare cause setting title to "Task List" is preparing something
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

//
// ## Let's investigate some piece of code that modifies something.
// This code adds an item to a tasks list
//
// We should see something like
// * validate
// * act
// * prepare
// * render
module.exports.add = function(req, res, next){
  // validate, ok well quite simple but validates
  if (!req.body || !req.body.name) return next(new Error('No data provided.'));

  // act, we do something
  db.tasks.save({
    name: req.body.name,
    completed: false
  }, function(error, task){

    // Prepare!
    if (error) return next(error);
    if (!task) return next(new Error('Failed to save.'));

    // render, redirecting is render since we're talking HTTP here
    res.redirect('/tasks');
  })
};

//
// Next piece of code that does something
//
module.exports.markAllCompleted = function(req, res, next) {
  // validate
  if (!req.body.all_done || req.body.all_done !== 'true') return next();

  // act
  db.tasks.update({
    completed: false
  }, {$set: {
    completed: true
  }}, {multi: true}, function(error){
    // prepare
    if (error) return next(error);

    // render
    res.redirect('/tasks');
  })
};

//
// Some read operation as contrast:
//
// prepare
// render
//
module.exports.completed = function(req, res, next) {
  // prepare
  db.tasks.find({completed: true}).toArray(function(error, tasks) {

    // render
    res.render('tasks_completed', {
      title: 'Completed',
      tasks: tasks || []
    });
  });
};

//
// Let's mark all tasks as completed
//
module.exports.markCompleted = function(req, res, next) {
  // validate
  if (!req.body.completed) return next(new Error('Param is missing'));

  // act
  db.tasks.updateById(req.task._id, {$set: {completed: req.body.completed === 'true'}}, function(error, count) {
    // prepare
    if (error) return next(error);
    if (count !==1) return next(new Error('Something went wrong.'));

    // render
    res.redirect('/tasks');
  })
};

//
// Last one, delete a task
//
module.exports.del = function(req, res, next) {
  // act
  db.tasks.removeById(req.task._id, function(error, count) {
    // prepare
    if (error) return next(error);
    if (count !==1) return next(new Error('Something went wrong.'));

    // render
    res.send(200);
  });
};

//
// Let's clean that mess up it does not seem dry
//
// 1. Extract our app
//
// Just the interface we'll fill the code later
var tasks = {
  all : function() {
    return db.tasks.find({completed: false});
  },

  completed : function() {

  },

  add : function() {

  },

  complete : function() {

  },

  completeAll : function() {

  },

  del : function() {

  }
};

//
// 2. Let's list tasks
//
module.exports.list = function(req, res){
  var model = {
    title : 'Todo List',
    tasks : tasks.all()
  };

  res.render('tasks', model);
};

//
// Nicer? Yes! Working? No!
//

// 1. We need logic to query tasks - only return our cursor in this case
tasks.all = function() {
  return db.tasks.find({completed: false});
};

// 2. We need something to "prepare" views without messing around with promises of getting called back
var render = function(req, res, view, model) {
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
      res.render(view, model);
    }
  };

  pickNext();
};

// Our new implementation of the list handler
module.exports.list = function(req, res){
  var model = {
    title : 'Todo List',
    tasks : tasks.all()
  };

  render(req, res, 'tasks', model);
};

//
// Nicer? Yes! Works? Yes! Could it be nicer? Yes!
//
// 1. Render takes too many arguments
// 2. View names are repeated
//
// How to get fewer arguments into render?
//
// Override res.render in some middleware - But here? In this file?
//
// The first lie of routes - routes and route handlers are non independent parts
// But! Your app is not the route handler
// The route handler is the interface between HTTP and your app
//
// Let's tackle these problems
// -> Middleware!
// warp res.render multiple times and use routes to discover views
//
module.exports.list = function(req, res){
  res.render({
    title : 'Todo List',
    tasks : tasks.all()
  });
};

//
// Try this schema with something new - list completed tasks
//
tasks.completed = function() {
  return db.tasks.find({completed: true}); // TODO: Where can something like tasks || [] be done?
};

module.exports.completed = function(req, res) {
  res.render({
    title: 'Completed',
    tasks: tasks.completed()
  });
};

// Working with a little bit of tweaking the view lookup logic!

//
// The last thing -> dry modifying operations
//
// * validate
// * act
// * prepare
// * render
//
// 1. validate is a middleware concern
// 2. let our application act
// 3. Split the prepare part into application logic and HTTP wiring
//

tasks.add = function(name, next) {
  // act, we do something
  db.tasks.save({
    name: name,
    completed: false
  }, function(error, task){
    if (error) return next(error);
    if (!task) return next(new Error('Failed to save.'));

    return next();
  })
};

// Looks nice? Oh yes! Works? Yes!
module.exports.add = function(req, res, next){
  tasks.add(req.body.name, function(error) {
    if (error) return next(error);

    // render, redirecting is render since we're talking HTTP here
    res.redirect('/tasks');
  });
};


//
// The redirect is a pretty ugly, let's abstract this concept
//
// -> res.success? perhaps not the best name but...
//
// The reason for this is not to tie our route handler to a 302 -> APIs
//
module.exports.add = function(req, res, next){
  tasks.add(req.body.name, function(error) {
    if (error) return next(error);

    res.success();
  });
};

//
// Let's complete our tasks app...
//

// ## Application
var tasks = {
  all : function() {
    return db.tasks.find({completed: false});
  },

  completed : function() {
    return db.tasks.find({completed: true});
  },

  add : function(name, next) {
    db.tasks.save({
      name: name,
      completed: false
    }, function(error, task){
      if (error) return next(error);
      if (!task) return next(new Error('Failed to save.'));

      return next();
    });
  },

  complete : function(taskId, next) {
    db.tasks.updateById(taskId, {$set: { completed: true }}, function(error, count) {
      if (error) return next(error);
      if (count !==1) return next(new Error('Could not mark task completed with id ' + taskId));

      next();
    })
  },

  completeAll : function(next) {
    db.tasks.update({ completed: false},
      { $set: { completed: true }},
      {multi: true},
      next);
  },

  del : function(taskId, next) {
    db.tasks.removeById(taskId, function(error, count) {
      if (error) return next(error);
      if (count !==1) return next(new Error('Could not delete task with id ' + taskId));

      next();
    });
  }
};

// ## Route handlers
module.exports.list = function(req, res){
  res.render({
    title: 'Todo List',
    tasks : tasks.all()
  });
};

module.exports.add = function(req, res, next){
  tasks.add(req.body.name, function(err) {
    if (err) { return next(err); }

    res.success();
  });
};

module.exports.markAllCompleted = function(req, res, next) {
  tasks.markAllCompleted(function(err) {
    if (err) return next(err);

    res.success();
  });
};

module.exports.completed = function(req, res) {
  res.render({
    title: 'Completed',
    tasks: tasks.completed()
  });
};

module.exports.markCompleted = function(req, res, next) {
  tasks.markCompleted(req.task._id, function(err) {
    if (err) return next(err);

    res.success();
  });
};

module.exports.del = function(req, res, next) {
  tasks.del(req.task._id, function(err) {
    if (err) { return next(err); }

    res.success();
  });
};
