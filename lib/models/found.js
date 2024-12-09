import mongoose from 'mongoose';

const ReportSchema = new mongoose.Schema({
  ItemName: String,
  RecivedBy: String,
  ID: String,
  ContactInfo: String,
  Foundby: String,
  ref: String,
  BadgeNum: String,
  description: String,
  status: String,
  signatureImage: String, // base64 string
  photoImage: String,     // base64 string
}, { timestamps: true }, { collection: 'Found' }); // Optional: adds createdAt and updatedAt fields

export default mongoose.models.Found || mongoose.model('Found', ReportSchema);
