var express = require('express');

//
// GET home page.
//
module.exports = function() {
  var router = new express.Router();

  router.get('/', function(req, res) {
    res.render('index');
  });

  return router;
};