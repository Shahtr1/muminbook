import 'dotenv/config';
import connectToDatabase from './config/db';

import { NODE_ENV, PORT } from './constants/env';

import app from './app';
import { log } from './utils/log';

import initDefaultRBAC from './config/init/initDefaultRBAC';
import initFamilyTree from './config/init/initFamilyTree';
import initReadings from './config/init/readings/initReadings';
import initContentLayer from './config/init/readings/initContentLayer';
import initQuran from './config/init/readings/initQuran';

const initServer = async () => {
  app.listen(Number(PORT), '0.0.0.0', async () => {
    await connectToDatabase();
    log.success(
      `Server is running on port ${PORT} in ${NODE_ENV} environment.`
    );
    await initDefaultRBAC();
    await initFamilyTree();
    await initReadings();
    await initQuran();
    await initContentLayer({
      folder: '../data/quran',
      category: 'quran',
      source: 'uthmani',
      locale: 'ar',
    });

    await initContentLayer({
      folder: '../data/sahih-international',
      category: 'translation',
      source: 'sahih',
      locale: 'en',
      parseFootnotes: true,
    });
  });
};

initServer().then();
