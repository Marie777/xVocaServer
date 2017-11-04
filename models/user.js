import mongoose from 'mongoose';

const UserSchema = mongoose.Schema({
  googleId: String,
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


const User = mongoose.model('User', UserSchema);

export default User;
