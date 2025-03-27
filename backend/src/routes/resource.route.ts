import { Router } from "express";
import {
  createResourceHandler,
  getResourceHandler,
} from "../controllers/resource.controller";

const resourceRoutes = Router();

// prefix resources
resourceRoutes.get("/", getResourceHandler);
resourceRoutes.post("/", createResourceHandler);

export default resourceRoutes;
