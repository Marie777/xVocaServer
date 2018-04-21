import { Router } from 'express';
import fs from 'fs';
import watsonNLU from 'watson-developer-cloud-async/natural-language-understanding/v1.js';
import LanguageTranslatorV2 from 'watson-developer-cloud/language-translator/v2';
import DiscoveryV1 from 'watson-developer-cloud/discovery/v1';

const router = Router();

//TODO: Input text (PDF)
const rowtxt = {
  text : "The problem problem  related to evaluation of subjective subjective answers is that each student has his/her own way of answering and it is difficult to determine the degree of correctness [1]. The assessment of the correctness of an answer involves the evaluation of grammar and knowledge woven using the conceived interpretation and creativity of a human mind. Human Evaluation, though slow and carrying drawbacks of human fatigue and bias is the only accepted method 12ba3 for evaluation of text based answers, the intelligence of one human can be fathomed by another. However, with the development of communication and internet technologies, the reach and nature of education has changed with its spread across geographical, social and political boundaries with an exponential growth of intake volume. This has made the drawbacks of human evolution come out more glaring than ever before and interfere with the importance of",
  text22:"based answers, the intelligence of one",
  text2: "The purpose of pharmacy compounding has traditionally been to allow a licensed pharmacist to customize a medication for an individual patient whose needs cannot be met by an FDA-approved drug. For example, a patient who is allergic to a certain dye in an FDA-approved drug may need a drug compounded without that ingredient. Similarly, a liquid-compounded drug may best meet the needs of a child or elderly patient who cannot swallow an FDA-approved tablet or capsule. Such prescription-based, individualized compounding by pharmacies continues to fill a niche that mass-produced pharmaceuticals cannot fill. "

};



//Watson credentials NLU
const natural_language_understanding = new watsonNLU({
  'username': '01dcbad3-e023-4943-abea-ae990762c5c6',
  'password': '50wlIuqqetil',
  'version_date': '2017-02-27'
});

//Watson credentials discovery
const discovery = new DiscoveryV1({
  username: '9ef092d8-2dfd-4012-b90d-60ef455e9fe1',
  password: 'ECvXf8GMV7s7',
  version_date: '2017-11-07'
});


//Watson credentials translate
const languageTranslator = new LanguageTranslatorV2({
  username: '7c816901-0f80-4235-a651-c7418b6d4dca',
  password: 'A6uvlDyIgiuX',
  url: 'https://gateway.watsonplatform.net/language-translator/api/'
});


//Watson request - NLU category
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

// const discoveryEnv = {
//   environment_id: '6b787e7f-34a4-425d-8615-78aee2d1ce6c',
//   collection_id: '5cb98f3b-f9e7-406d-92a3-8dcd3195da2d'
// };

const discoveryEnv = {
  environment_id: '6b787e7f-34a4-425d-8615-78aee2d1ce6c',
  collection_id: 'd8d7fc9e-eb7e-49d5-b5e1-c2b03f12b3a1'
};


//Delete document from discovery
const discoveryDelete = async (document_id) => {
  const parmDelete = {
    environment_id: discoveryEnv.environment_id,
    collection_id: discoveryEnv.collection_id,
    document_id
  };

  return new Promise((res,rej) => {
    discovery.deleteDocument(parmDelete, (error, data) => {
      if(error){
        // console.log(error);
        rej(error);
      }else{
        // console.log(JSON.stringify(data, null, 2));
        res(data);
      }
    });
  });
};




//Add document to discovery
const discoveryAdd = async (pathFile) => {
  const file = fs.readFileSync(pathFile);

  const parmAdd = {
    environment_id: discoveryEnv.environment_id,
    collection_id: discoveryEnv.collection_id,
    file
  };
  return new Promise((res,rej) => {
    discovery.addDocument(parmAdd, (error, data) => {
      if(error){
        console.log(err);
        rej(err);
      }else{
        console.log(JSON.stringify(data, null, 2));
        res(data);
      }
    });
  });

};


//Retrieve document from discovery
const discoveryRetrieve = async (query) => {
  const parmRetrieve = {
    environment_id: discoveryEnv.environment_id,
    collection_id: discoveryEnv.collection_id,
    query
  };

  return new Promise((res,rej) => {
    discovery.query(parmRetrieve, (error, data) => {
      if(error){
        // console.log(error);
        rej(error);
      }else{
        // console.log(JSON.stringify(data, null, 2));
        res(data);
      }
    });
  });
};





router.get('/discovery', async (req, res) => {

  const name_file = 'multi6.pdf';
  // const currentDoc = await discoveryAdd("./" + name_file);
  const infoDoc = await discoveryRetrieve(name_file);

  //TODO: --> save text to mongodb

  // res.send(await discoveryDelete(currentDoc.document_id));



});


router.get('/category', async (req, res) => {
  // const pdfFilePath = "./examlePDF.pdf";
  // const inputTxt = await readPDF(pdfFilePath); // rowtxt.text; //
  // if(inputTxt){

    category:
    const categoryAnalysis = await watsonCategory(rowtxt.text); //TODO: uncomment
    res.send(JSON.stringify(categoryAnalysis));

  // }

});



router.get('/translate', async (req, res) => {

    // //translate:
    const parm = {
      text: 'A sentence must have a verb',
      source: 'en',
      target: 'es'
    };

    languageTranslator.translate(parm, (err, translation) =>{
      if (err)  {
        console.log('error:', err);
      } else  {
        console.log(JSON.stringify(translation, null, 2));
      }
    });

});





export default router;

// const env = {
//   "environment_id": "6b787e7f-34a4-425d-8615-78aee2d1ce6c",
//   "name": "xvoca-discovery-1523972904425",
//   "description": "My environment",
//   "created": "2018-04-18T10:41:02.798Z",
//   "updated": "2018-04-18T10:41:02.798Z",
//   "status": "active",
//   "read_only": false,
//   "index_capacity": {
//     "documents": {
//       "available": 0,
//       "maximum_allowed": 2000
//     },
//     "disk_usage": {
//       "used_bytes": 0,
//       "maximum_allowed_bytes": 200000000
//     },
//     "collections": {
//       "available": 0,
//       "maximum_allowed": 0
//     }
//   },
//   "notices": [
//     {
//       "notice_id": "size_not_supported",
//       "created": "2018-04-18T10:41:02.809Z",
//       "severity": "warning",
//       "description": "The \"size\" property is no longer supported."
//     }
//   ]
// };
