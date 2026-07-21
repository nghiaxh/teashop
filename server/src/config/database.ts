import mongoose from 'mongoose';

const connectDB = async (): Promise<void> => {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/teashop';
  await mongoose.connect(uri);
  console.log('Connected to MongoDB');
};

export default connectDB;
