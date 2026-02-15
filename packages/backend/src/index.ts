// VERY IMPORTANT: load env first
import './config/loadEnv.js';

import connectToDatabase from './config/db.js';
import { NODE_ENV, PORT } from './constants/env.js';
import app from './app.js';
import { log } from './utils/log.js';

import initDefaultRBAC from './config/init/initDefaultRBAC.js';
import initFamilyTree from './config/init/initFamilyTree.js';
import initReadings from './config/init/readings/initReadings.js';
import initContentLayer from './config/init/readings/initContentLayer.js';
import initQuran from './config/init/readings/initQuran.js';

const initServer = async () => {
  await connectToDatabase();

  app.listen(Number(PORT), '0.0.0.0', async () => {
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

initServer();
