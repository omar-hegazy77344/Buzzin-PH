import mongoose from 'mongoose';

const FoodSchema = new mongoose.Schema({
  Name: { type: String, required: true },
  Unit: { type: String, required: true },
  ContactInfo: { type: String, required: false },
  signatureImage: { type: String, required: true }, // Store signature as base64
  photoImage: { type: String, required: false }, // Store photo as base64
  Status: { type: String, required: true },
}, { 
  timestamps: true,
  collection: 'Food' // Explicitly define the collection name
});

// Use an existing model or create a new one
export default mongoose.models.Food || mongoose.model('Food', FoodSchema);
