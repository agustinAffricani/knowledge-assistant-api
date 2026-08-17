import { 
    createChatbot, 
    updateChatbot, 
    getChatbots,
    getChatbotById,
    deleteChatbot
} from "./chatbot.service.js";

import { processChatMessage } from "./chat.service.js";

// Crea un nuevo chatbot para el usuario autenticado.
export async function createChatbotSource(req, res) {
    const chatbot = await createChatbot(
        req.user.id,
        req.body
    );
    return res.status(201).json({
        success: true,
        message: "Chatbot creado correctamente.",
        data: chatbot
    });
}

// Actualiza los datos permitidos de un chatbot.
export async function updateChatbotSource(req, res) {
    const chatbot = await updateChatbot(
        req.user.id,
        req.params.id,
        req.body
    );
    return res.status(200).json({
        success: true,
        message: "Chatbot actualizado correctamente.",
        data: chatbot
    });
}

// Obtiene los chatbots del usuario autenticado.
export async function getChatbotsSource(req, res) {
    const chatbots = await getChatbots(
        req.user.id
    );
    return res.status(200).json({
        success: true,
        data: chatbots
    });
}

// Obtiene un chatbot específico del usuario autenticado.
export async function getChatbotByIdSource(req, res) {
    const chatbot = await getChatbotById(
        req.user.id,
        req.params.id
    );
    return res.status(200).json({
        success: true,
        data: chatbot
    });
}

// Elimina un chatbot del usuario autenticado.
export async function deleteChatbotSource(req, res) {
    await deleteChatbot(
        req.user.id,
        req.params.id
    );
    return res.status(200).json({
        success: true,
        message: "Chatbot eliminado correctamente."
    });
}

// Procesa una consulta realizada por un visitante al chatbot.
export async function processChatMessageSource(req, res) {
    const result = await processChatMessage(
        req.params.id,
        req.body.message
    );
    return res.status(200).json({
        success: true,
        data: result
    });
}