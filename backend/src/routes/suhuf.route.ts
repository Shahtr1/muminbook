import { Router } from "express";
import {
  createSuhufHandler,
  getSuhufHandler,
} from "../controllers/suhuf.controller";

const suhufRoutes = Router();

// prefix suhuf
suhufRoutes.post("/", createSuhufHandler);
suhufRoutes.get("/:id", getSuhufHandler);

export default suhufRoutes;
