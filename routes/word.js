import { Router } from 'express';
import WordDetails from '../models/wordDetails';
import mongoose from 'mongoose';
import { dictOxford } from './analyzetxt';
import { imgFinder } from './googleapi';

const router = Router();


router.get('/:word', async (req, res) => {
  const word = req.params.word;
  return res.json(await getWordDetails(word));
});


//Get word details
const getWordDetails = async (word) => {
  let wordDetails = await WordDetails.findOne({word}).lean();
  if(wordDetails === null) {
  // return res.json({});
    return (await createNewWord(word));
  } else {
    return (wordDetails);
  }
};


//Create new word details
const createNewWord = async (word) => {
  let images = (await imgFinder(word))
                  .reduce((accu, currItem) => {
                      accu.push({url : currItem.url});
                      return accu;
                    },[]);

  let oxfordDefinition = await dictOxford(word).catch((error)=>{console.log(error)});
  let translate = null;
  if(oxfordDefinition){
    translate = oxfordDefinition.results[0].lexicalEntries[0].entries[0].senses[0].definitions[0] ?
                oxfordDefinition.results[0].lexicalEntries[0].entries[0].senses[0].definitions[0] : null;
  }

  let newWord = {
      word,
      translate,
      images,
      sentences: []
  }
  return await WordDetails.create(newWord);
};



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


//Cache words
const cacheWords = async (listWords) => {
  bject.keys(listWords).forEach(word => {
    if(listWords[word].definition === null){
      getWordDetails(word);
      delay(10000);
    }
  });
};

const delay = (ms) => {
    return new Promise(function (resolve, reject) {
        setTimeout(resolve, ms);
    });
};

// router.post('/mockWord', async (req, res) => {
//
//   let sentence1 = {
//       sentence: "sentence1",
//       user: "5a009c07c22ed764907cae95",
//       countLike: 3,
//       location: {lat: 50, lng: 30}
//   }
//   let sentence2 = {
//       sentence: "sentence2",
//       user: "5a009c07c22ed764907cae95",
//       countLike: 3,
//       location: {lat: 30, lng: 30}
//   }
//   let sentence3 = {
//       sentence: "sentence3",
//       user: "5a009c07c22ed764907cae95",
//       countLike: 3,
//       location: {lat: 0, lng: 30}
//   }
//   let mockWord = {
//       word: "word1",
//       translate: "translation...",
//       images: ["img1", "img2"],
//       sentences: [sentence1, sentence2, sentence3]
//   }
//
//   const wordDetails = await WordDetails.create(mockWord);
//
//
//   res.json(wordDetails);
// });


export { createNewWord, cacheWords, getWordDetails };
export default router;
