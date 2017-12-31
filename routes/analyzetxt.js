import { Router } from 'express';
import _ from 'lodash';
import CoreNLP, { Properties, Pipeline, ConnectorServer } from 'corenlp';

const router = Router();

//CoreNLP connection:
const connector = new ConnectorServer({ dsn: 'http://localhost:9000' });
const props = new Properties({
  annotators: 'tokenize,ssplit,pos,lemma,ner,parse',
});
const pipeline = new Pipeline(props, 'English', connector);


//TODO: Input text (PDF)
const rowtxt = {
  text : "The The The The The The problem problem  related to evaluation of subjective subjective subjective subjective subjective answers is that each student has his/her own way of answering and it is difficult to determine the degree of correctness [1]. The assessment of the correctness of an answer involves the evaluation of grammar and knowledge woven using the conceived interpretation and creativity of a human mind. Human Evaluation, though slow and carrying drawbacks of human fatigue and bias is the only accepted method 12ba3 for evaluation of text based answers, the intelligence of one human can be fathomed by another. However, with the development of communication and internet technologies, the reach and nature of education has changed with its spread across geographical, social and political boundaries with an exponential growth of intake volume. This has made the drawbacks of human evolution come out more glaring than ever before and interfere with the importance of"
};


//----------------------
router.get('/corenlp', async (req, res) => {

const sent = new CoreNLP.simple.Sentence('This has made the drawbacks of human evolution come out more glaring than ever before and interfere with the importance of');
pipeline.annotate(sent)
  .then(sent => {
    console.log('parse', sent.parse());
    console.log(CoreNLP.util.Tree.fromSentence(sent).dump());
    res.send(sent.words());
  })
  .catch(err => {
    res.send('err', err);
  });
});

//--------------------------------



router.get('/', async (req, res) => {

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




router.get('/watson', async (req, res) => {
  const NaturalLanguageUnderstandingV1 = require('watson-developer-cloud/natural-language-understanding/v1.js');
  const natural_language_understanding = new NaturalLanguageUnderstandingV1({
    'username': '01dcbad3-e023-4943-abea-ae990762c5c6',
    'password': '50wlIuqqetil',
    'version_date': '2017-02-27'
  });

  const parameters = {
    //'url': 'http://research.ibm.com/tjbot/?lnk=ushpv18f2&lnk2=learn',
    'text': 'IBM is an American multinational technology company headquartered in Armonk, New York, United States, with operations in over 170 countries.',
    'features': {
      'categories': {}
    }
  };

  natural_language_understanding.analyze(parameters, (err, response) => {
    if (err)
      res.send(err);
    else
      res.send(JSON.stringify(response, null, 2));
  });
    //es.send("OK");
});





router.get('/thesau', (req, res) => {
  const tcom = require('thesaurus-com');
  //res.send("ok");
  res.send(tcom.search('micro'));
});



router.get('/wordNet', (req, res) => {
  const db = require("wordnet-sqlite");
  db.get("SELECT definition FROM words WHERE word = 'eat' LIMIT 1;", (err, row) => {
    if(err)
      res.send(err);
    else
      res.send(row.definition);
  });
});



router.get('/pos', (req, res) => {

  const pos = require('pos');
  const words = new pos.Lexer().lex(rowtxt.text);
  const tagger = new pos.Tagger();
  const taggedWords = tagger.tag(words);

  res.send(taggedWords);

});

export default router;
