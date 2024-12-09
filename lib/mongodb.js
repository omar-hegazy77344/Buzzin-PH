import mongoose from 'mongoose';

// Connect to the primary database defined by MONGODB_URI
const connectMongo = async () => {
  if (mongoose.connection.readyState >= 1) {
    console.log('MongoDB already connected.');
    return mongoose.connection;
  }

  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI is not defined in the environment variables.');
  }

  try {
    console.log('Connecting to primary MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI, {
      dbName: 'Reports', // Ensure the use of the 'Reports' database
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected successfully.');
    return mongoose.connection;
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    throw new Error('Failed to connect to MongoDB.');
  }
};

export default connectMongo;
