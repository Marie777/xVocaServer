import { Router } from 'express';
import _ from 'lodash';
import pdfUtil from 'pdf-to-text';
import watsonNLU from 'watson-developer-cloud/natural-language-understanding/v1.js';
import thesaurus from 'thesaurus-com';
import wordnet from 'wordnet';
import wordnetSQlite from 'wordnet-sqlite';
import CoreNLP, { Properties, Pipeline, ConnectorServer } from 'corenlp';

const router = Router();

//CoreNLP connection:
const connector = new ConnectorServer({ dsn: 'http://localhost:9000' });
const props = new Properties({ annotators: 'tokenize,ssplit,pos,lemma,ner,parse'});
const pipeline = new Pipeline(props, 'English', connector);

//Watson connection
const natural_language_understanding = new watsonNLU({
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

//TODO: Input text (PDF)
const rowtxt = {
  text : "The problem problem  related to evaluation of subjective subjective answers is that each student has his/her own way of answering and it is difficult to determine the degree of correctness [1]. The assessment of the correctness of an answer involves the evaluation of grammar and knowledge woven using the conceived interpretation and creativity of a human mind. Human Evaluation, though slow and carrying drawbacks of human fatigue and bias is the only accepted method 12ba3 for evaluation of text based answers, the intelligence of one human can be fathomed by another. However, with the development of communication and internet technologies, the reach and nature of education has changed with its spread across geographical, social and political boundaries with an exponential growth of intake volume. This has made the drawbacks of human evolution come out more glaring than ever before and interfere with the importance of",
  text22:"based answers, the intelligence of one",
  text2: "The purpose of pharmacy compounding has traditionally been to allow a licensed pharmacist to customize a medication for an individual patient whose needs cannot be met by an FDA-approved drug. For example, a patient who is allergic to a certain dye in an FDA-approved drug may need a drug compounded without that ingredient. Similarly, a liquid-compounded drug may best meet the needs of a child or elderly patient who cannot swallow an FDA-approved tablet or capsule. Such prescription-based, individualized compounding by pharmacies continues to fill a niche that mass-produced pharmaceuticals cannot fill. "
};


const corenlpTags = async (text) => {
  const sent = new CoreNLP.simple.Sentence(text);
  const resultCore = await pipeline.annotate(sent);
  if(resultCore){
      const wordsTags = _.map(sent.toJSON().tokens, (value,key) => { return {word:value.word, pos:value.pos} });
      //Group words according to tags:
      const groupPOS = _.groupBy(wordsTags, (t) => {return t.pos});
      const posWords = _.map(groupPOS, (value,key) => {return {pos:key, words:_.map(value, (v,k) =>{return v.word})}});
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

  const wordFrequency = _.map(wordsCount, (value,key) => { return {word:key, count:value, definition:"",type:""} });
  //--const wordsSorted = _.sortBy(mapy, (e) =>{ return e.count });
  _.orderBy(wordFrequency, ['count'], ['desc']);

  //--_.map(wordFrequency, (o) => {return o.category = 1});
  //add field
  //_.forEach(wordFrequency, (o) => {o.subCategory = "sdf"});

  return wordFrequency;
};


//-----------------------
router.get('/', async (req, res) => {

  // const pdf_path = "examlePDF.pdf";
  // pdfUtil.pdfToText(pdf_path, (err, textFromPDF) => {
  //     if (err){
  //       throw(err);
  //     }

      //Frequent Words:
      let listWords = wordFrequency(rowtxt.text); //textFromPDF);

      //CoreNLP:
      const wordPosTags = await corenlpTags(rowtxt.text);
      _.forEach(listWords, (w) => {
        w.posCoreNLP = [];
        _.forEach(wordPosTags, (t) => {
          if(w.word == t.word){
            w.posCoreNLP.push(t.pos);
          }
        });
      });

        //WordNet - definition, type:
        const wordString = listWords.map(w => `'${w.word.toString()}'`).join(', ');
        const query = `SELECT * FROM words WHERE word IN (${wordString});`;
        wordnetSQlite.all(query, (err, rows) => {
          if(err){
            console.log(err);
          }else{
            const dict = {};
            rows.forEach(r => dict[r.word] = r);
            _.forEach(listWords, (w) => {
                w.definition = dict[w.word] && dict[w.word].definition;
                w.type = dict[w.word] && dict[w.word].type;
            });

            //Watson:
            natural_language_understanding.analyze(parameters, (err, response) => {
              if (err)
                return err;
              else{
                  _.forEach(listWords, (w) => { w.categoryWatson = response.categories});
                  res.send(listWords)
              }
            });
          }
        });


      //_.forEach(listWords, (w) => {w.definitionWordNet = thesaurus.search(w)});
      //_.forEach(listWords, (w) => {w.thesaurus = thesaurus.search(w)});
      //console.log(listWords);

  // });
});





router.get('/watson', async (req, res) => {

  natural_language_understanding.analyze(parameters, (err, response) => {
    if (err)
      res.send(err);
    else
      res.send(JSON.stringify(response, null, 2));
  });

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

const pennPOS = {
  CC	: 0,
  CD	: 0.3,
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
  RB	: 0.4,
  RBR	: 0.4,
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
