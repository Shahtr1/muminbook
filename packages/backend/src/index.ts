import 'dotenv/config';
import connectToDatabase from './config/db';

import { NODE_ENV, PORT } from './constants/env';

import app from './app';
import initializeDefaultRBAC from './config/init/initializeDefaultRBAC';
import initializeFamilyTree from './config/init/initializeFamilyTree';
import initializeQuran from './config/init/initializeQuran';
import { log } from './utils/log';

const initServer = async () => {
  app.listen(Number(PORT), '0.0.0.0', async () => {
    await connectToDatabase();
    log.success(
      `Server is running on port ${PORT} in ${NODE_ENV} environment.`
    );
    await initializeDefaultRBAC();
    await initializeFamilyTree();
    await initializeQuran();
  });
};

initServer().then();
