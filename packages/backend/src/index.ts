import 'dotenv/config';
import connectToDatabase from './config/db';

import { NODE_ENV, PORT } from './constants/env';

import app from './app';
import { log } from './utils/log';

import initDefaultRBAC from './config/init/initDefaultRBAC';
import initFamilyTree from './config/init/initFamilyTree';
import initQuran from './config/init/initQuran';
import initReadings from './config/init/initReadings';

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
  });
};

initServer().then();
