// TODO: Does not work for :id path
var join = function(dir, path) {
  if (dir && dir.length) {
    return dir + '/' + path;
  }

  return path;
};

module.exports = function(directory) {
  if (!directory) {
    directory = '';
  }

  if (directory[directory.length - 1] == '/') {
    directory = directory.substr(0, directory.length - 1);
  }

  return function(req, res, next) {
    var urlPath = req.route.path;

    if (urlPath == '/') {
      req.view = join(directory, 'index');
      return next();
    }

    req.view = join(directory, req.route.path.substring(1).replace(/\//gmi, '_'));
    next();
  }
};