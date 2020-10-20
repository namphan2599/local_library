var express = require('express');
const { route } = require('.');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.get('/cool', function(req, res, next) {
    res.send('u cool man');
});

module.exports = router;
