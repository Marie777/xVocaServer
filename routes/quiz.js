import { Router } from 'express';
import { createNewWord } from './word';
import { analyzeAll } from './file';

const router = Router();


router.get('/q', async (req, res) => {
  const user = req.body.mongoId;
  const domain = req.body.domain;

  const allWords = await analyzeAll(user, domain);
  let qWords = allWords.reduce((accu, currItem) => {
    let word = currItem.name;                     //What currItem look like???
    let wordDetails = await WordDetails.findOne({word}).lean();
    if(wordDetails === null) {
      wordDetails = await createNewWord(word);
    }
    accu[word] = wordDetails;
    return accu;
  },{});



  //chose random definition and 4 words as answers:
  let q = [];




  return res.json(q);
});

export default router;
