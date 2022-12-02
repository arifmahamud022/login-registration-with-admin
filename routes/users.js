var express = require('express');
var router = express.Router();
var passport = require('passport');
var localStrategy = require('passport-local').Strategy;
const { body, validationResult } = require('express-validator');
var User = require('../models/user');
/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.post('/login',
  passport.authenticate('local', {
    failureRedirect: '/login',
    
  }),
  function (req, res) {
    res.redirect('/');
  }
);

passport.serializeUser(function (user, done) {
  done(null, user.id);
});

passport.deserializeUser(function (id, done) {
  User.getUserById(id, function (err, user) {
    done(err, user);
  });
});

passport.use(new localStrategy(function (username, password, done) {
  User.getUserByUsername(username, function (err, user) {
    if (err) throw err;
    if (!user) {
      return done(null, false, { message: 'Unknown User' });
    }
    User.comparePassword(password, user.password, function (err, isMatch) {
      if (err) return done(err);
      if (isMatch) {
        return done(null, user);
      } else {
        return done(null, false, { message: 'Invalid Password' });
      }
    })
  });
}));

router.get('/logout', function (req, res) {
  req.session.destroy(function (err) {
    res.redirect('/login'); //Inside a callback… bulletproof!
  });
});


router.post('/register',
body('email','Invalid Email Address').isEmail(),
body('username','Username Required').notEmpty(),
body('first_name','First Name Required').notEmpty(),
body('last_name','Last Name Required').notEmpty(),
body('password','Password Required').isLength({min: 6}),
body('password2','Password Not Match').custom((value,{req}) => (value === req.body.password)),



function(req, res, next) {
  var email = req.body.email;
  var username = req.body.username;
  var first_name =req.body.first_name;
  var last_name =req.body.last_name;
  var password = req.body.password;
  var password2= req.body.password2;
  
  console.log(req.body);
  const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.render('register', { title: 'register', errors: errors.errors });
    }
    else{
      var newUser =new User ({
        email: email,
        username: username,
        first_name: first_name,
        last_name:last_name,
        password: password,
        role:'user',
      });
      User.createUser(newUser, function (err, user) {
        if (err) throw err;
        console.log(user);
      });
      res.redirect('/login')
  
  
  
  
  
    }




});










module.exports = router;
