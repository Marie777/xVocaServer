import { Router } from 'express';
import WordDetails from '../models/WordDetails';
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

router.post('/mockWord', async (req, res) => {

  let sentence1 = {
      sentence: "sentence1",
      user: "5a009c07c22ed764907cae95", //reference?
      countLike: 3,
      location: {lat: 50, lng: 30}
  }
  let mockWord = {
      word: "blal_1",
      translate: "translation...",
      images: ["img1", "img2"],
      sentences: [sentence1, sentence1]
  }

  const wordDetails = await WordDetails.create(mockWord);

  res.json(wordDetails);
});


export default router;
