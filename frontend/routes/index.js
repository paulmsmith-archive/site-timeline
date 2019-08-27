var express = require('express');
var router = express.Router();
const config = require('../config')

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index.html');
});

router.get('^/:date([0-9]{4}-[0-9]{2}-[0-9]{2})', function(req, res) {
  res.render('date.html', { widths: config.widths, pages: config.pages, date: req.params.date });
});

module.exports = router;
