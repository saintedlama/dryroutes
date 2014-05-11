var mongodb = require('mongojs');
var db = require('./lib/db');

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
    db.tasks.update({ _id : new db.ObjectId(taskId) }, {$set: { completed: true }}, function(error, count) {
      if (error) return next(error);
      if (count !== 1) return next(new Error('Could not mark task completed with id ' + taskId));

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
    db.tasks.remove({ _id : new db.ObjectId(taskId) }, function(error, count) {
      if (error) return next(error);
      if (count !==1) return next(new Error('Could not delete task with id ' + taskId));

      next();
    });
  }
};

module.exports = tasks;