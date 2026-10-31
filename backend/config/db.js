import mongoose from 'mongoose';

/**
 * Connect to MongoDB Atlas / Local MongoDB instance
 */
export const connectDB = async () => {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.warn(
      '⚠️  [DATABASE WARNING]: MONGODB_URI is not defined in environment variables.\n' +
      '   Please set MONGODB_URI in backend/.env to connect to MongoDB Atlas.'
    );
    return false;
  }

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });

    console.log(`✅ [MONGODB CONNECTED]: Host: ${conn.connection.host} | DB: ${conn.connection.name}`);
    return true;
  } catch (error) {
    console.error(`❌ [MONGODB CONNECTION ERROR]: ${error.message}`);
    return false;
  }
};

