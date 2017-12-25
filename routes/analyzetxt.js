import { Router } from 'express';
import _ from 'lodash';

const router = Router();

router.get('/', async (req, res) => {

  const rowtxt = {
    text : "The The The The The The problem related to evaluation of subjective subjective subjective subjective subjective answers is that each student has his/her own way of answering and it is difficult to determine the degree of correctness [1]. The assessment of the correctness of an answer involves the evaluation of grammar and knowledge woven using the conceived interpretation and creativity of a human mind. Human Evaluation, though slow and carrying drawbacks of human fatigue and bias is the only accepted method 12ba3 for evaluation of text based answers, the intelligence of one human can be fathomed by another. However, with the development of communication and internet technologies, the reach and nature of education has changed with its spread across geographical, social and political boundaries with an exponential growth of intake volume. This has made the drawbacks of human evolution come out more glaring than ever before and interfere with the importance of"
  };
  //const splittxt = _.split(rowtxt.text, ' ');
  //const uniqWords = _.uniq(words);

  const words = _.words(_.toLower(rowtxt.text));
  const wordsNoInt = _.filter(words, (e) =>  { return !_.isInteger(_.parseInt(e)) });
  const wordsCount = _.countBy(wordsNoInt);

  const wordFrequency = _.map(wordsCount, (value,key) => { return {word:key, count:value, category:null} });
  //const wordsSorted = _.sortBy(mapy, (e) =>{ return e.count });
  _.orderBy(wordFrequency, ['count'], ['desc']);

  //_.map(wordFrequency, (o) => {return o.category = 1});
  _.forEach(wordFrequency, (o) => {o.subCategory = "sdf"});

  res.send(wordFrequency);

});

export default router;
