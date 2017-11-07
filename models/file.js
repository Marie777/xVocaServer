import mongoose from 'mongoose';

const fileSchema = mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  domain: String,
  title: String,
  type: String,
  text: String
});

const file = mongoose.model('File', fileSchema);

export default file;
