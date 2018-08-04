import { Router } from 'express';
import {
  findWords,
  createFindWord,
  addSentenceToWord,
  removeWord,
  cleanTranslate
} from '../databaseAPI/mongo_word';

const router = Router();


router.get('/allwords', async (req, res) => {
  let allRecords = await findWords();
  return res.json(allRecords);
});


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



router.get('/:word', async (req, res) => {
  const {word} = req.params;
  return res.json(await createFindWord(word));
});


router.post('/:word/sentence', async (req, res) => {
  const {word} = req.params;
  res.json(await addSentenceToWord(word));
});





// export { createNewWord, cacheWords, getWordDetails };
export default router;
