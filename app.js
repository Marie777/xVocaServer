var express = require('express');
var path = require('path');
var logger = require('morgan');
var bodyParser = require('body-parser');

import index from './routes/index';
import domain from './routes/domain';
import user from './routes/user';

import mongoose from 'mongoose';

mongoose.Promise =  Promise;

mongoose.connect('mongodb://localhost/xvoca', { useMongoClient: true });

var app = express();

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use('/', index);
app.use('/domain', domain);
app.use('/user', user);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // render the error page
  res.status(err.status || 500);
  res.json({
    error: err.message
  });
});

module.exports = app;
