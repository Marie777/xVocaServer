import mongoose from 'mongoose';

const WordDetailsSchema = mongoose.Schema({
  word: String,
  translate: String,
  images: [String],
  sentences: [{
    sentence: String,
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    countLike: Number,
    location: {lat: Number, lng: Number}
  }]
});


const WordDetails = mongoose.model('WordDetails', WordDetailsSchema);

export default WordDetails;
