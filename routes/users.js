const express = require('express');
const User = require('../models/user');
const passport = require('passport'); // Added passport to handle authentication

const router = express.Router();
const authenticate = require('../authenticate');

// GET users listing
router.get('/', authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
  User.find()
  .then(users => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json(users)
  })
  .catch(err => next(err));
})

// POST /signup route
router.post('/signup', (req, res) => {
  const user = new User({username: req.body.username})
  // The User.register() method is used by Passport's local strategy to create a new user.
  User.register(user, req.body.password)
  .then(registeredUser => {
    if (req.body.firstname) {
      registeredUser.firstname = req.body.firstname;
    }
    if (req.body.lastname) {
      registeredUser.lastname = req.body.lastname;
    }
    return registeredUser.save();
  })
  .then(() => {
    passport.authenticate('local')(req, res, () => {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.json({ success: true, status: 'Registration Successful!'});
    })
  })
  .catch(err => {
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.json({err: err});
  });
});

// POST /login route
router.post('/login', passport.authenticate('local', {session: false}), (req, res) => {
  const token = authenticate.getToken({_id: req.user._id});
  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  res.json({success: true, token, status: 'You are successfully logged in'});
});

/* The commented-out code below is the previous manual authentication implementation.
router.post('/login', (req, res, next) => {
  if(!req.session.user) {
      const authHeader = req.headers.authorization;

      if (!authHeader) {
          const err = new Error('You are not authenticated!');
          res.setHeader('WWW-Authenticate', 'Basic');
          err.status = 401;
          return next(err);
      }

      const auth = Buffer.from(authHeader.split(' ')[1], 'base64').toString().split(':');
      const username = auth[0];
      const password = auth[1];

      User.findOne({username: username})
      .then(user => {
          if (!user) {
              const err = new Error(`User ${username} does not exist!`);
              err.status = 401;
              return next(err);
          } else if (user.password !== password) {
              const err = new Error('Your password is incorrect!');
              err.status = 401;
              return next(err);
          } else if (user.username === username && user.password === password) {
              req.session.user = 'authenticated';
              res.statusCode = 200;
              res.setHeader('Content-Type', 'text/plain');
              res.end('You are authenticated!')
          }
      })
      .catch(err => next(err));
  } else {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'text/plain');
      res.end('You are already authenticated!');
  }
});
*/

// Export the router to be used in the main app
module.exports = router;
