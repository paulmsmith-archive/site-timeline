var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});


/* GET home page. */
router.get('^/:date([0-9]{4}-[0-9]{2}-[0-9]{2})', function(req, res, next) {
  res.render('day');
});

module.exports = router;
