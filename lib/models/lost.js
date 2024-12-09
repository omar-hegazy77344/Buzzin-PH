import mongoose from 'mongoose';

const LostSchema = new mongoose.Schema({
  ItemName: { type: String, required: true },
  location: { type: String, required: true },
  SerNum: { type: String, required: true },
  ref: { type: String, required: true },
  Foundby: { type: String, required: true },
  ID: { type: String, required: true },
  Dept: { type: String, required: true },
  description: { type: String, required: true },
  Status: { type: String, required: true },
  signatureImage: { type: String, required: true }, // Store signature as base64
  photoImage: { type: String, required: true }, // Store photo as base64
}, { 
  timestamps: true,
  collection: 'Lost' // Explicitly define the collection name
});

// Use an existing model or create a new one
export default mongoose.models.Lost || mongoose.model('Lost', LostSchema);
