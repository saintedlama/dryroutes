var mongodb = require('mongojs');

module.exports = mongodb('mongodb://localhost/todoexpress', ['tasks']);