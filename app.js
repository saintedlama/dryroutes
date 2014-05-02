var express = require('express');
var routes = require('./routes');
var tasks = require('./routes/tasks');
var http = require('http');
var path = require('path');
var app = express();

app.locals.appname = 'Express.js Todo App';

app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.cookieParser());
app.use(express.session({secret: '59B93087-78BC-4EB9-993A-A61FC844F6C9'}));
app.use(express.csrf());

app.use(require('less-middleware')({ src: __dirname + '/public', compress: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.use(function(req, res, next) {
  res.locals._csrf = req.session._csrf;
  return next();
});

app.use(app.router);

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

var loadCursor = require('./lib/load_cursor');
var lookupView = require('./lib/lookup_view');
var validate = require('./lib/validate');
var success = require('./lib/success');

var validateAddTask = function(req, res, next) {
  if (!req.body || !req.body.name) return next(new Error('No data provided.'));

  next();
};

app.get('/', routes.index);
app.get('/tasks', loadCursor, lookupView, tasks.list);
app.post('/tasks', validate(validateAddTask), loadCursor, lookupView, success, tasks.add);
app.post('/tasks/complete', success, tasks.markAllCompleted);
app.post('/tasks/:task_id', success, tasks.markCompleted);
app.del('/tasks/:task_id', success, tasks.del);

app.get('/tasks/completed', loadCursor, lookupView, tasks.completed);

app.all('*', function(req, res){
  res.send(404);
});

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
