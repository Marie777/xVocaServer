import language from '@google-cloud/language';
import Translate from '@google-cloud/translate';

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



export {posTagging, tags, entityAnalysis, translate};
