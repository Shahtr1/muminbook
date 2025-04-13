import { Router } from "express";
import {
  deleteWindowHandler,
  getWindowsHandler,
} from "../controllers/window.controller";

const windowRoutes = Router();

// prefix windows
windowRoutes.get("/", getWindowsHandler);
windowRoutes.delete("/:id", deleteWindowHandler);

export default windowRoutes;
