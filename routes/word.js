import { Router } from 'express';
// import unirest  from 'unirest';
import {
  findWords,
  createFindWord,
  addSentenceToWord,
  removeWord,
  cleanTranslate
} from '../databaseAPI/mongo_word';

const router = Router();



// router.get('/ggg', (req, res) => {
//
//   const rapid_API_KEY = "wH7CeXR2Jcmsh2OAIk9vgoK3JPkAp19juUdjsnVD88Ss3XXeRl";
//   const word = "conversational";
//   const endpoint = "";
//   unirest.get(`https://wordsapiv1.p.mashape.com/words/${word}`)
//     .header("X-Mashape-Key", rapid_API_KEY)
//     .header("X-Mashape-Host", "wordsapiv1.p.mashape.com")
//     .end(function (result) {
//       res.send(result);
//       if(!result.body.success){console.log("not found")};
//       console.log(result.status, result.headers, result.body);
//     });
//
// });



router.get('/allwords', async (req, res) => {
  let allRecords = await findWords();
  return res.json(allRecords);
});


//Remove word
router.get('/removeWord/:word', async (req, res) => {
  const {word} = req.params;
  console.log(word);
  res.json(await removeWord(word));
});


//Only for emergency
router.get('/clearTranslate', async (req, res) => {
  let allRecords = await findWords();
  cleanTranslate(allRecords);
  return res.json("allRecords");
});


//(Android) find wordDetails for word
router.get('/:word', async (req, res) => {
  const {word} = req.params;
  return res.json(await createFindWord(word));
});

//(Android) Add new sentence
router.post('/:word/sentence', async (req, res) => {
  const {word} = req.params;
  res.json(await addSentenceToWord(word));
});



export default router;
