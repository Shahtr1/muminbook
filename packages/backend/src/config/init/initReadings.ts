import ReadingModel from '../../models/reading.model';
import { readingsApi } from '../../data/readingsApi';
import { log } from '../../utils/log';

const initReadings = async () => {
  try {
    const existing = await ReadingModel.countDocuments();
    if (existing === 0) {
      await ReadingModel.insertMany(readingsApi);
      log.success('Readings initialized successfully.');
    } else {
      log.info(`Readings already initialized (${existing} entries found).`);
    }
  } catch (error) {
    log.error('Error initializing Readings :', error);
    process.exit(1);
  }
};

export default initReadings;
