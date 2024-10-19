const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const User = require('./models/user');
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const jwt = require('jsonwebtoken'); //used to create, sign, and verify tokens
const config = require('./config.js');

// Local Strategy for authentication
exports.local = passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


exports.getToken = function(user) {
  return jwt.sign(user, config.secretKey, { expiresIn: 3600 });//how long before the token expires
};

// JWT Strategy setup
const opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = config.secretKey;

exports.jwtPassport = passport.use(new JwtStrategy(opts, (jwt_payload, done) => {
  console.log('JWT payload:', jwt_payload);

  User.findOne({ _id: jwt_payload._id })
      .then(user => {
          if (user) {
              return done(null, user);
          } else {
              return done(null, false);
          }
      })
      .catch(err => done(err, false));
}));

// Middleware to verify users using JWT
exports.verifyUser = passport.authenticate('jwt', { session: false });

// Middleware to verify if a user is an admin
//Implement verifyAdmin funct
exports.verifyAdmin = (req, res, next) => {
    //check if user is an admin
  if (req.user && req.user.admin) {
      return next();
  } else {
    //user is not an admin, they cannot have access
      const err = new Error('You are not authorized to perform this operation!');
      err.status = 403;//forbidden
      res.status(403).send(`
      <html>
        <body style="text-align: center;">
          <h1>403 - Forbidden</h1>
          <p>You are not authorized to perform this operation!</p>
          <img src="https://http.cat/403" alt="403 Forbidden Cat">
        </body>
      </html>
      `);
      return next(err); // pass the error to the error-handleing middleware
  }
};


