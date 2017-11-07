import { Router } from 'express';
import WordDetails from '../models/WordDetails';
import mongoose from 'mongoose';

const router = Router();

router.get('/', async (req, res) => {
  const word = req.body.word;

  let wordDetails = await WordDetails.findOne({word}).lean();
  if(wordDetails === null) { return res.json({});}
  else { return res.json(wordDetails); }

});

router.post('/mockWord', (req, res) => {

  let sentence1 = {
      sentence: "sentence1",
      user: "user", //reference?
      countLike: 3,
      location: {lat: 50, lng: 30}
  }
  let mockWord = {
      word: "blal_1",
      translate: "translation...",
      images: ["img1", "img2"],
      sentences: [sentence1, sentence1]
  }

  WordDetails.create(mockWord, (err, w) => {
    if(w) {return res.json(w);}
    else {return res.json(err); }
  });
});


export default router;
