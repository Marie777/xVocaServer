import { Router } from 'express';
import fs from "fs";
import file from '../models/file';
import {discoveryAdd, discoveryRetrieve, discoveryDelete} from './watsonapi';
import {analyzeTextAlgo} from './analyzetxt';
import { imgFinder } from './googleapi';
import _ from 'lodash';

const router = Router();


//mongo find files according to: user, domain
const findFilesUserDomain = async (user, domain) => {
  const fileResult = await file.find({ user, domain });
  if(fileResult){
    return fileResult;
  }else{
    return err;;
  }
};



//mongo find document according to: file_id
const findFile = async (file_id) => {
  const fileResult = await file.find({_id : file_id});
    if(fileResult){
      return fileResult;
    }else{
      return err;;
    }
};

//mongo find all files
const findAllFiles = async () => {
  const fileResult = await file.find();
    if(fileResult){
      return fileResult;
    }else{
      return err;;
    }
};

//mongo find file and set analyzed results
const setAnalyzeResults = async (file_id, analyzeResults) => {
  const updateFile = await file.findOneAndUpdate(
    {_id : file_id },
    {$set : {analyzeResults} },
    {safe:true, upsert:true}
  );
  if(updateFile){
    return updateFile;
  }else{
    return err;
  }
};



// mongo save new file
const saveTxtDB = async (textData, fileName, userData) => {

  // TODO: userId, domain, title, type -> from req body
  let newFile = {
    user: userData.user,
    domain: userData.domain,
    title: fileName,
    type: userData.type,
    text: textData
  };
  return(await file.create(newFile));
};


//Retreive all pdf's from discovery (watson discovery)
const retrieveDocs = async () => {
  const infoDoc = await discoveryRetrieve();
  return infoDoc.results.reduce((accu, currItem) => {
    accu[currItem.id] = currItem;
    return accu;
  },{});
};


//Delay func
const delay = (ms) => {
    return new Promise(function (resolve, reject) {
        setTimeout(resolve, ms);
    });
};



//(Android) Upload pdf to server
router.post('/pdf', async (req, res) => {
  const data = req.body;
  const file = data.file;
  const domain = data.domain;
  const title = data.title;

  await fs.writeFile('test.pdf', file, 'base64');

  res.json({
    data
  });
});




//TODO: (Android) according to user, domain, **DocumetnId***
// 1 - convert pdf to text (watson including category)
// 2 - save to mongo text
// 3 - analyze text
// 4 - save analysis to mongo
router.get('/analyzeFile', async (req, res) => {

  const docId = await discoveryAdd("./" + fileName);
  console.log(docId);

  let allDocs = await retrieveDocs();
  while(!allDocs[docId.document_id]){
    await delay(5000);
    allDocs = await retrieveDocs();
    console.log("waiting for watson..");
  }
  const textData = allDocs[docId.document_id];
  console.log("Found document");


  const newFileRec = await saveTxtDB(textData, fileName, testData);
  console.log("save text mongo");
  const analyzed = await analyzeTextAlgo(newFileRec.text.text);
  console.log("analyzed");
  const updateFileRec = await setAnalyzeResults(newFileRec._id, analyzed);
  console.log("save analyze mongo");

  const docDelete = await discoveryDelete(docId.document_id);
  console.log(docDelete);

  res.send(analyzed);
});



//Recomended words from all files
//TODO: sort words
router.get('/analyzeAll', async (req, res) => {

  const allResultsFiles = await findAllFiles(); // TODO replace with specific user, domain
  // let merged_word_arr = [];
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


  console.log(Object.keys(wordsDomain).length);
  res.send(wordsDomain);


  // order list
  // let sortedWords = _.orderBy(listWords, ['totalWeight', 'wordFrequencyText'], ['desc', 'desc']);
  //
  // return sortedWords;

});




//----------------TESTING--------------------------

const fileName = "riskmarket_19p.pdf";
const testData = {
  __v: 0,
  user: "5adda418da6ab03bd876c0f6",
  domain: "market",
  type: "pdf"
};
//------------------------------------------------


router.get('/ttt', async (req, res) => {

//{_id: "5aedaf1648431f29200902e9"}
  try{

    //4 - find all results for user, domain
    // let done = await findFilesUserDomain( "5adda418da6ab03bd876c0f6", "blaaaa" );


    // res.send(await findAllFiles());


    // // const pdf = await findFile("5af06ec9e1676e320c48ccc4"); //team
    // // const pdf = await findFile("5aee0e3e2c99410728a4ad74"); //med
    // // const pdf = await findFile("5aee0e0f3485383b8c9b5c53"); //4p.pdf
    // // const text = pdf[0].text.text;
    //
    //market
    // const text = "Next, we turn to the postcrash period where the actual distribution looks about lognormal again. However, Jackwerth and Rubinstein (1996) document that the risk-neutral distribution is now left-skewed and leptokurtic (more peaked). Figure 2 depicts the distributions on April 15, 1992, and is typical of the postcrash period. If we conclude that the risk-neutral distributions changed in shape around the crash and that the actual distributions (which proxy for the subjective distributions) did not, then we could conclude that the third component (risk aversion functions) changed, too, around the crash. This article sets out to empirically investigate this possibility."

    //med
    // const text = "We selected 23 patients with unilateral temporal lobe epilepsy characterized by ipsilateral hippocampal sclerosis and an apparently normal contralateral hippocampus on MR imaging. Images were acquired on a 0.28 T MR scanner using a conventional Carr-Purcell Meiboom Gill sequence in all patients and in 9 healthy subjects. Texture analysis was applied to axial MR images of the first and tenth echoes. Texture analysis detects macroscopic lesions and microscopic abnormalities that can not be observed visually. The presence of texture differences in the between normal (controls) and sclerotic hippocampi was ascertained by statistical discriminant analysis. The apparently normal contralateral hippocampi can be classified into three categories in terms of texture: 4 apparently healthy, 8 similar to sclerosis, and 11 different from either healthy or sclerosis. These findings are related to a certain degree of hippocampal alteration, which further investigation"

    //google's perfect team
    // const text = "Within psychology, researchers sometimes colloquially refer to traits like ‘‘conversational turn-taking’’ and ‘‘average social sensitivity’’ as aspects of what’s known as psychological safety — a group culture that the Harvard Business School professor Amy Edmondson defines as a ‘‘shared belief held by members of a team that the team is safe for interpersonal risk-taking.’’ Psychological safety is ‘‘a sense of confidence that the team will not embarrass, reject or punish someone for speaking up,’’ Edmondson wrote in a study published in 1999. ‘‘It describes a team climate characterized by interpersonal trust and mutual respect in which people are comfortable being themselves.’’ "

    // const text = "We investigate the risk and return of a wide variety of trading strategies involving options on the S&P 500. We consider naked and covered positions, straddles, strangles, and calendar spreads, with different maturities and levels of moneyness. Overall, we find that strategies involving short positions in options generally compensate the investor with very high Sharpe ratios, which are statistically significant even after taking into account the non-normal distribution of returns. Furthermore, we find that the strategies’ returns are substantially higher than warranted by asset pricing models. We also find that the returns of the strategies could only be justified by jump risk if the probability of market crashes were implausibly higher than it has been historically. We conclude that the returns of option strategies constitute a very good deal. However, exploiting this good deal is extremely difficult. We find that trading costs and margin requirements severely";
    //
    // const analyzed = await analyzeTextAlgo(text);
    //
    // res.send(analyzed);

    
    res.send(await imgFinder());

  }catch(error){
    res.send(error);
  };
});




//TODO: delete pdf from server
router.get('/delete', async (req, res) => {

  try {
    // fs.unlinkSync('./' + fileName);
    fs.unlinkSync('./' + "med2");
    console.log('successfully deleted med2');
    // console.log('successfully deleted', fileName);
  } catch (err) {
    // handle the error
  }

  res.send("deleted");
});


export default router;


// done[0].analyzeResults.reduce((accu, currItem) => {
//
//     accu[currItem.name] = currItem;
//   return accu;
// },{});
//
// done.forEach((f) => {
//   if(f.analyzeResults){
//
//   };
// });
