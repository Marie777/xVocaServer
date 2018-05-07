import { Router } from 'express';
import fs from "fs";
import file from '../models/file';
import {discoveryAdd, discoveryRetrieve, discoveryDelete} from './watsonapi';
import {analyzeTextAlgo} from './analyzetxt';
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


//------------------------------------------

const fileName = "abn.pdf";
const testData = {
  __v: 0,
  user: "5adda418da6ab03bd876c0f6",
  domain: "blaaaa",
  type: "pdf"
};
//------------------------------------------------

const delay = (ms) => {
    return new Promise(function (resolve, reject) {
        setTimeout(resolve, ms);
    });
};



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


//-----------------------------------------------------------------------------------//
//-----------------------------------------------------------------------------------//
//-----------------------------------------------------------------------------------//
//-----------------------------------------------------------------------------------//

//TODO: recomended words from all files + sort words
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

//-----------------------------------------------------------------------------------//
//-----------------------------------------------------------------------------------//
//-----------------------------------------------------------------------------------//
//-----------------------------------------------------------------------------------//


router.get('/ttt', async (req, res) => {

//{_id: "5aedaf1648431f29200902e9"}
  try{

    //4 - find all results for user, domain
    // let done = await findFilesUserDomain( "5adda418da6ab03bd876c0f6", "blaaaa" );
    let done = await findAllFiles();
    res.send(done);

  }catch(error){
    res.send(error);
  };
});




//TODO: Delete pdf from watson discovery - id from request
router.get('/deletediscovery', async (req, res) => {
  console.log(document_id);        //check: document_id
  res.send();
});



//TODO: delete pdf from server
router.get('/filedelete', async (req, res) => {

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
