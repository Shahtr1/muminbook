import 'dotenv/config';
import connectToDatabase from './config/db';

import { NODE_ENV, PORT } from './constants/env';

import app from './app';
import { log } from './utils/log';

import initDefaultRBAC from './config/init/initDefaultRBAC';
import initFamilyTree from './config/init/initFamilyTree';
import initQuran from './config/init/readings/initQuran';
import initReadings from './config/init/readings/initReadings';
import initSahihI11l from './config/init/readings/initSahihI11l';

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
    await initSahihI11l();
  });
};

initServer().then();
