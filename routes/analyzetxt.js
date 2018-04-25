import { Router } from 'express';
import _ from 'lodash';
import {posTagging, tags} from './googleapi';

const router = Router();

const text = "The problem problem  related to evaluation of subjective subjective answers is that each student has his/her own way of answering and it is difficult to determine the degree of correctness [1]. The assessment of the correctness of an answer involves the evaluation of grammar and knowledge woven using the conceived interpretation and creativity of a human mind. Human Evaluation, though slow and carrying drawbacks of human fatigue and bias is the only accepted method 12ba3 for evaluation of text based answers, the intelligence of one human can be fathomed by another. However, with the development of communication and internet technologies, the reach and nature of education has changed with its spread across geographical, social and political boundaries with an exponential growth of intake volume. This has made the drawbacks of human evolution come out more glaring than ever before and interfere with the importance of";

//Create set of words from text and calculates their frequency
const wordFrequency = (text) => {
  //const splittxt = _.split(rowtxt.text, ' ');
  //const uniqWords = _.uniq(words);
  const words = _.words(_.toLower(text));
  const wordsNoInt = _.filter(words, (e) =>  { return !_.isInteger(_.parseInt(e)) && e.length > 1});
  const wordsCount = _.countBy(wordsNoInt);

  const wordFrequency = _.map(wordsCount, (value,key) => { return {word:key, count:value, definition:"", type:"", totalWeight:null, posCoreNLP:[], namedEntities:[]} });
  _.orderBy(wordFrequency, ['count'], ['desc']);

  return wordFrequency.reduce((accu, currItem) => {
    accu[currItem.word] = currItem;
    return accu;
  }, {});
};


//TODO: analyze text algorithm for new documents
const analyzeTextAlgo = async (text) => {
  let listWords = wordFrequency(text);

  //google pos tagging
  const partOfSpeech = await posTagging(text);
  const pos = partOfSpeech.tokens.reduce((accu, currItem) => {
    accu[currItem.text.content] = currItem.partOfSpeech;
    return accu;
  }, {});


  //wordnet:definition, typeValue

  //weight

  //order list


  return pos;

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
