import mongoose from 'mongoose';

var UserSchema = mongoose.Schema({
  index: {type: String, index: true, uniqe: true},
  userName: String,
  email: String,
  age: {type: Number, min: 5, max: 100},
  gender: String,
  nativeLanguage: String,
  domains:[{
    domainName: String,
    description: String,
    mainDomain: String,
    subDomain: String,
    categories:[{
      categoryName: String,
      wordList: [{
        word: String,
        frequency: Number,
        weight: Number
      }]
    }]
  }]
});


var User = mongoose.model('User', UserSchema);

export default User;
