import mongoose from 'mongoose';

var DomainSchema = mongoose.Schema({
  name: String,
  description: String,
  mainCategory: String,
  subCategory: String
});

var Domain = mongoose.model('Domain', DomainSchema);

export default Domain;
