import crypto from "crypto";

import { ObjectId } from "mongodb";
import { getDB } from "../../database/connection.js"
import { COLLECTIONS } from "../../constants/collections.js";
import { searchKnowledge } from "../knowledge/knowledge-search.service.js";
import { generateAnswer } from "../ai/ai.service.js";
import {
    getConversation,
    createConversation,
    addConversationMessage,
    getConversationHistory
} from "../conversation/conversation.service.js";

// Procesa una consulta utilizando las fuentes de conocimiento del chatbot.
export async function processChatMessage(chatbotId, message,sessionId) {
    if (!ObjectId.isValid(chatbotId)) {
        const error = new Error(
            "El ID del chatbot no es válido."
        );
        error.statusCode = 400;
        throw error;
    }

    if (!message || !message.trim()) {
        const error = new Error(
            "El mensaje es obligatorio."
        );
        error.statusCode = 400;
        throw error;
    }

    const chatbotCollection = getDB().collection(
        COLLECTIONS.CHATBOTS
    );

    const chatbot = await chatbotCollection.findOne({
        _id: new ObjectId(chatbotId)
    });
    
    if (!chatbot) {
        const error = new Error(
            "Chatbot no encontrado."
        );
        error.statusCode = 404;
        throw error;
    }

    if (!chatbot.isActive) {
        const error = new Error(
            "El chatbot no está disponible."
        );
        error.statusCode = 400;
        throw error;
    }
    
    if (!chatbot.knowledgeIds || chatbot.knowledgeIds.length === 0) {
        const error = new Error(
            "Este chatbot no tiene fuentes de conocimiento configuradas."
        );
        error.statusCode = 400;
        throw error;
    }

    // Recupera/crea sessionId para el historial de conversación
    let conversation;
    if (sessionId) {
        conversation = await getConversation(
            chatbotId,
            sessionId
        );

        if (!conversation) {
            const error = new Error(
                "La conversación no existe."
            );
            error.statusCode = 404;
            throw error;
        }
    } else {
        sessionId = crypto.randomUUID();
        conversation = await createConversation(
            chatbotId,
            sessionId
        );
    }

    const history = await getConversationHistory(
        conversation._id,
        10
    );

    // Búsqueda de contexto de la conversación (últimas 3)
    const previousUserMessages = history
        .filter(item => item.role === "user")
        .slice(-3)
        .map(item => item.content);

    const searchQuery = [
        ...previousUserMessages,
        message.trim()
    ].join(" ");

    await addConversationMessage(
        conversation._id,
        "user",
        message.trim()
    );
    
    const knowledgeSources = await searchKnowledge(
        chatbot.userId,
        chatbot.knowledgeIds,
        searchQuery
    );
    //console.log("Resultados de búsqueda:", knowledgeSources);

    // Si no se encontraron fuentes de conocimiento relevantes, devuelve un mensaje indicando que no hay información suficiente.
    if (knowledgeSources.length === 0) {
        const answer =
            "No encontré información suficiente en la base de conocimiento para responder esa consulta.";

        await addConversationMessage(
            conversation._id,
            "assistant",
            answer
        );

        return {
            answer,
            sessionId
        };
    }

    const context = knowledgeSources.map(source => ({
        title: source.title,
        content: source.processedContent
    }));
    
    const answer = await generateAnswer(
        message,
        context,
        history
    );

    await addConversationMessage(
        conversation._id,
        "assistant",
        answer
    );

    return {
        answer,
        sessionId
    };
}
