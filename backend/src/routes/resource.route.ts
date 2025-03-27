import { Router } from "express";
import {
  createResourceHandler,
  deleteResourceHandler,
  getResourceHandler,
  moveToTrashResourceHandler,
} from "../controllers/resource.controller";

const resourceRoutes = Router();

// prefix resources
resourceRoutes.get("/", getResourceHandler);
resourceRoutes.post("/", createResourceHandler);
resourceRoutes.delete("/:id", deleteResourceHandler);
resourceRoutes.patch("/:id/trash", moveToTrashResourceHandler);

export default resourceRoutes;
