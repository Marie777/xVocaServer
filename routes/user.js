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
    const googleId = req.body.googleId;

  //console.log(googleId);

  let newDomain = {
    domainName: req.body.domainName,
    description: req.body.description,
    mainDomain: req.body.mainDomain,
    subDomain: req.body.subDomain,
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
  res.json(req.user);
});

router.post('/mockUser', async(req, res) => {
  let user = await User.findOne({googleId: "112470571093225051385"}); 
  let word1 = {
    word: "word1",
    frequency: 5,
    weight: 6
  }
  let word2 = {
    word: "word2",
    frequency: 5,
    weight: 6
  }
  let word3 = {
    word: "word3",
    frequency: 5,
    weight: 6
  }
  let word4 = {
    word: "word4",
    frequency: 5,
    weight: 6
  }
  let category1 = {
    categoryName: "category1",
    wordList: [word1, word2, word3]
  }
  let category2 = {
    categoryName: "category2",
    wordList: [word1, word2, word4]
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
  console.log(user);
  res.json(user);
});




export default router;
