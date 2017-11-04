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

router.get('/:id', (req,res) =>{
  const id = req.params.id;
  if(mongoose.Types.ObjectId.isValid(id)){
      User.findOne({_id:id}, (err, user) =>{
        if(user) { return res.send(user);}
        else { return res.send(err); }
      });
  }
});

router.post('/', async (req, res) => {
  return User.create({userName : 'MEEEEEEEEEEEE'}, (err,user)=> {
    if(user){ return res.send(user);}
    else { return res.send(err);}
  });
});

router.post('/gog',(req,res) =>{
  return User.create({userName:'new', domains:[{domainName:'domainName', categories:[{categoryName:'categoryName'}]}]},
   (err,user)=>{return res.send(user)});
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
      let googeId = payload['sub'];

      let user = await User.findOne({ googeId }).lean();

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
