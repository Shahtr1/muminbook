import { Router } from "express";
import { getResourceHandler } from "../controllers/resource.controller";

const resourceRoutes = Router();

// prefix resources
resourceRoutes.get("/", getResourceHandler);

export default resourceRoutes;
