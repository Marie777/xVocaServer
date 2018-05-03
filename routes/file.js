import { Router } from 'express';
import fs from "fs";
import file from '../models/file';
import {convertToTxt, deleteFromDiscovery} from './watsonapi';
import {analyzeTextAlgo} from './analyzetxt';

const router = Router();


//Upload pdf to server
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
const saveTxtDB = async (infoDoc, fileName, userData) => {

  // TODO: userId, domain, title, type -> from req body
  let newFile = {
    user: userData.user,
    domain: userData.domain,
    title: fileName,
    type: "doc",
    text: infoDoc
  };
  return(await file.create(newFile));
};


//Convert pdf to text (watson discovery)
const saveConvertpdf = async (fileName, userData) => {

  const infoDoc = await convertToTxt(fileName);
  const text = (await saveTxtDB(infoDoc.results[0], fileName, userData)).text.text;
  return text;
};





router.get('/test', async (req, res) => {

  //Create records for testing
  // const mongoRec = await saveTxtDB("infoDoc", "fileName");
  // res.send(mongoRec);

  const fileName = "multi6.pdf";
  const testData = {
    __v: 0,
    user: "5adda418da6ab03bd876c0f6",
    domain: "blaaaa",
    title: "fileName",
    type: "doc",
    text: "infoDoc",
    _id: "5aeb1bfa251dee2a687a25a3"
  };

  try{

    let done = await analyzeTextAlgo(await saveConvertpdf(fileName, testData));

    // let done = await findFilesUserDomain( testData.user, testData.domain );
    // let done = await findAllFiles( );
    // let done = await findFile( testData._id );
    // let done = await setAnalyzeResults(testData._id, {results : "resultssss"} );
    res.send(done);
  }catch(error){
    res.send(error);
  };
});




//TODO: Delete pdf from watson discovery - id from request
router.get('/deletediscovery', async (req, res) => {
  res.send(await deleteFromDiscovery("211a26f9-5ad4-4c85-b8de-6822aa6fb346"));
});



//TODO: delete pdf from server
router.get('/filedelete', async (req, res) => {

  res.send("deleted");
});


export default router;
