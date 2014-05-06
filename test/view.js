var view = require('../lib/view');
var expect = require('chai').expect;

var createRequest = function(path) {
  return {
    route : {
      path : path
    }
  };
};

var createResult = function() {
  return {};
};

describe('view', function() {
  it('should set view to "index" for path "/"', function(done) {
    var req = createRequest('/');
    var res = createResult();

    view()(req, res, function(err) {
      expect(req.view).to.equal('index');
      done(err);
    });
  });

  it('should use directory for path "/" if supplied', function(done) {
    var req = createRequest('/');
    var res = createResult();

    view('tasks')(req, res, function(err) {
      expect(req.view).to.equal('tasks/index');
      done(err);
    });
  });

  it('should use directory without double "/" if suffixed with "/"', function(done) {
    var req = createRequest('/');
    var res = createResult();

    view('tasks/')(req, res, function(err) {
      expect(req.view).to.equal('tasks/index');
      done(err);
    });
  });

  it('should set view to route path for non index routes', function(done) {
    var req = createRequest('/complete');
    var res = createResult();

    view()(req, res, function(err) {
      expect(req.view).to.equal('complete');
      done(err);
    });
  });

  it('should use directory for path for non index routes', function(done) {
    var req = createRequest('/complete');
    var res = createResult();

    view('tasks')(req, res, function(err) {
      expect(req.view).to.equal('tasks/complete');
      done(err);
    });
  });

  it('should use directory without double "/" if suffixed with "/"', function(done) {
    var req = createRequest('/complete');
    var res = createResult();

    view('tasks/')(req, res, function(err) {
      expect(req.view).to.equal('tasks/complete');
      done(err);
    });
  });
});