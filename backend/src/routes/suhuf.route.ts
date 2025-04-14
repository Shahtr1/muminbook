import { Router } from "express";
import {
  createSuhufHandler,
  getSuhufHandler,
  renameSuhufHandler,
} from "../controllers/suhuf.controller";

const suhufRoutes = Router();

// prefix suhuf
suhufRoutes.post("/", createSuhufHandler);
suhufRoutes.get("/:id", getSuhufHandler);
suhufRoutes.patch("/:id/rename", renameSuhufHandler);

export default suhufRoutes;
