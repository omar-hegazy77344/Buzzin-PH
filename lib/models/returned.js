// models/returned.js
import mongoose from 'mongoose';

const ReturnedSchema = new mongoose.Schema({
  ItemName: String,
  location:String,
  SerNum:String,
  ref: String,
  Foundby: String,
  FoundbyID: String,
  description: String,
  Foundersignature: String, // base64 string
  Itemimg: String,     // base64 string
  Status: String ,
  Loston:Date,
  ReciverName:String, 
  ReciverID:String, 
  ReciverContactInfo:String, 
  Reciversignature: String, 
  ReciverImage: String, 
}, {
  timestamps: true,
  collection: 'Returned',
});

export default mongoose.models.Returned || mongoose.model('Returned', ReturnedSchema);
