import { Router } from "express";
import {
  deleteWindowHandler,
  getWindowsHandler,
} from "../controllers/window.controller";

const windowRoute = Router();

// prefix windows
windowRoute.get("/", getWindowsHandler);
windowRoute.delete("/:id", deleteWindowHandler);

export default windowRoute;
