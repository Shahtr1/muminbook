import { Router } from "express";
import {
  getAllReadingsHandler,
  getReadingBySurahHandler,
  getReadingHandler,
} from "../controllers/reading.controller";

const readingRoutes = Router();

// prefix readings
readingRoutes.get("/", getAllReadingsHandler);
readingRoutes.get("/:id", getReadingHandler);
readingRoutes.get("/:collection/surah/:surahId", getReadingBySurahHandler);

export default readingRoutes;
