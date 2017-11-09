import { Router } from 'express';
import WordDetails from '../models/wordDetails';
import mongoose from 'mongoose';

const router = Router();

router.get('/:word', async (req, res) => {
  const word = req.params.word;

  let wordDetails = await WordDetails.findOne({word}).lean();
  if(wordDetails === null) {
    return res.json({});
  } else {
    return res.json(wordDetails);
  }
});

router.post('/:word/sentence', async (req, res) => {
  const word = req.params.word;

  let newSentence = {
      sentence : req.body.sentence,
      user: req.user._id,
      countLike: 0,
      location: req.body.location
  }

  await WordDetails.findOneAndUpdate(
    {word},
    {$push : {sentences : newSentence}},
    {safe:true, upsert:true}
  );

  let newWord = await WordDetails.findOne({word})
  res.json(newWord);
});



router.post('/mockWord', async (req, res) => {

  let sentence1 = {
      sentence: "sentence1",
      user: "5a009c07c22ed764907cae95",
      countLike: 3,
      location: {lat: 50, lng: 30}
  }
  let sentence2 = {
      sentence: "sentence2",
      user: "5a009c07c22ed764907cae95",
      countLike: 3,
      location: {lat: 30, lng: 30}
  }
  let sentence3 = {
      sentence: "sentence3",
      user: "5a009c07c22ed764907cae95",
      countLike: 3,
      location: {lat: 0, lng: 30}
  }
  let mockWord = {
      word: "word1",
      translate: "translation...",
      images: ["img1", "img2"],
      sentences: [sentence1, sentence2, sentence3]
  }

  const wordDetails = await WordDetails.create(mockWord);


  res.json(wordDetails);
});


export default router;
