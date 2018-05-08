import language from '@google-cloud/language';
import Translate from '@google-cloud/translate';
import GoogleImages from 'google-images';

//url: https://cloud.google.com/natural-language/docs/reference/rest/v1/Token
const tags = {
  UNKNOWN	: 0,
  ADJ	: 0.7,
  ADP	: 0,
  ADV	: 0,
  CONJ	: 0,
  DET	: 0,
  NOUN	: 0.9,
  NUM	: 0,
  PRON	: 0,
  PRT : 0,
  PUNCT	: 0,
  VERB	: 0.8,
  X	: 0,
  AFFIX: 0
};

//url: https://cloud.google.com/natural-language/docs/reference/rest/v1/Entity#Type_1
const entityTypes = {
  UNKNOWN : 0,
  PERSON : 0,
  LOCATION : 0,
  ORGANIZATION : 0,
  EVENT : 1,
  WORK_OF_ART : 1,
  CONSUMER_GOOD : 1,
  OTHER : 1
};

const mentionTypes = {
  TYPE_UNKNOWN : 1,
  PROPER : 1,
  COMMON : 1
};

const client = new language.LanguageServiceClient();


const posTagging = async (content) => {
  // Instantiates a client
  const document = {
    content,
    type: 'PLAIN_TEXT',
  };

  return new Promise((res, rej) => {
    // Detects syntax in the document
    client
      .analyzeSyntax({document})
      .then(results => res(results[0]))
      .catch(err => rej(err));
    });

};

//TODO: pos tagging from HTML
const posTaggingHTML = async (url) => {
  // Instantiates a client
  const client = new language.LanguageServiceClient();
  const document = {
    content: url,
    type: 'HTML',
  };

  return new Promise((res, rej) => {
    // Detects syntax in the document
    client
      .analyzeSyntax({document})
      .then(results => res(results[0]))
      .catch(err => rej(err));
    });

};

const entityAnalysis = async (content) => {
  const document = {
    content,
    type: 'PLAIN_TEXT',
  };

  return new Promise((res, rej) => {
    // Detects syntax in the document
    client
      .analyzeEntities({document})
      .then(results => res(results[0]))
      .catch(err => rej(err));
    });
}



//TODO
const imgFinder = async () => {

const cred = {
  CSE_ID: '001894860492850511616:3lkm_vycs2e',
  API_KEY : 'AIzaSyAy4QWJUVcfWfru2nG33ioVUfNyzKCRXF0'
};

  const client_img = new GoogleImages(cred.CSE_ID, cred.API_KEY);

  return new Promise((res, rej) => {
    client_img.search('characterized')
        .then(images => res(images))
        .catch(err => rej(err));
    });

  // // paginate results
  // client_img.search('Steve Angello', {page: 2});
  //
  // // search for certain size
  // client_img.search('Steve Angello', {size: 'large'});

};

/*
[{
    "url": "http://steveangello.com/boss.jpg",
    "type": "image/jpeg",
    "width": 1024,
    "height": 768,
    "size": 102451,
    "thumbnail": {
        "url": "http://steveangello.com/thumbnail.jpg",
        "width": 512,
        "height": 512
    }
}]
 */




const translate = async () => {
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
};



export {posTagging, tags, entityAnalysis, entityTypes, mentionTypes, translate, imgFinder};
