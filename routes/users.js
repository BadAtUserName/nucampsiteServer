const express = require('express');
const User = require('../models/user');
const passport = require('passport'); // Added passport to handle authentication

const router = express.Router();

// GET users listing
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

// POST /signup route
router.post('/signup', (req, res) => {
  // The User.register() method is used by Passport's local strategy to create a new user.
  User.register(
      new User({username: req.body.username}), // Create a new User instance with the provided username
      req.body.password, // Password is automatically hashed by Passport
      err => {
          if (err) {
              // Handle errors during registration (e.g., user already exists)
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.json({err: err});
          } else {
              // Authenticate the user after registration using Passport
              passport.authenticate('local')(req, res, () => {
                  res.statusCode = 200;
                  res.setHeader('Content-Type', 'application/json');
                  res.json({success: true, status: 'Registration Successful!'}); // Respond with success message
              });
          }
      }
  );
});

// POST /login route
router.post('/login', passport.authenticate('local'), (req, res) => {
  // Authenticate the user using Passport's local strategy middleware
  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  res.json({success: true, status: 'You are successfully logged in!'}); // Respond with success message
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
