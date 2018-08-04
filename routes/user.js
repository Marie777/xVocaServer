import { Router } from 'express';
import User from '../models/user';
import mongoose from 'mongoose';

const router = Router();

router.get('/allUsers',(req, res) =>{
  User.find({}, (err, users) =>{
    if(users) { return res.send(users);}
    else {return res.send(err);}
  })
});

//delete route?
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


router.post('/newDomain', async (req, res) => {
    // const googleId = req.body.googleId;
    const {googleId, domainName, description, mainDomain, subDomain} = req.body;

  let newDomain = {
    domainName,
    description,
    mainDomain,
    subDomain,
    categories:[]
  }

  //TOOD
  await User.findOneAndUpdate({googleId}, {$push : {domains : newDomain}},{safe:true, upsert:true});

  //earse domains
  //let user = await User.findOneAndUpdate({googleId}, {domains : []},{safe:true, upsert:true});

  let user = await User.findOne({googleId});
  console.log(user);
  res.json(user);

});


router.post('/tokenlogin/google', (req, res) => {
  console.log(req.user);
  res.json(req.user);
});




export default router;
