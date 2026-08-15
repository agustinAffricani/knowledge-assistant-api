import express from "express";

import { verifyToken } from "../../middlewares/auth.middleware.js";

import { 
    createChatbotSource, 
    updateChatbotSource, 
    getChatbotsSource,
    getChatbotByIdSource,
    deleteChatbotSource,
    processChatMessageSource
} from "./chatbot.controller.js";

const router = express.Router();

router.post("/", verifyToken, createChatbotSource);
router.patch("/:id", verifyToken, updateChatbotSource);
router.get("/", verifyToken, getChatbotsSource);
router.get("/:id", verifyToken, getChatbotByIdSource);
router.delete("/:id", verifyToken, deleteChatbotSource);
router.post("/:id/chat", processChatMessageSource);

export default router;