import { Router } from 'express';
import fs from "fs";
import file from '../models/file';
import {convertToTxt, deleteFromDiscovery} from './watsonapi';
import {analyzeTextAlgo} from './analyzetxt';

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
  const infoDoc = await convertToTxt(fileName, "multi");
  const text = (await saveTxtDB(infoDoc.results[0], fileName, userData)).text.text;
  return text;
};




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




//TODO: (Android) convert pdf to text and save to mongo, according to user, domain, file_id
router.get('/convert', async (req, res) => {


});




//TODO: (Android) analyze text and save to mongo, according to user, domain, file_id
router.get('/analyze', async (req, res) => {


});





router.get('/t', async (req, res) => {

  //Create records for testing
  // const mongoRec = await saveTxtDB("infoDoc", "fileName");
  // res.send(mongoRec);
  const text = "The problem problem related to it it evaluation of subjective subjective answers is that each student has his/her own way of answering and it is difficult to determine the degree of correctness [1]. The assessment of the correctness of an answer involves the evaluation of grammar and knowledge woven using the conceived interpretation and creativity of a human mind. Human Evaluation, though slow and carrying drawbacks of human fatigue and bias is the only accepted method 12ba3 for evaluation of text based answers, the intelligence of one human can be fathomed by another. However, ��� kostasp with the development of communication and internet technologies, the reach and nature of education has changed with its spread across geographical, social and political boundaries with an exponential growth of intake volume. This has made the drawbacks of human evolution come out more glaring than ever before and interfere with the importance of";

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
    // let file_multi = await findFile( "5aeb242029720d358c7d2aff" );
    // let text_multi = file_multi.text.text;

    // let swarm_id = "5aec3f926debca1a584e2101";
    // let file_4p_swarm = await findFile( swarm_id );
    // let text_4p = file_4p_swarm[0].text.text
    // let done = await analyzeTextAlgo(text_4p);


    let done = await analyzeTextAlgo(await saveConvertpdf(fileName, testData));
    res.send(done);

    // let done = await findFilesUserDomain( testData.user, testData.domain );

    // let done = await findAllFiles();
    // res.send(done);

    // let mongo = await setAnalyzeResults(swarm_id, done );
    // res.send(mongo);
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
