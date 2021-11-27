var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var userLogin = require('./routes/userLogin');
var userSignup = require('./routes/userSignup');
var forgotPassword = require('./routes/forgotPassword');
var verifyCode = require('./routes/verifyCode');
var resetPassword = require('./routes/resetPassword');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/userSignup', userSignup);
app.use('/userLogin', userLogin);
app.use('/forgotPassword', forgotPassword);
app.use('/verifyCode', verifyCode);
app.use('/resetPassword', resetPassword);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500).send({ message: err.message });;
});

module.exports = app;
