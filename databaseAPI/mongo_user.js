import User from '../models/user';

//find users
const findUsers = async () => {
  const users = await User.find();
  if(users){
    return users;
  }else{
    return err;
  }
};

//find user according to userId
const findUserFromId = async (userID) => {
  let user = await User.findOne({_id:userID}).lean();
  if(user) {
    return(user);
  }else{
    return(err);
  }
};


//find user according to userId
const findUserFromGoogleId = async (googleId) => {
  let user = await User.findOne({googleId}).lean();
  if(user) {
    return(user);
  } else {
    return(err);
  }
};

//Add new domain according to googleId
const updateDomainsFromGoogleId = async (body) => {
  const {googleId, domainName, description, mainDomain, subDomain} = body;
  let newDomain = {
    domainName,
    description,
    mainDomain,
    subDomain,
    categories:[]
  }
  let user = await User.findOneAndUpdate(
    {googleId},
    {$push : {domains : newDomain}},
    {safe:true, upsert:true}
  );
if(user) {
    console.log("update domain" + user);
    return(user);
  } else {
    return(err);
  }
};


//Delete domains according to googleId
const deleteDomainsFromGoogleId = async (googleId) => {
  console.log(googleId);
  let user = await User.findOneAndUpdate(
    {googleId},
    {domains : []},
    {safe:true, upsert:true}
  );
if(user) {
    console.log("delete domains" + user);
    return(user);
  } else {
    return(err);
  }
};


export {
  findUsers,
  findUserFromId,
  findUserFromGoogleId,
  deleteDomainsFromGoogleId,
  updateDomainsFromGoogleId
};
