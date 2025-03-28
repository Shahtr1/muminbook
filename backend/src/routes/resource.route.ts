import { Router } from "express";
import {
  createResourceHandler,
  deleteResourceHandler,
  emptyTrashHandler,
  getResourceHandler,
  getTrashedResourcesHandler,
  moveToTrashResourceHandler,
  renameResourceHandler,
  restoreResourceHandler,
} from "../controllers/resource.controller";

const resourceRoutes = Router();

// prefix resources
resourceRoutes.get("/", getResourceHandler);
resourceRoutes.post("/", createResourceHandler);

resourceRoutes.get("/trash", getTrashedResourcesHandler);
resourceRoutes.delete("/trash", emptyTrashHandler);

resourceRoutes.delete("/:id", deleteResourceHandler);
resourceRoutes.patch("/:id/trash", moveToTrashResourceHandler);
resourceRoutes.patch("/:id/restore", restoreResourceHandler);
resourceRoutes.patch("/:id/rename", renameResourceHandler);

export default resourceRoutes;
