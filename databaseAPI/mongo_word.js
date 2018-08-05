import WordDetails from '../models/wordDetails';
import unirest  from 'unirest';
import { dictOxford, dictWordsAPI } from '../Algorithm/analyzetxt';
import { imgFinder } from '../Algorithm/googleapi';
import { delay } from '../common/utils';

const rapid_API_KEY = "wH7CeXR2Jcmsh2OAIk9vgoK3JPkAp19juUdjsnVD88Ss3XXeRl";

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


//find word if not create new word details
const createFindWord = async (word) => {
  let wordFound = await WordDetails.findOne({word}).lean();
  if(wordFound === null) {
    console.log("word isn't in DB");
    return (await generateNewWord(word));
  } else {
    return (wordFound);
  }
};


//Create new word details
const createNewWord = async (word, translate, images) => {
  let newWord = {
      word,
      translate,
      images,
      sentences: []
    }
  let mongoWord = await WordDetails.create(newWord);
  if(mongoWord) {
    return mongoWord;
  } else {
    return null;
  }
};



//Create new word details
const generateNewWord = async (word) => {
  let translate = null;
  let images = (await imgFinder(word))
                  .reduce((accu, currItem) => {
                      accu.push({url : currItem.url});
                      return accu;
                    },[]);

  // let wAPIDefiniton = await wordsAPI(word);
  // return(wAPIDefiniton);

  let oxfordDefinition = await dictOxford(word).catch((error)=>{console.log(error)});
  if(oxfordDefinition){
    translate = oxfordDefinition;
  }
  return (await createNewWord(word, translate, images));

};


const wordsAPI = async (word) => {
  return new Promise((res, rej) => {
    unirest
        .get(`https://wordsapiv1.p.mashape.com/words/${word}`)
        .header("X-Mashape-Key", rapid_API_KEY)
        .header("X-Mashape-Host", "wordsapiv1.p.mashape.com")
        .end((result) => {
            if(!result.body.success){
              console.log("wordsAPI: results weren't found " + word);
              rej(null);
            }else{
              console.log("wordsAPI Found results result " + word);
              res(result);
            }
          });
        });
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
