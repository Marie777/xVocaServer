import { Router } from 'express';
import fs from "fs";
import path from "path";
import {analyzeTextAlgo, analyzeFile, analyzeAll} from '../Algorithm/analyzetxt';
import { quizGenerator } from '../Algorithm/quiz';
import { findAllFiles, dropFiles} from '../databaseAPI/mongo_file';
import { delay } from '../common/utils';

const router = Router();

const file_name = 'test.pdf';
const filePath = path.join(__dirname, "../pdf_upload/");


//Find all files from DB
router.get('/allFiles', async(req, res) =>{
  res.send( await findAllFiles());
});


//Drop all files from DB
router.get('/dropFiles', async(req, res) =>{
  res.send( await dropFiles());
});


//Delete pdf from server
router.get('/delete', async (req, res) => {
  try {
    fs.unlinkSync(filePath+file_name);
  } catch (err) {
    // handle the error
  }
  res.send("File deleted successfully");
});


//(Android) Upload pdf to server
router.post('/pdf', async (req, res) => {
  const data = req.body;
  const user = data.mongoId;
  const domain = data.domain;

  await fs.writeFile(filePath+file_name, data.file, 'base64', (error) => {
    if(error) {
      console.log(error);
    }else {
      console.log("successfully");
    }
  });
  console.log("done upload");

  let isExist = false;
  while(!isExist){
      fs.stat(filePath+file_name, (err, stat) => {
        if(err == null) {
            console.log('File exists');
            isExist = true;
        } else if(err.code == 'ENOENT') { // file does not exist
            console.log('File not exists');
        } else {
            console.log('Some other error: ', err.code);
        }
    });
    await delay(10000);
  }

  await analyzeFile(file_name, user, domain, "pdf");
  res.send("Analyze file successfully");
});



//(Android) Recommended words from all files in the domain and user
router.post('/analyzeAlgo', async (req, res) => {                    //test: change to GET
  const user = req.body.mongoId;
  const domain = req.body.domain;

  //All recommended_words for the domain
  const allWords = await analyzeAll(user, domain);

   let results = Object.keys(allWords).reduce((accu, key) => {
      const curr = allWords[key];
      let word = {
        word: key,
        frequency: curr[0].wordFrequencyText,
        weight: curr[0].totalWeight
      };
      accu.push(word);
    return accu;
  },[]);
  let recommended_category = {
    categoryName: "recommended_words",
    wordList: results
  };
  res.send(recommended_category);
});










//----------------TESTING--------------------------
// const user ="5a40cfbdffae2033702d3e66";
// const domain ="smarthome";
// console.log(user);
// console.log(domain);


// const fileName = "riskmarket_19p.pdf";
// const testData = {
//   __v: 0,
//   user: "5adda418da6ab03bd876c0f6",
//   domain: "market",
//   type: "pdf"
// };
//------------------------------------------------











export default router;
