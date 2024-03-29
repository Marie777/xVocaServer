import mongoose from 'mongoose';

const WordDetailsSchema = mongoose.Schema({
  word: String,
  translate: String,
  images: [{
    url:String
  }],
  sentences: [{
    sentence: String,
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    countLike: Number,
    location: {lat: Number, lng: Number}
  }],
  wordsAPI: Object
});


const WordDetails = mongoose.model('WordDetails', WordDetailsSchema);

export default WordDetails;
