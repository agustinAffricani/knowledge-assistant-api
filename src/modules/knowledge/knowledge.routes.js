import express from "express";

import { verifyToken } from "../../middlewares/auth.middleware.js";

import { 
    createKnowledgeSource, 
    getKnowledgeSources, 
    getKnowledgeSource, 
    updateKnowledgeSource, 
    deleteKnowledgeSource,
    updateKnowledgeContentSource
} from "./knowledge.controller.js";

const router = express.Router();

router.post("/", verifyToken, createKnowledgeSource);
router.get("/", verifyToken, getKnowledgeSources);
router.get("/:id", verifyToken, getKnowledgeSource);
router.patch("/:id", verifyToken, updateKnowledgeSource);
router.patch("/:id/content", verifyToken, updateKnowledgeContentSource);
router.delete("/:id", verifyToken, deleteKnowledgeSource);

export default router;