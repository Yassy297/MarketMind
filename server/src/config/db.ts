import mongoose from 'mongoose';
import { env } from '@/config/env';

export const connectDB = async () => {
  if (!env.mongoUri) {
    throw new Error('MONGO_URI is not defined');
  }

  if (mongoose.connection.readyState >= 1) {
    return mongoose.connection;
  }

  return mongoose.connect(env.mongoUri);
};
