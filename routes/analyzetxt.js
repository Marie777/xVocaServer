import { Router } from 'express';
import _ from 'lodash';
//import pdfUtil from 'pdf-to-text';
import watsonNLU from 'watson-developer-cloud-async/natural-language-understanding/v1.js';
import thesaurus from 'thesaurus-com';
import wordnet from 'wordnet';
import wordnetSQlite from 'wordnet-sqlite';
import CoreNLP, { Properties, Pipeline, ConnectorServer } from 'corenlp';

const router = Router();


//Watson connection
const natural_language_understanding = new watsonNLU({
  'username': '01dcbad3-e023-4943-abea-ae990762c5c6',
  'password': '50wlIuqqetil',
  'version_date': '2017-02-27'
});

//Watson request
const watsonCategory = async (text) => {
  const parameters = {
    //'url': 'http://research.ibm.com/tjbot/?lnk=ushpv18f2&lnk2=learn',
    text,
    'features': {
      'categories': {}
    }
  };

  try{
      return await natural_language_understanding.analyze(parameters);
    }catch(err){
      return err;
    }
};


//CoreNLP connection:
const connector = new ConnectorServer({ dsn: 'http://localhost:9000' });
const props = new Properties({ annotators: 'tokenize,ssplit,pos,lemma,ner,parse'});
const pipeline = new Pipeline(props, 'English', connector);

//CoreNLP request
const corenlpTags = async (text) => {
  const sent = new CoreNLP.simple.Sentence(text);
  const resultCore = await pipeline.annotate(sent);
  if(resultCore){
      const wordsTags = _.map(sent.toJSON().tokens, (value,key) => { return {word:value.word, pos:value.pos} });
      return wordsTags;
    }else{
      return err;
    }
};


const wordFrequency = (text) => {
  //const splittxt = _.split(rowtxt.text, ' ');
  //const uniqWords = _.uniq(words);
  const words = _.words(_.toLower(text));
  const wordsNoInt = _.filter(words, (e) =>  { return !_.isInteger(_.parseInt(e)) });
  const wordsCount = _.countBy(wordsNoInt);

  const wordFrequency = _.map(wordsCount, (value,key) => { return {word:key, count:value, definition:"", type:"", totalWeight:null, posCoreNLP:[]} });
  _.orderBy(wordFrequency, ['count'], ['desc']);

  return wordFrequency.reduce((accu, currItem) => {
    accu[currItem.word] = currItem;
    return accu;
  }, {});
};






//TODO: Input text (PDF)
const rowtxt = {
  text : "The problem problem  related to evaluation of subjective subjective answers is that each student has his/her own way of answering and it is difficult to determine the degree of correctness [1]. The assessment of the correctness of an answer involves the evaluation of grammar and knowledge woven using the conceived interpretation and creativity of a human mind. Human Evaluation, though slow and carrying drawbacks of human fatigue and bias is the only accepted method 12ba3 for evaluation of text based answers, the intelligence of one human can be fathomed by another. However, with the development of communication and internet technologies, the reach and nature of education has changed with its spread across geographical, social and political boundaries with an exponential growth of intake volume. This has made the drawbacks of human evolution come out more glaring than ever before and interfere with the importance of",
  text22:"based answers, the intelligence of one",
  text2: "The purpose of pharmacy compounding has traditionally been to allow a licensed pharmacist to customize a medication for an individual patient whose needs cannot be met by an FDA-approved drug. For example, a patient who is allergic to a certain dye in an FDA-approved drug may need a drug compounded without that ingredient. Similarly, a liquid-compounded drug may best meet the needs of a child or elderly patient who cannot swallow an FDA-approved tablet or capsule. Such prescription-based, individualized compounding by pharmacies continues to fill a niche that mass-produced pharmaceuticals cannot fill. "

};



//-----------------------
router.get('/', async (req, res) => {

  // const pdf_path = "examlePDF.pdf";
  // pdfUtil.pdfToText(pdf_path, (err, textFromPDF) => {
  //     if (err){
  //       throw(err);
  //     }

      //Watson:
      //const categoryAnalysis = await watsonCategory(rowtxt.text); //TODO: uncomment
      //res.send(JSON.stringify(await watsonCategory(rowtxt.text)));

      //Frequent Words:
      let listWords = wordFrequency(rowtxt.text); //textFromPDF);

      //CoreNLP:
      const splitSentences = _.split(rowtxt.text, '.');
      const promises = splitSentences.map(s => corenlpTags(s));
      const posTaging = await Promise.all(promises);

      var merged = [].concat.apply([], posTaging);

      merged.forEach(item => {
        if(listWords[item.word.toLowerCase()])
          listWords[item.word.toLowerCase()].posCoreNLP.push(item.pos)
     });


       // WordNet - definition, type:
        const wordString = Object.keys(listWords).map(key => `'${key.toString()}'`).join(', ');
        const query = `SELECT * FROM words WHERE word IN (${wordString});`;
        wordnetSQlite.all(query, (err, rows) => {
          if(err){
            console.log(err);
          }else{
            rows.forEach(item => {
              if(listWords[item.word.toLowerCase()]){
              listWords[item.word.toLowerCase()].definition = item.definition;
              listWords[item.word.toLowerCase()].type = item.type;
              }
            });
          }

          Object.keys(listWords).forEach((key) => {
            const word = listWords[key];
            const typeValue = wordNetType[word.type] ? wordNetType[word.type] : 1;
            const posCoreNLPValue = pennPOS[word.posCoreNLP[0]] ? pennPOS[word.posCoreNLP[0]] : 0.1;
            listWords[key].totalWeight = posCoreNLPValue * typeValue; //divide not multiple
          });

          //orderBy
          let sortedWords = _.orderBy(listWords, ['totalWeight', 'count'], ['desc', 'desc']);
          res.send(sortedWords);

        });

      //_.forEach(listWords, (w) => {w.thesaurus = thesaurus.search(w)});
      //console.log(listWords);

  // });


});




router.get('/wordNet', async (req, res) => {
  const wordQuery = "food";
  // wordnetSQlite.get(`SELECT * FROM words WHERE word = '${wordQuery}' LIMIT 1;`, (err, row) => {
  wordnetSQlite.all(`SELECT * FROM words WHERE word IN ('food', 'eat');`, (err, row) => {
    if(err)
      res.send(err);
    else
      res.send(row);
  });
  // wordnet.lookup('eat', function(err, definitions) {
  //   definitions.forEach(function(definition) {
  //     //console.log('  words: %s', definitions.trim());
  //     res.send(definition);
  //   });
  // });
});


router.get('/pos', (req, res) => {
  const pos = require('pos');
  const words = new pos.Lexer().lex(rowtxt.text);
  const tagger = new pos.Tagger();
  const taggedWords = tagger.tag(words);
  res.send(taggedWords);
});

const wordNetType = {
  noun : 0.9,
  adj : 0.7,
  adv : 0.6
};

const pennPOS = {
  CC	: 0,
  CD	: 0.1,
  DT	: 0,
  EX	: 0,
  FW	: 0.7,
  IN	: 0,
  JJ	: 0.8,
  JJR	: 0.7,
  JJS	: 0.7,
  LS	: 0,
  MD	: 0,
  NN	: 0.9,
  NNS	: 0.8,
  NNP	: 0.8,
  NNPS : 0.8,
  PDT	: 0,
  POS	: 0,
  PRP	: 0,
  PRP$ : 0,
  RB	: 0.1,
  RBR	: 0.1,
  RBS	: 0.4,
  RP	: 0,
  SYM	: 0,
  TO	: 0,
  UH	: 0,
  VB	: 0.5,
  VBD	: 0.5,
  VBG	:0.5,
  VBN	: 0.5,
  VBP	: 0.5,
  VBZ	: 0.5,
  WDT	: 0,
  WP	: 0.2,
  WP$	: 0.2,
  WRB	: 0.4
};

export default router;
