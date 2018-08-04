import WordDetails from '../models/wordDetails';
import { dictOxford } from '../Algorithm/analyzetxt';
import { imgFinder } from '../Algorithm/googleapi';
import { delay } from '../common/utils';

//Find words
const findWords = async () => {
  const words = await WordDetails.find();
  if(words){
    return words;
  }else{
    return err;
  }
};

//Remove word
const removeWord = async (word) => {
  const removed = await WordDetails.remove({word});
  if(removed){
    console.log("removed");
    return removed;
  }else{
    return err;
  }
};


//Create new word details
const createFindWord = async (word) => {
  let wordFound = await WordDetails.findOne({word}).lean();
  if(wordFound === null) {
    return (await generateNewWord(word));
  } else {
    return (wordFound);
  }
};


//Create new word details
const generateNewWord = async (word) => {
  let images = (await imgFinder(word))
                  .reduce((accu, currItem) => {
                      accu.push({url : currItem.url});
                      return accu;
                    },[]);

  let oxfordDefinition = await dictOxford(word).catch((error)=>{console.log(error)});
  let translate = null;
  console.log(oxfordDefinition);
  if(oxfordDefinition){
    if(oxfordDefinition.results){
      if(oxfordDefinition.results.lexicalEntries){
          if(oxfordDefinition.results.lexicalEntries){
              if(oxfordDefinition.results.lexicalEntries.entries){
                  if(oxfordDefinition.results.lexicalEntries.entries.senses){
                      if(oxfordDefinition.results.lexicalEntries.entries.senses.definitions){
                          translate = oxfordDefinition.results[0].lexicalEntries[0].entries[0].senses[0].definitions[0] ?
                              oxfordDefinition.results[0].lexicalEntries[0].entries[0].senses[0].definitions[0] : null;
    }}}}}}
  }
  let newWord = {
      word,
      translate,
      images,
      sentences: []
  }
  return await WordDetails.create(newWord);
};


//Add sentence to word
const addSentenceToWord = async (word) => {
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
  return (await WordDetails.findOne({word}));
};



const cleanTranslate = async(records) => {
  let count = 0;
  Object.keys(records).forEach(async(index) => {
    let {translate} = records[index];
    if(translate == "" || translate == null || translate==="definition not found"){
      console.log(records[index].word);
      await removeWord(records[index].word);
      count++;
    }
  });
console.log("count " +count);
};


export {
  findWords,
  createFindWord,
  addSentenceToWord,
  removeWord,
  cleanTranslate
};



//Cache words
// const cacheWords = async (listWords) => {
//   bject.keys(listWords).forEach(word => {
//     if(listWords[word].definition === null){
//       getWordDetails(word);
//       delay(10000);
//     }
//   });
// };
