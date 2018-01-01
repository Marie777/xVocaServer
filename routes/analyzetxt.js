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
  text : "The problem problem  related to evaluation of subjective subjective answers is that each student has his/her own way of answering and it is difficult to determine the degree of correctness [1]. The assessment of the correctness of an answer involves the evaluation of grammar and knowledge woven using the conceived interpretation and creativity of a human mind. Human Evaluation, though slow and carrying drawbacks of human fatigue and bias is the only accepted method 12ba3 for evaluation of text based answers, the intelligence of one human can be fathomed by another. However, with the development of communication and internet technologies, the reach and nature of education has changed with its spread across geographical, social and political boundaries with an exponential growth of intake volume. This has made the drawbacks of human evolution come out more glaring than ever before and interfere with the importance of",
  text2: "The purpose of pharmacy compounding has traditionally been to allow a licensed pharmacist to customize a medication for an individual patient whose needs cannot be met by an FDA-approved drug. For example, a patient who is allergic to a certain dye in an FDA-approved drug may need a drug compounded without that ingredient. Similarly, a liquid-compounded drug may best meet the needs of a child or elderly patient who cannot swallow an FDA-approved tablet or capsule. Such prescription-based, individualized compounding by pharmacies continues to fill a niche that mass-produced pharmaceuticals cannot fill. "
};


//----------------------
router.get('/corenlp', async (req, res) => {

const sent = new CoreNLP.simple.Sentence(rowtxt.text2);
const resultCore = await pipeline.annotate(sent);
if(resultCore){
    //console.log('parse', sent.parse());
    //Try:
    //console.log('posTags', sent.posTags());
    //console.log('toJSON', sent.toJSON());
    //console.log('tokens', sent.tokens());
    //console.log('words', sent.words());
    //----
    //console.log(CoreNLP.util.Tree.fromSentence(sent).dump());

    const wordsTags = _.map(sent.toJSON().tokens, (value,key) => { return {word:value.word, pos:value.pos} });

    const posWords = _.groupBy(wordsTags, (t) => {return t.pos});

  const wew = _.map(posWords, (value,key) => {return {pos:key, words:_.map(value, (v,k) =>{return v.word})}});

    res.send(wew);

  }else{
    res.send('err', err);
  }
});

//--------------------------------



router.get('/', async (req, res) => {

  //const splittxt = _.split(rowtxt.text, ' ');
  //const uniqWords = _.uniq(words);

  const words = _.words(_.toLower(rowtxt.text));
  const wordsNoInt = _.filter(words, (e) =>  { return !_.isInteger(_.parseInt(e)) });
  const wordsCount = _.countBy(wordsNoInt);

  const wordFrequency = _.map(wordsCount, (value,key) => { return {word:key, count:value, category:null} });
  //--const wordsSorted = _.sortBy(mapy, (e) =>{ return e.count });
  _.orderBy(wordFrequency, ['count'], ['desc']);

  //--_.map(wordFrequency, (o) => {return o.category = 1});
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
  const wordQuery = "food";
  const db = require("wordnet-sqlite");
  // db.get("SELECT definition FROM words WHERE word = 'eat' LIMIT 1;", (err, row) => {
  db.get(`SELECT definition FROM words WHERE word = '${wordQuery}' LIMIT 1;`, (err, row) => {
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
