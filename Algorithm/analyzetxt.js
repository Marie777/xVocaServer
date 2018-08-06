import _ from 'lodash';
import path from 'path';
import wordnetSQlite from 'wordnet-sqlite';
import SpellChecker from 'simple-spellchecker';
import Dictionary from 'oxford-dictionary-api';
import unirest  from 'unirest';
import { posTagging, tags, entityAnalysis, entityTypes } from './googleapi';
import {discoveryAdd, discoveryDelete, retrieveDocs} from '../Algorithm/watsonapi';
import {findFilesUserDomain, setAnalyzeResults, saveTxtDB} from '../databaseAPI/mongo_file';
import { delay } from '../common/utils';

import fs from 'fs';



const file_name = 'test.pdf';
const filePath = path.join(__dirname, "../pdf_upload/");

const wordNetType = {
  noun : 0.9,
  adj : 0.7,
  adv : 0.6
};


//Recomended words from all files
//TODO: sort words
const analyzeAll = async (user,domain) => {
  // const allResultsFiles = await findAllFiles();
  const allResultsFiles = await findFilesUserDomain(user,domain);

  let wordsDomain = {};
  allResultsFiles.forEach(f => {
    if(f.analyzeResults){
      Object
        .keys(f.analyzeResults)
        .map( (k) => {
          if(!wordsDomain[k])
            wordsDomain[k] = [];
          wordsDomain[k].push(f.analyzeResults[k])
        }, {});
    }
  });

  console.log("total number of words: " + Object.keys(wordsDomain).length);
  return(wordsDomain);

  // order list
  // let sortedWords = _.orderBy(listWords, ['totalWeight', 'wordFrequencyText'], ['desc', 'desc']);
  //
  // return sortedWords;
};



//Analyze algo
// 1 - convert pdf to text (watson including category)
// 2 - save to mongo text
// 3 - analyze text
// 4 - save analysis to mongo
const analyzeFile = async (file_name, user, domain, type) => {
  const docId = await discoveryAdd(filePath + file_name);
  console.log(docId);

  let allDocs = await retrieveDocs();
  while(!allDocs[docId.document_id]){
    await delay(5000);
    allDocs = await retrieveDocs();
    console.log("waiting for watson..");
  }
  const textData = allDocs[docId.document_id];
  console.log("Found document");

  const newFileRec = await saveTxtDB(textData, file_name, user, domain, type);
  console.log("save text mongo");

  const analyzed = await analyzeTextAlgo((newFileRec.text.text).split("References", 1));
  // const analyzed = await analyzeTextAlgo(newFileRec.text.text);
  console.log("analyzed");

  const updateFileRec = await setAnalyzeResults(newFileRec._id, analyzed);
  console.log("save analyze mongo");

  const docDelete = await discoveryDelete(docId.document_id);
  console.log(docDelete);

  return analyzed;
};



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
    const salience = entityWords[word] ? entityWords[word].salience : 0;
    if( isNumDetPunct && word_Frequency && freqEng > 8000 && isEntity) {
      if(!accu[word]){
        accu[word] = {
          word,
          partOfSpeech : [],
          Entity : entityWords[word] ? entityWords[word] : 1,
          salience,
          wordFrequencyText: word_Frequency,
          wordFrequencyTextPrecent: null,
          wordFrequencyLang: freqEng,
          definition: "",
          type: "",
          totalWeight:null
        };
      }
      accu[word].partOfSpeech.push(currItem.partOfSpeech.tag);
      // console.log("-----",word, "------");
    }
    // console.log(word, "removed");
    return accu;
  }, {});


  // wordnet:definition, typeValue
  let listWords = await wordNet(pos);

  //WordsAPI
  // let def = Object.keys(listWords).reduce( async(accu, w) => {
  //   console.log("----------"+w);
  //   resultWordsAPI = await dictWordsAPI(w);
  //   if(resultWordsAPI){
  //     accu[w] = resultWordsAPI;
  //   }else{
  //     accu[w] = null;
  //   }
  //   return accu;
  // }, {});
  //
  // return(def);



  //Calc weight for word:
  Object.keys(listWords).forEach(async(key) => {
    const word = listWords[key];
    // console.log(word);
    const typeValue = wordNetType[word.type] ? wordNetType[word.type] : 1;
    let posValue = 0;
    word.partOfSpeech.forEach(t => posValue += tags[t] ? tags[t] : 1);
    posValue /= word.partOfSpeech.length;
    const namedEntitiesValue = 0;
    listWords[key].wordFrequencyTextPrecent = listWords[key].wordFrequencyText/Object.keys(listWords).length*100;
    listWords[key].totalWeight = posValue * typeValue * listWords[key].wordFrequencyTextPrecent/100;
  });

  return(listWords);
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
  // console.log(engFreqPath);
  const engFreqFile = `engFreq.txt`;
  const engFreqPath = path.join(__dirname, "./", engFreqFile);

  const textWordEng = fs.readFileSync(engFreqPath, 'utf8');
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


//Oxford dictionary
const dictOxford = async (word) => {
  const app_id = "87feefe0";
  const app_key = "43b5a8da96d1a41626562d9676f476cc";
  const dict = new Dictionary(app_id,app_key);

  return new Promise((res, rej) => {
    dict.find(word, (error, data) => {
      if(data){
          if(data.results){
            if(data.results[0].lexicalEntries[0]){
                if(data.results[0].lexicalEntries[0].entries[0]){
                        if(data.results[0].lexicalEntries[0].entries[0].senses){
                          if(data.results[0].lexicalEntries[0].entries[0].senses.definitions){
                            if(data.results[0].lexicalEntries[0].entries[0].senses.definitions[0]){
                            const oxfDefinitions = data.results[0].lexicalEntries[0].entries[0].senses.definitions[0];
                                res( oxfDefinitions ? oxfDefinitions : null );
          }}}}}}}else{
            console.log("--error dictOxford---"+error);
            rej(error);
          }
    });
  });
};


//WordsAPI dictionary
const dictWordsAPI = async (word) => {
  const rapid_API_KEY = "wH7CeXR2Jcmsh2OAIk9vgoK3JPkAp19juUdjsnVD88Ss3XXeRl";

  return new Promise((res, rej) => {
    // console.log(word);
    unirest.get(`https://wordsapiv1.p.mashape.com/words/${word}`)
      .header("X-Mashape-Key", rapid_API_KEY)
      .header("X-Mashape-Host", "wordsapiv1.p.mashape.com")
      .end((result) =>{
        if(!result.body.success){
          // console.log(word + "   wordsAPI: definition not found");
          rej(null);
        }else{
          // console.log(result)
          res(result);
        }
        // console.log(result.status, result.headers, result.body);
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



export {
  analyzeTextAlgo,
  dictOxford,
  analyzeFile,
  analyzeAll,
  dictWordsAPI,
  load_common_eng_words,
  entityNameAnalysis
};
