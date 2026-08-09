import express from "express";
import cors from "cors";

import healthRoutes from "./modules/health/health.routes.js";
import authRoutes from "./modules/auth/auth.routes.js";

const app = express();

app.use(cors());

app.use(express.json());

app.use("/api/health", healthRoutes);
app.use("/api/auth", authRoutes);


export default app;