import express from "express";

import { verifyToken } from "../../middlewares/auth.middleware.js";

import { createKnowledgeSource } from "./knowledge.controller.js";

const router = express.Router();

router.post("/", verifyToken, createKnowledgeSource);

export default router;