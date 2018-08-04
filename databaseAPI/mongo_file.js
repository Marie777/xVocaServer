import file from '../models/file';


//mongo find files according to: user, domain
const findFilesUserDomain = async (user, domain) => {
  const fileResult = await file.find({ user, domain });
  if(fileResult){
    return fileResult;
  }else{
    return err;
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


//mongo delete all files
const dropFiles = async () => {
  const deleted = await file.collection.drop();
    if(deleted){
      return deleted;
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
const saveTxtDB = async (textData, fileName, user, domain, type) => {
  let newFile = {
    user,
    domain,
    title: fileName,
    type,
    text: textData
  };
  return(await file.create(newFile));
};

export {
  findFilesUserDomain,
  findFile,
  findAllFiles,
  setAnalyzeResults,
  saveTxtDB,
  dropFiles
};
