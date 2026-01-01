import mongoose from 'mongoose';
import { MONGO_URI } from '../constants/env';
import { log } from '../utils/log';

const connectToDatabase = async () => {
  try {
    log.info('Connecting to MongoDB...');

    await mongoose.connect(MONGO_URI);

    log.success('Database connected successfully.');
  } catch (e) {
    log.error('Could not connect to Database:', e);
    process.exit(1);
  }
};

export default connectToDatabase;
