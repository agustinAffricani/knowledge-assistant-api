import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import swaggerUi from "swagger-ui-express";

import healthRoutes from "./modules/health/health.routes.js";
import authRoutes from "./modules/auth/auth.routes.js";
import knowledgeRoutes from "./modules/knowledge/knowledge.routes.js";
import chatbotRoutes from "./modules/chatbot/chatbot.routes.js";
import { errorHandler } from "./middlewares/error.middleware.js";
import { swaggerSpec } from "./config/swagger.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use(cookieParser());

app.use("/api/health", healthRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/knowledge", knowledgeRoutes);
app.use("/api/chatbots", chatbotRoutes);

app.use(
    "/api-docs",
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec, {
        defaultModelsExpandDepth: -1,
        customCss: ".models { display: none !important; }"
    })
);

app.use(errorHandler);

export default app;