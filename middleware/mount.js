module.exports = function() {
  return function(req, res, next) {
    if (req.url && req.originalUrl) {
      if (req.url == '/') {
        req.mount = req.originalUrl;
      } else {
        req.mount = req.originalUrl.substr(0, req.originalUrl.length - req.url.length);
      }
    }

    next();
  }
};