// import { Router } from 'express';
import fs from 'fs';
import watsonNLU from 'watson-developer-cloud-async/natural-language-understanding/v1.js';
import LanguageTranslatorV2 from 'watson-developer-cloud/language-translator/v2';
import DiscoveryV1 from 'watson-developer-cloud/discovery/v1';


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


//Xvoca collection:
const discoveryEnv = {
  environment_id: 'd8fbe34e-3755-420d-8aee-82a376c9f8eb',
  collection_id: '6fc8bceb-8930-4881-88aa-40695557396d'
};



//Delete document from discovery
const discoveryDelete = async (document_id) => {
  console.log("discoveryDelete");
  const parmDelete = {
    environment_id: discoveryEnv.environment_id,
    collection_id: discoveryEnv.collection_id,
    document_id
  };
  return new Promise((res,rej) => {
    discovery.deleteDocument(parmDelete, (error, data) => {
      if(error){
        console.log("discoveryDelete err");
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
  console.log("discoveryAdd");
  const file = fs.readFileSync(pathFile);
  const parmAdd = {
    environment_id: discoveryEnv.environment_id,
    collection_id: discoveryEnv.collection_id,
    file
  };
  return new Promise((res,rej) => {
    discovery.addDocument(parmAdd, (error, data) => {
      if(error){
        console.log("discoveryAdd err");
        rej(error);
      }else{
        // console.log(JSON.stringify(data, null, 2));
        res(data);
      }
    });
  });

};


//Retrieve document from discovery
const discoveryRetrieve = async () => {
  console.log("discoveryRetrieve");
  const parmRetrieve = {
    environment_id: discoveryEnv.environment_id,
    collection_id: discoveryEnv.collection_id,
    // query : "_",
    filter : {}
  };
  return new Promise((res,rej) => {
    discovery.query(parmRetrieve, (error, data) => {
      if(error){
        console.log("discoveryRetrieve err");
        rej(error);
      }else{
        // console.log(JSON.stringify(data, null, 2));
        res(data);
      }
    });
  });
};




// router.get('/category', async (req, res) => {
//   // const pdfFilePath = "./examlePDF.pdf";
//   // const inputTxt = await readPDF(pdfFilePath); // rowtxt.text; //
//   // if(inputTxt){
//
//   const text = "The problem problem  related to evaluation of subjective subjective answers is that each student has his/her own way of answering and it is difficult to determine the degree of correctness [1]. The assessment of the correctness of an answer involves the evaluation of grammar and knowledge woven using the conceived interpretation and creativity of a human mind. Human Evaluation, though slow and carrying drawbacks of human fatigue and bias is the only accepted method 12ba3 for evaluation of text based answers, the intelligence of one human can be fathomed by another. However, with the development of communication and internet technologies, the reach and nature of education has changed with its spread across geographical, social and political boundaries with an exponential growth of intake volume. This has made the drawbacks of human evolution come out more glaring than ever before and interfere with the importance of";
//
//   //  category:
//     const categoryAnalysis = await watsonCategory(text); //TODO: uncomment
//     res.send(JSON.stringify(categoryAnalysis));
//
//   // }
//
// });
//
//
//
// router.get('/translate', async (req, res) => {
//
//     // //translate:
//     const parm = {
//       text: 'A sentence must have a verb',
//       source: 'en',
//       target: 'es'
//     };
//
//     languageTranslator.translate(parm, (err, translation) =>{
//       if (err)  {
//         console.log('error:', err);
//       } else  {
//         console.log(JSON.stringify(translation, null, 2));
//       }
//     });
//
// });




export {discoveryAdd, discoveryRetrieve, discoveryDelete};
