import express from "express";

import { verifyToken } from "../../middlewares/auth.middleware.js";

import { createKnowledgeSource, getKnowledgeSources } from "./knowledge.controller.js";

const router = express.Router();

router.post("/", verifyToken, createKnowledgeSource);
router.get("/", verifyToken, getKnowledgeSources);

export default router;