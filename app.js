var express = require('express');
var path = require('path');
var favicon = require('static-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var less = require('less-middleware');
var routes = require('./routes/index');
var tasks = require('./routes/tasks');

var loadCursor = require('./lib/load_cursor');
var lookupView = require('./lib/lookup_view');
var validate = require('./lib/validate');
var success = require('./lib/success');

var http = require('http');

var app = express();

app.set('port', process.env.PORT || 3000);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(favicon());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());
app.use(less({ src: __dirname + '/public', compress: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.locals.appname = 'Express.js Todo App';

var validateAddTask = function(req, res, next) {
  if (!req.body || !req.body.name) return next(new Error('No data provided.'));

  next();
};

app.get('/', routes.index);
app.get('/tasks', loadCursor, lookupView, tasks.list);
app.post('/tasks', validate(validateAddTask), loadCursor, lookupView, success, tasks.add);
app.post('/tasks/complete', success, tasks.markAllCompleted);
app.post('/tasks/:task_id', success, tasks.markCompleted);
app.del('/tasks/:task_id', tasks.del);
app.get('/tasks/completed', loadCursor, lookupView, tasks.completed);


/// catch 404 and forwarding to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

/// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
