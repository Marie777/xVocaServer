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

router.post('/mockUser', async(req, res) => {
  let user = await User.findOne({googleId: "112470571093225051385"});
  let word1 = {
    word: "blal_1",
    frequency: 5,
    weight: 6
  }
  let word2 = {
    word: "blal_2",
    frequency: 5,
    weight: 6
  }
  let category1 = {
    categoryName: "category1",
    wordList: [word1, word1, word1]
  }
  let category2 = {
    categoryName: "category2",
    wordList: [word2, word2, word2]
  }
  let domain = {
    domainName: "domain1",
    description: "description1",
    mainDomain: "mainDomain1",
    subDomain: "subDomain1",
    categories:[category1, category1]
  }
  let domainn = {
    domainName: "domain2",
    description: "description2",
    mainDomain: "mainDomain2",
    subDomain: "subDomain2",
    categories:[category2, category2]
  }
  user.domains = [domain, domainn];
  await user.save();
  res.json( user);
});


router.post('/tokenlogin/google', (req, res) => {
  res.json(req.user);
});


export default router;