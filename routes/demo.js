import { Router } from 'express';
import _ from 'lodash';
import {
  analyzeTextAlgo,
  load_common_eng_words,
  entityNameAnalysis
} from '../Algorithm/analyzetxt';
import { posTagging, tags, entityAnalysis, entityTypes } from '../Algorithm/googleapi';
import { watsonCategory } from '../Algorithm/watsonapi';
import { wordsAPI } from '../databaseAPI/mongo_word';

const router = Router();


router.get('/', async (req, res) => {

  const text = text1;
  const textAnalysisResults = await analyzeTextAlgo(text);
  const watson_category = await watsonCategory(text);

  const initWordList = _.words(_.toLower(text));
  const engFreqWords = load_common_eng_words();

  //Google
  const partOfSpeech = await posTagging(text);
  const entityWords = await entityNameAnalysis(text);


  let NumDetPunct = partOfSpeech.tokens.reduce( (accu, currItem) => {
    const word = (currItem.text.content).toLowerCase();
    const wordTag = currItem.partOfSpeech.tag;
    const isNumDetPunct = wordTag == "NUM" || wordTag == "DET" || wordTag == "X" || wordTag == "PUNCT";
    if(isNumDetPunct){
      accu.push(word);
    }
    return accu;
  }, []);


  let NameEntities = partOfSpeech.tokens.reduce( (accu, currItem) => {
    const word = (currItem.text.content).toLowerCase();
    if(entityWords[word])
    {
      if(entityWords[word].type == "UNKNOWN" || entityWords[word].type == "PERSON" || entityWords[word].type == "LOCATION" || entityWords[word].type == "ORGANIZATION"){
          accu.push(word);
      }
    }
    return accu;
  }, []);


  const numbers = initWordList.filter(w =>  _.isInteger(_.parseInt(w)) );
  const character = initWordList.filter(w =>  w.length < 2 );
  const eng_freq_words = initWordList.filter(w => { if(engFreqWords[w]){ return true } });


  let algoSteps = {
    watson_category,
    init_Word_List_01 : {
      totalWords: initWordList.length,
      wordsList : initWordList
    },
    filters : {
      number_filter: {totalWords:numbers.length, numbers},
      character_filter: {totalWords:character.length, character},
      eng_freq_words_filter : {totalWords:eng_freq_words.length, eng_freq_words},
      NumDetPunct,
      NameEntities
    },
    // partOfSpeech,
    // entityWords,
    textAnalysisResults
  }

  res.send(algoSteps);


});





router.get('/test', async (req, res) => {
  try{
    let analyzed = await analyzeTextAlgo(text);
    res.send(analyzed);
  }catch(error){
    res.send(error);
  };
});


export default router;





//market
const text_market = "Next, James we turn to the postcrash period where the actual distribution looks about lognormal again. However, Jackwerth and Rubinstein (1996) document that the risk-neutral distribution is now left-skewed and leptokurtic (more peaked). Figure 2 depicts the distributions on April 15, 1992, and is typical of the postcrash period. If we conclude that the risk-neutral distributions changed in shape around the crash and that the actual distributions (which proxy for the subjective distributions) did not, then we could conclude that the third component (risk aversion functions) changed, too, around the crash. This article sets out to empirically investigate this possibility."

//med
const text_med = "We selected 23 patients with unilateral temporal lobe epilepsy characterized by ipsilateral hippocampal sclerosis and an apparently normal contralateral hippocampus on MR imaging. Images were acquired on a 0.28 T MR scanner using a conventional Carr-Purcell Meiboom Gill sequence in all patients and in 9 healthy subjects. Texture analysis was applied to axial MR images of the first and tenth echoes. Texture analysis detects macroscopic lesions and microscopic abnormalities that can not be observed visually. The presence of texture differences in the between normal (controls) and sclerotic hippocampi was ascertained by statistical discriminant analysis. The apparently normal contralateral hippocampi can be classified into three categories in terms of texture: 4 apparently healthy, 8 similar to sclerosis, and 11 different from either healthy or sclerosis. These findings are related to a certain degree of hippocampal alteration, which further investigation"

//google's perfect team
const text_google = "Within psychology, researchers sometimes colloquially refer to traits like ‘‘conversational turn-taking’’ and ‘‘average social sensitivity’’ as aspects of what’s known as psychological safety — a group culture that the Harvard Business School professor Amy Edmondson defines as a ‘‘shared belief held by members of a team that the team is safe for interpersonal risk-taking.’’ Psychological safety is ‘‘a sense of confidence that the team will not embarrass, reject or punish someone for speaking up,’’ Edmondson wrote in a study published in 1999. ‘‘It describes a team climate characterized by interpersonal trust and mutual respect in which people are comfortable being themselves.’’ "

const text1 = "We Dan investigate the 33 risk and return of a wide variety of trading strategies involving options on the S&P 500. We consider naked and covered positions, straddles, strangles, and calendar spreads, with different maturities and levels of moneyness. Overall, we find that strategies involving short positions in options generally compensate the investor with very high Sharpe ratios, which are statistically significant even after taking into account the non-normal distribution of returns. Furthermore, we find that the strategies’ returns are substantially higher than warranted by asset pricing models. We also find that the returns of the strategies could only be justified by jump risk if the probability of market crashes were implausibly higher than it has been historically. We conclude that the returns of option strategies constitute a very good deal. However, exploiting this good deal is extremely difficult. We find that trading costs and margin requirements severely";

const text2 = "We investigate the risk and return of a wide variety of trading strategies involving options on the S&P 500. We consider naked and covered positions, straddles, strangles, and calendar spreads, with different maturities and levels of moneyness. Overall, we find that strategies involving short positions in options generally compensate the investor with very high Sharpe ratios, which are statistically significant even after taking into account the non-normal distribution of returns. Furthermore, we find that the strategies’ returns are subtantially substantially higher than warranted by asset pricing models. We also find that the returns of the strategies could only be justified by jump risk if the probability of market crashes were implausibly higher than it has been historically. We conclude that the returns of option strategies constitute a very good deal. However, exploiting this good deal is extremely difficult. We find that trading costs and margin";



  // let defi = Object.keys(textAnalysisResults).reduce(async(accu, w) => {
  //   console.log(w);
  //   try{
  //     let api = await wordsAPI(w);
  //     console.log(api);
  //     return accu[w] = api;
  //   }catch(error){
  //     return accu[w] = {};
  //   };
  //
  // }, {});
