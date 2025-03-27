import { Router } from "express";
import {
  createResourceHandler,
  deleteResourceHandler,
  getResourceHandler,
} from "../controllers/resource.controller";

const resourceRoutes = Router();

// prefix resources
resourceRoutes.get("/", getResourceHandler);
resourceRoutes.post("/", createResourceHandler);
resourceRoutes.delete("/:id", deleteResourceHandler);

export default resourceRoutes;
