module.exports = function() {
  return function(req, res) {
      if (req.mount) {
        return res.redirect(req.mount);
      }

      return res.redirect('/');
    };
};