import logger from 'morgan';
import bodyParser from 'body-parser';
import express from 'express';
import path from 'path';
import mongoose from 'mongoose';
import { google_client_id } from './config';
import GoogleAuth from 'google-auth-library';

import index from './routes/index';
import user from './routes/user';
import word from './routes/word';
import file from './routes/file';
import quiz from './routes/quiz';
import demo from './routes/demo';

import User from './models/user';


mongoose.Promise =  Promise;
mongoose.connect('mongodb://localhost/xvoca', { useMongoClient: true });

var app = express();

app.use(logger('dev'));
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({ extended: false }));


//-------------------Google's AOuth------------------------------------//
app.use((req, res, next) => {
  const google_token = req.headers.authorization;

  if(!google_token) {
    return res.json({error: "No Authorization header"}).status(403);
  }

  let auth = new GoogleAuth();
  let client = new auth.OAuth2(google_client_id, '', '');
  client.verifyIdToken(google_token, google_client_id, async (e, login) => {
    if(e) {
      res.json({error: "Auth failed"}).status(400);
    } else {
      let payload = login.getPayload();
      let googleId = payload['sub'];

      let user = await User.findOne({ googleId }).lean();

      if(user === null) {
        user = await User.create({
          googleId: payload['sub'],
          userName: payload['name'],
          email: payload['email'],
        });
      }

      req.user = user;
      next();
    }
  });

});
//-------------------------------------------------------//

app.use('/', index);
app.use('/user', user);
app.use('/word', word);
app.use('/file', file);
app.use('/quiz', quiz);
app.use('/demo', demo);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // render the error page
  console.log(err);
  res.status(err.status || 500);
  res.json({
    error: err.message,
    file: "app.js"
  });
});

module.exports = app;
