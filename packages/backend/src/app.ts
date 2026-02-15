import express from 'express';
import cors from 'cors';
import { APP_ORIGIN } from './constants/env.js';
import cookieParser from 'cookie-parser';
import errorHandler from './middleware/errorHandler.js';
import { OK } from './constants/http.js';
import authRoutes from './routes/auth.route.js';
import userRoutes from './routes/user.route.js';
import adminRoutes from './routes/admin.route.js';
import authenticate from './middleware/authenticate.js';
import familyTreeRoutes from './routes/family-tree.route.js';
import resourceRoutes from './routes/resource.route.js';
import './jobs/trashCleanupJob.js';
import suhufRoutes from './routes/suhuf.route.js';
import windowRoute from './routes/window.route.js';
import readingRoutes from './routes/reading.route.js';
import surahRoutes from './routes/surah.route.js';
import juzRoutes from './routes/juz.route.js';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: APP_ORIGIN,
    credentials: true,
  })
);

app.use(cookieParser());

app.get('/', (_req, res) => {
  res.status(OK).json({ status: 'healthy' });
});

app.use('/auth', authRoutes);

// admin routes
app.use('/admin', authenticate(true), adminRoutes);

// user routes
app.use('/user', authenticate(), userRoutes);
app.use('/family-tree', authenticate(), familyTreeRoutes);
app.use('/resources', authenticate(), resourceRoutes);
app.use('/windows', authenticate(), windowRoute);
app.use('/suhuf', authenticate(), suhufRoutes);
app.use('/readings', authenticate(), readingRoutes);
app.use('/surahs', authenticate(), surahRoutes);
app.use('/juz', authenticate(), juzRoutes);

app.use(errorHandler);

export default app;
