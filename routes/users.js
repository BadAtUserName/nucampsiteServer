const express = require('express');
const User = require('../models/user');//import user model for MOngoDB operation
const passport = require('passport'); // Added passport to handle authentication

const router = express.Router();//create instance of express router
const authenticate = require('../authenticate');//import custom auth middleware

// GET users listing
router.get('/', authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
  User.find()//find all users in database
  .then(users => {
    res.statusCode = 200;//ok
    res.setHeader('Content-Type', 'application/json');
    res.json(users)//Send list of users as json
  })
  .catch(err => next(err));//error handle
})

// POST /signup route
router.post('/signup', (req, res) => {
  const user = new User({username: req.body.username})//create new user
  // The User.register() method is used by Passport's local strategy to create a new user.
  User.register(user, req.body.password)//reg new user w. provider password 
  .then(registeredUser => {
    //set first & last name if provided
    if (req.body.firstname) {
      registeredUser.firstname = req.body.firstname;
    }
    if (req.body.lastname) {
      registeredUser.lastname = req.body.lastname;
    }
    return registeredUser.save();//save user
  })
  .then(() => {
    //auth newly reg user
    passport.authenticate('local')(req, res, () => {
      res.statusCode = 200;//ok
      res.setHeader('Content-Type', 'application/json');//set response content type
      res.json({ success: true, status: 'Registration Successful!'});//return success message
    })
  })
  .catch(err => {
    res.statusCode = 500;//uh-oh internal server error status code
    res.setHeader('Content-Type', 'application/json');//set response type content
    res.json({err: err});//return error message
  });
});

// POST /login route
router.post('/login', passport.authenticate('local', {session: false}), (req, res) => {
  //Generate a JWT token for the logged-in user
  const token = authenticate.getToken({_id: req.user._id});
  res.statusCode = 200;//ok
  res.setHeader('Content-Type', 'application/json');//set response content type
  res.json({success: true, token, status: 'You are successfully logged in'});//return success message and token
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
