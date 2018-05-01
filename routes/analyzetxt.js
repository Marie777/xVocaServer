import { Router } from 'express';
import _ from 'lodash';
import wordnetSQlite from 'wordnet-sqlite';
import { posTagging, tags } from './googleapi';
import { findWord } from 'most-common-words-by-language';

const router = Router();

const text = "The problem problem related to it it evaluation of subjective subjective answers is that each student has his/her own way of answering and it is difficult to determine the degree of correctness [1]. The assessment of the correctness of an answer involves the evaluation of grammar and knowledge woven using the conceived interpretation and creativity of a human mind. Human Evaluation, though slow and carrying drawbacks of human fatigue and bias is the only accepted method 12ba3 for evaluation of text based answers, the intelligence of one human can be fathomed by another. However, ��� kostasp with the development of communication and internet technologies, the reach and nature of education has changed with its spread across geographical, social and political boundaries with an exponential growth of intake volume. This has made the drawbacks of human evolution come out more glaring than ever before and interfere with the importance of";

//Create set of words from text and calculates their frequency
const wordFrequency = (text) => {
  //const splittxt = _.split(rowtxt.text, ' ');
  //const uniqWords = _.uniq(words);
  const words = _.words(_.toLower(text));
  const wordsNoInt = _.filter(words, (e) =>  { return !_.isInteger(_.parseInt(e)) && e.length > 1 }); //&& e.indexOf('kostasp') === -1
  const wordsCount = _.countBy(wordsNoInt);

  let wordFrequency = _.map(wordsCount, (value,key) => {return {word:key, count:value}});
  _.orderBy(wordFrequency, ['count'], ['desc']);

  return wordFrequency.reduce((accu, currItem) => {
    accu[currItem.word] = currItem;
    return accu;
  }, {});
};


const wordNet = async (listWords) => {
  return new Promise((res, rej) => {
    const wordString = Object.keys(listWords).map(key => `'${key.toString()}'`).join(', ');
    const query = `SELECT * FROM words WHERE word IN (${wordString});`;
    wordnetSQlite.all(query, (err, rows) => {
      if(err){
        console.log(err);
      }else{
        rows.forEach( item => {
          if(listWords[item.word.toLowerCase()]) {
            listWords[item.word.toLowerCase()].definition = item.definition;
            listWords[item.word.toLowerCase()].type = item.type;
          }
        });
      }
      res(listWords);
    });
 });
};


//Symposium
//TODO: analyze text algorithm for new documents
const analyzeTextAlgo = async (text) => {


  let listwordFrequency = wordFrequency(text);

  //google pos tagging
  const partOfSpeech = await posTagging(text);
  let pos = partOfSpeech.tokens.reduce((accu, currItem) => {
    const word = currItem.text.content;
    const wordTag = currItem.partOfSpeech.tag;
    const isNumDetPunct = wordTag != "NUM" && wordTag != "DET" && wordTag != "X" && wordTag != "PUNCT";
    const word_Frequency = listwordFrequency[word.toLowerCase()];
    const common_eng_words = findWord(word.toLowerCase()).english;
    if( isNumDetPunct && word_Frequency){
      if(!accu[word]){
        accu[word] = {
          word,
          partOfSpeech : [],
          wordFrequencyText: word_Frequency.count,
          wordFrequencyLang: common_eng_words ? common_eng_words : -1,
          definition:"",
          type:"",
          totalWeight:null
        };
      }
      accu[word].partOfSpeech.push(currItem.partOfSpeech);
    }
    return accu;
  }, {});


  // wordnet:definition, typeValue
  let listWords = await wordNet(pos);


  //TODO: remove duplicate words not lower case
  //TODO: remove names


  //TODO: remove known Frequent words wordFrequencyLang>8000 or wordFrequencyLang==-1



  const wordNetType = {
    noun : 0.9,
    adj : 0.7,
    adv : 0.6
  };

  //Calc weight for word:
  Object.keys(listWords).forEach((key) => {
    const word = listWords[key];
    const typeValue = wordNetType[word.type] ? wordNetType[word.type] : 1;
    let posValue = 0;
    word.partOfSpeech.forEach(t => posValue += tags[t.tag] ? tags[t.tag] : 1);
    posValue /= word.partOfSpeech.length;
    const namedEntitiesValue = 0;
    listWords[key].totalWeight = posValue + typeValue; // * entities
});

// return(listWords);

  // order list
  let sortedWords = _.orderBy(listWords, ['wordFrequencyLang','totalWeight', 'wordFrequencyText'], ['desc','desc', 'desc']);

  return sortedWords;

};



router.get('/', async (req, res) => {
  try{

    res.send(await analyzeTextAlgo(text));
  }catch(error){
    res.send(error);
  }


});




//TODO: find documents according to: user, domain
const docsUserDomain = (userId, domain) => {

};





//TODO: merge analyze from all documents
const mergeAnalysis = (analysisResults) => {

};



export {analyzeTextAlgo};
export default router;
