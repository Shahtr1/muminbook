import "dotenv/config";
import connectToDatabase from "./config/db";

import { NODE_ENV, PORT } from "./constants/env";

import app from "./app";
import initializeDefaultRBAC from "./config/initializeDefaultRBAC";
import initializeFamilyTree from "./config/initializeFamilyTree";

const initServer = async () => {
  app.listen(Number(PORT), "0.0.0.0", async () => {
    await connectToDatabase();
    console.log(
      `Server is running on port ${PORT} in ${NODE_ENV} environment.`,
    );
    await initializeDefaultRBAC();
    await initializeFamilyTree();
  });
};

initServer().then();
