import mongoose from 'mongoose';
import { env } from './env.js';

export const connectDatabase = async (): Promise<void> => {
  await mongoose.connect(env.mongodbUri);
  console.info('Connected to MongoDB');
};

export const disconnectDatabase = async (): Promise<void> => {
  await mongoose.disconnect();
};
