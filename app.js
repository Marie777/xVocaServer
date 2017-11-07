var express = require('express');
var path = require('path');
var logger = require('morgan');
var bodyParser = require('body-parser');

import index from './routes/index';
import user from './routes/user';
import word from './routes/word';
import file from './routes/file';

import mongoose from 'mongoose';

mongoose.Promise =  Promise;

mongoose.connect('mongodb://localhost/xvoca', { useMongoClient: true });

var app = express();

app.use(logger('dev'));
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({ extended: false }));

app.use('/', index);
app.use('/user', user);
app.use('/word', word);
app.use('/file', file);

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
