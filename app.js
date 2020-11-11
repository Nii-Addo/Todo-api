/*
 ** Call module dependencies
 */
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var logger = require('morgan');
var session = require('express-session');
var cors = require('cors');
var passport = require('passport');

/*
 ** Configs and controllers
 */
require('./config/passportConfig')(passport);

var authenticationController = require('./controllers/authenticationController');
var activityController = require('./controllers/activityController');

var app = express();

/*
 ** Use middlewares
 */
app.use(logger('dev'));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'build')));
  app.get('*', function (req, res) {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
  });
}
app.use(express.static(path.join(__dirname, 'build')));

const expiryDate = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
app.use(
  session({
    secret:
      'InAtypicalWebappIwilluseAlongerString,MaybeSomethingLike1234567890OkAmTiredNow.',
    resave: false,
    saveUninitialized: true,
    cookie: {
      secure: true,
      httpOnly: true,
      expires: expiryDate,
    },
    name: 'todo-sessionId',
  })
);
app.use(passport.initialize());
app.use(passport.session());

app.use('/flow/users', authenticationController);
app.use('/api/activities', activityController);

app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  res.status(err.status || 500);
  res.json({
    message: err.message,
    error: err,
  });
});

module.exports = app;
