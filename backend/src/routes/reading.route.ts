import { Router } from "express";
import { getReadingsHandler } from "../controllers/reading.controller";

const readingRoutes = Router();

// prefix readings
readingRoutes.get("/", getReadingsHandler);

export default readingRoutes;
