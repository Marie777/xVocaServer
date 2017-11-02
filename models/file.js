import mongoose from 'mongoose';

var fileSchema = mongoose.Schema({
  user: String, //reference?
  domain: String,
  title: String,
  type:String,
  text: String
});

var file = mongoose.model('File', fileSchema);

export default file;
