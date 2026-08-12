import express from "express";

import { verifyToken } from "../../middlewares/auth.middleware.js";

import { createKnowledgeSource, getKnowledgeSources, getKnowledgeSource } from "./knowledge.controller.js";

const router = express.Router();

router.post("/", verifyToken, createKnowledgeSource);
router.get("/", verifyToken, getKnowledgeSources);
router.get("/:id", verifyToken, getKnowledgeSource);

export default router;