import mongoose from 'mongoose';

var WordDetailsSchema = mongoose.Schema({
  word: String,
  translate: String,
  images: [String],
  sentences: [{
    sentence: String,
    user: String, //reference?
    countLike: Number,
    location: {lat: Number, lng: Number}
  }]
});


var WordDetails = mongoose.model('WordDetails', WordDetailsSchema);

export default WordDetails;
