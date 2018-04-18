import { Router } from 'express';
// import _ from 'lodash';
// import fs from 'fs';
import PDFParser from 'pdf2json';
import language from '@google-cloud/language';
import Translate from '@google-cloud/translate';


const router = Router();




router.get('/googlenlp', async (req, res) => {

// Instantiates a client
const client = new language.LanguageServiceClient();

const pdfFilePath = "./examlePDF.pdf";
const inputTxt = rowtxt.text; // await readPDF(pdfFilePath);
if(inputTxt){

  const document = {
    content: inputTxt,
    type: 'PLAIN_TEXT',
  };

  // Detects syntax in the document
  client
    .analyzeSyntax({document: document})
    .then(results => {
      const syntax = results[0];
      res.send(syntax);
      //console.log('Tokens:');
      let posResults = [];
      syntax.tokens.forEach(part => {
        //console.log(`${part.partOfSpeech.tag}: ${part.text.content}`);
        posResults.push(part);
        //console.log(`Morphology:`, part.partOfSpeech);
      });
      // res.send(posResults);
    })
    .catch(err => {
      console.error('ERROR:', err);
    });

  }
});


router.get('/googletranslate', async (req, res) => {

  // Your Google Cloud Platform project ID
  const projectId = 'pragmatic-ruler-138019';

  // Instantiates a client
  const translate = new Translate({
    projectId: projectId,
  });

  // The text to translate
  const text = 'Hello, world!';
  // The target language
  const target = 'en';

  // Translates some text into Russian
  translate
    .translate(text, target)
    .then(results => {
      const translation = results[0];

      console.log(`Text: ${text}`);
      console.log(`Translation: ${translation}`);
    })
    .catch(err => {
      console.error('ERROR:', err);
    });

});




//-----------------------
router.get('/', async (req, res) => {



});



export default router;




// //CoreNLP:
// const splitSentences = _.split(inputTxt, '.');
// const promises = splitSentences.map(s => corenlpTags(s));
// const posTaging = await Promise.all(promises);
//


// const readPDF1 = async (pdfFilePath) => {
//   const text = await readPDF(pdfFilePath);
//   if(text){
//     return text;
//   }else{
//     return null;
//   }
// };


// router.get('/pdfjsn', async (req, res) => {
//   const pdfFilePath = "./abn.pdf";
//   const text = await readPDF(pdfFilePath);
//   if(text){
//     res.send({text});
//   }else{
//     res.send("not");
//   }
// });


// const readPDF = async () => {
//  let promiseResolve;
//  let promise = new Promise(resolve => promiseResolve = resolve);
//   // const pdfFilePath = "./med.pdf";
//   const pdfFilePath = "./examlePDF.pdf";
//   let pdfParser = new PDFParser(this,1);
//   // let pdfParser = new PDFParser();
//   pdfParser.on("pdfParser_dataError", errData => console.error(errData.parserError) );
//   pdfParser.on("pdfParser_dataReady", async pdfData => {
//       // fs.writeFile("./test.json", JSON.stringify(pdfData));
//       // return JSON.stringify(pdfData);
//       // fs.writeFile("./test.txt", pdfParser.getRawTextContent());
//       // console.log(pdfParser.getRawTextContent());
//       // return pdfParser.getRawTextContent();
//       promiseResolve(pdfParser.getRawTextContent());
//   });
//   pdfParser.loadPDF(pdfFilePath);
//   return promise;
// };
