import { Router } from 'express';
import User from '../models/user';
import mongoose from 'mongoose';
import { google_client_id } from '../config';
import GoogleAuth from 'google-auth-library';

const router = Router();

router.get('/allUsers',(req, res) =>{
  User.find({}, (err, users) =>{
    if(users) { return res.send(users);}
    else {return res.send(err);}
  })
});

router.get('/:id', async (req,res) =>{
  const id = req.params.id;

  let user = await User.findOne({_id:id}).lean();
  if(user) { return res.json(user);}
  else { return res.json(err); }

});

router.get('/googleId', async (req,res) =>{
  const googleId = req.body.googleId;

  let user = await User.findOne({googleId}).lean();
  if(user) { return res.json(user);}
  else { return res.json(err); }

});

router.post('/tokenlogin/google', (req, res) => {
  const google_token = req.body.token;
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

      res.json(user);

    }
  });
});


export default router;
