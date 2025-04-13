import express from "express";
import cors from "cors";
import { APP_ORIGIN } from "./constants/env";
import cookieParser from "cookie-parser";
import errorHandler from "./middleware/errorHandler";
import { OK } from "./constants/http";
import authRoutes from "./routes/auth.route";
import userRoutes from "./routes/user.route";
import adminRoutes from "./routes/admin.route";
import authenticate from "./middleware/authenticate";
import familyTreeRoutes from "./routes/family-tree.route";
import resourceRoutes from "./routes/resource.route";
import "./jobs/trashCleanupJob";
import suhufRoutes from "./routes/suhuf.route";
import windowRoutes from "./routes/windowRoutes";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: APP_ORIGIN,
    credentials: true,
  }),
);

app.use(cookieParser());

app.get("/", (req, res) => {
  res.status(OK).json({ status: "healthy" });
});

app.use("/auth", authRoutes);

// admin routes
app.use("/admin", authenticate(true), adminRoutes);

// user routes
app.use("/user", authenticate(), userRoutes);
app.use("/family-tree", authenticate(), familyTreeRoutes);
app.use("/resources", authenticate(), resourceRoutes);
app.use("/windows", authenticate(), windowRoutes);
app.use("/suhuf", authenticate(), suhufRoutes);

app.use(errorHandler);

export default app;
