
var createError = require('http-errors');
var express = require('express');
var path = require('path');
//var cookieParser = require('cookie-parser');
var logger = require('morgan');
const session = require('express-session');
const FileStore = require('session-file-store')(session);
const passport = require('passport');
const mongoose = require('mongoose');
const config = require('./config') //middleware setup
const authenticate = require('./authenticate'); // Ensure authenticate.js is config properly

//Router
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
const campsiteRouter = require('./routes/campsiteRouter');
const promotionRouter = require('./routes/promotionRouter');
const partnerRouter = require('./routes/partnerRouter');

//MongoDB connection
const url = config.mongoUrl;
//const url = 'mongodb://localhost:27017/nucampsite';
const connect = mongoose.connect(url, {});
connect.then(() => console.log('Connected correctly to server'),
  err => console.log(err)
);

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

//middleware setup
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
//app.use(cookieParser('12345-67890-09876-54321'));
app.use(express.static(path.join(__dirname, 'public')));

//Sssion config w. filestore
app.use(session({
  name: 'session-id', 
  secret: '12345-67890-09876-54321',
  saveUninitialized: false,
  store: new FileStore()
}));

//passport setup
app.use(passport.initialize());//
app.use(passport.session());

// Routes setup
app.use('/', indexRouter);//
app.use('/users', usersRouter);//
app.use('/campsites', campsiteRouter);//
app.use('/promotions', promotionRouter);//
app.use('/partners', partnerRouter);//


// error handler
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});//


app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};//
  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;