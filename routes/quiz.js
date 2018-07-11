import { Router } from 'express';
import { createNewWord } from './word';
import { analyzeAll } from './file';
// import { dictOxford } from './analyzetxt';
import { getWordDetails } from './word';

const router = Router();

const randomNumberFunc = (size) => {
  return Math.floor((Math.random() * size) + 1);
};


router.get('/q', async(req, res) => {
  // const user = req.body.mongoId;
  // const domain = req.body.domain;
  const user = "5adda418da6ab03bd876c0f6";
  const domain = "market";

  const allWords = await analyzeAll(user, domain);
  const arrWords = Object.keys(allWords);
  const numOfWords = arrWords.length;
  const quizLength = numOfWords > 30 ? 30 : numOfWordsh;
  const wordQuizArr = {};

  let i = 0;
  while(i < 11)
  {
    let randWord = arrWords[randomNumberFunc(numOfWords)];
    let definition = allWords[randWord].definition;
    let j = 0;
    while((definition === undefined) && (j < 10))
    {
      randWord = arrWords[randomNumberFunc(numOfWords)];
      definition = allWords[randWord].definition;
      j++;
    }
    if((definition === undefined) && (j == 10))
    {
      let wordDetails = await getWordDetails(randWord);
      if(wordDetails.translate){
        wordQuizArr[randWord] = wordDetails.translate;
      }
      delay(10000);
    }
    i++;
  }

    let QnA = Object.keys(wordQuizArr).reduce((accu, key) => {
        accu.push({
          question : wordQuizArr[key],
          answer1 : key,
          answer2 : arrWords[randomNumberFunc(numOfWords)],
          answer3 : arrWords[randomNumberFunc(numOfWords)],
          answer4 : arrWords[randomNumberFunc(numOfWords)]
        });
      return accu;
    },[]);



  res.send(QnA);

  // return res.json(q);
});


//Delay func
const delay = (ms) => {
    return new Promise(function (resolve, reject) {
        setTimeout(resolve, ms);
    });
};


export default router;
