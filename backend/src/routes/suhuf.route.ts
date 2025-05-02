import { Router } from "express";
import {
  createSuhufHandler,
  getSuhufHandler,
  layoutSuhufHandler,
  renameSuhufHandler,
} from "../controllers/suhuf.controller";

const suhufRoutes = Router();

// prefix suhuf
suhufRoutes.post("/", createSuhufHandler);
suhufRoutes.get("/:id", getSuhufHandler);
suhufRoutes.patch("/:id/rename", renameSuhufHandler);
suhufRoutes.patch("/:id/layout", layoutSuhufHandler);

export default suhufRoutes;
