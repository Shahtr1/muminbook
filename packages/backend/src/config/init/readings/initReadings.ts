import ReadingModel from '../../../models/reading/reading.model.js';
import { readingsApi } from '../../../data/readingsApi.js';
import { log } from '../../../utils/log.js';

const initReadings = async () => {
  try {
    const existing = await ReadingModel.countDocuments();
    if (existing === 0) {
      await ReadingModel.insertMany(
        readingsApi.map((item, index) => ({
          ...item,
          order: index + 1,
        }))
      );
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
