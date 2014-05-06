var mount = require('../lib/mount');
var expect = require('chai').expect;

var createRequest = function(url, originalUrl) {
  return {
    url : url,
    originalUrl : originalUrl
  };
};

describe('mount', function() {
  it('should set mount point for "/"', function(done) {
    var req = createRequest('/', '/tasks');

    mount()(req, undefined, function(err) {
      expect(req.mount).to.equal('/tasks');
      done(err);
    });
  });

  it('should set mount point for sub urls', function(done) {
    var req = createRequest('/completed', '/tasks/completed');

    mount()(req, undefined, function(err) {
      expect(req.mount).to.equal('/tasks');
      done(err);
    });
  });
});