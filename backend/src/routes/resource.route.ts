import { Router } from "express";
import {
  copyResourceHandler,
  createResourceHandler,
  deleteResourceHandler,
  emptyTrashHandler,
  getResourceHandler,
  getTrashedResourcesHandler,
  moveResourceHandler,
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
resourceRoutes.patch("/:id/move", moveResourceHandler);
resourceRoutes.post("/:id/copy", copyResourceHandler);

export default resourceRoutes;
