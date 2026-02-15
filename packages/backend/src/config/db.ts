import mongoose from 'mongoose';
import { MONGO_URI } from '../constants/env.js';
import { log } from '../utils/log.js';

const connectToDatabase = async () => {
  try {
    log.info('Connecting to MongoDB...');

    const url =
      'mongodb://shahrukh404:hr8l0v3H%23LL%29W%29RLD@' +
      'ac-cgn430x-shard-00-00.trqespa.mongodb.net:27017,' +
      'ac-cgn430x-shard-00-01.trqespa.mongodb.net:27017,' +
      'ac-cgn430x-shard-00-02.trqespa.mongodb.net:27017/' +
      'muminbook?' +
      'replicaSet=atlas-s6g3f4-shard-0&' +
      'authSource=admin&' +
      'tls=true&' +
      'retryWrites=true&' +
      'w=majority';

    await mongoose.connect(url);

    log.success('Database connected successfully.');
  } catch (e) {
    log.error('Could not connect to Database:', e);
    process.exit(1);
  }
};

export default connectToDatabase;
