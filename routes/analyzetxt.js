import { Router } from 'express';
import _ from 'lodash';
import wordnetSQlite from 'wordnet-sqlite';
import SpellChecker from 'simple-spellchecker';
import Dictionary from 'oxford-dictionary-api';
import { posTagging, tags, entityAnalysis, entityTypes, mentionTypes } from './googleapi';
import fs from 'fs';

const router = Router();


const wordNetType = {
  noun : 0.9,
  adj : 0.7,
  adv : 0.6
};


//Find en-en definition of word list and type
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


//Common words in English language, ordered according to frequency
const load_common_eng_words = () => {
  const textWordEng = fs.readFileSync(`./routes/engFreq.txt`, 'utf8');
  const wordsEng = _.words(_.toLower(textWordEng));
  let i = 1;
  let freqWordsEng = wordsEng.reduce((accu, currItem) => {
    accu[currItem] = i++;
    return accu;
  },{});
  return freqWordsEng;
};


//Create set of words from text and calculates their frequency
const wordFrequency = (text) => {
  //const splittxt = _.split(rowtxt.text, ' ');
  //const uniqWords = _.uniq(words);
  const words = _.words(_.toLower(text));
  const wordsNoInt = _.filter(words, (e) =>  { return !_.isInteger(_.parseInt(e)) && e.length > 1 }); //&& e.indexOf('kostasp') === -1
  return _.countBy(wordsNoInt);

};



const entityNameAnalysis = async (text) => {
    let googleEntityResults = await entityAnalysis(text);
    return googleEntityResults.entities.reduce((accu, currItem) => {
        accu[currItem.name] = currItem;
      return accu;
    },{});
};


//TODO: Oxford dictionary
const dictOxford = async (word) => {
  const app_id = "87feefe0";
  const app_key = "43b5a8da96d1a41626562d9676f476cc";
  const dict = new Dictionary(app_id,app_key);

  return new Promise((res, rej) => {
    dict.find(word, (error, data) => {
      if(error){
        rej(error);
      }else{
        // console.log(data);
        res(data);
      };
    });
  });
};



const getDictionarySpellCheck = () => {
  return new Promise((res, rej) => {
      SpellChecker.getDictionary("en-US", "D:/xVocaBackEnd/node_modules/simple-spellchecker/dict", (error, dictionary) => {
      if(error){
        console.log("error");
        rej(error);
      }else{
        res(dictionary);
      }
    });
  });
};


router.get('/', async (req, res) => {

  // try{
  //   res.send(await dictOxford("eat"));
  // }catch(error){
  //   res.send(error);
  // }
});



//------------------------------------------
//TODO: watson category -> text.enriched_text.categories
//TODO: wikipedia if person? definition
//TODO: Oxford
//Analyze text algorithm for new documents
//--------------------------------------------
const analyzeTextAlgo = async (text) => {

  const entityWords = await entityNameAnalysis(text);
  const listwordFrequency = wordFrequency(text);
  const freq_words_eng = load_common_eng_words();

  // google pos tagging
  const partOfSpeech = await posTagging(text);
  let pos = partOfSpeech.tokens.reduce( (accu, currItem) => {
    const word = (currItem.text.content).toLowerCase();
    const wordTag = currItem.partOfSpeech.tag;
    const isNumDetPunct = wordTag != "NUM" && wordTag != "DET" && wordTag != "X" && wordTag != "PUNCT";
    const word_Frequency = listwordFrequency[word];
    const freqEng = freq_words_eng[word] ? freq_words_eng[word] : 10000;
    const isEntity = entityWords[word] ? entityTypes[entityWords[word].type] : 1;
    if( isNumDetPunct && word_Frequency && freqEng > 8000 && isEntity) {
      if(!accu[word]){
        accu[word] = {
          word,
          partOfSpeech : [],
          Entity : entityWords[word] ? entityWords[word] : 1,
          wordFrequencyText: word_Frequency,
          wordFrequencyLang: freqEng,
          definition: "",
          type: "",
          misspelledSuggestions: null,
          totalWeight:null
        };
      }
      accu[word].partOfSpeech.push(currItem.partOfSpeech);
      // console.log("-----",word, "------");
    }
    // console.log(word, "removed");
    return accu;
  }, {});


  // wordnet:definition, typeValue
  let listWords = await wordNet(pos);

  //Check spelling - if no wordnet definition:
  const dictionarySC = await getDictionarySpellCheck();
  if(dictionarySC){
    Object.keys(listWords).forEach( (word) => {
      if(listWords[word].definition === "") {
        var sp = dictionarySC.spellCheck(word);
        if(!sp){
          listWords[word].misspelledSuggestions = dictionarySC.getSuggestions(word);
          if(suggestions[0]){
          //  find definition for suggestions - oxford
          }
        }
      }
    });
  }




  //Oxford?

  //wikipedia?


  //Calc weight for word:
  // Object.keys(listWords).forEach((key) => {
  //   const word = listWords[key];
  //
  //   const typeValue = wordNetType[word.type] ? wordNetType[word.type] : 1;
  //   let posValue = 0;
  //   word.partOfSpeech.forEach(t => posValue += tags[t.tag] ? tags[t.tag] : 1);
  //   posValue /= word.partOfSpeech.length;
  //   const namedEntitiesValue = 0;
  //   listWords[key].totalWeight = posValue + typeValue; // * entities
  // });

  return(listWords);

};





export {analyzeTextAlgo, dictOxford};
export default router;
