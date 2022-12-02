var express = require('express');
var router = express.Router();

const { islogin,isAdmin } = require('../config/auth')

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' ,user: req.user});
});

router.get('/login', function(req, res, next) {
  res.render('login', { title: 'Express',user: req.user,errors:'' });
});

router.get('/register', function(req, res, next) {
  res.render('register', { title: 'Express' ,user: req.user,errors:''});
});
router.get('/afterlogin',isAdmin,islogin, function(req, res, next) {
  res.render('afterlogin', { title: 'Express' ,user: req.user,errors:''});
});

module.exports = router;
