import { ObjectId } from "mongodb";

import { getDB } from "../../database/connection.js"
import { COLLECTIONS } from "../../constants/collections.js";
import { searchKnowledge } from "../knowledge/knowledge-search.service.js";
import { generateAnswer } from "../ai/ai.service.js";

// Procesa una consulta utilizando las fuentes de conocimiento del chatbot.
export async function processChatMessage(chatbotId, message) {

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

    const knowledgeSources = await searchKnowledge(
        chatbot.userId,
        chatbot.knowledgeIds,
        message
    );
    //console.log("Resultados de búsqueda:", knowledgeSources);

    if (knowledgeSources.length === 0) {

        return {
            answer: "No encontré información suficiente en la base de conocimiento para responder esa consulta."
        };

    }

    const context = knowledgeSources.map(source => ({
        title: source.title,
        content: source.processedContent
    }));

    const answer = await generateAnswer(
        message,
        context
    );

    return {
        answer
    };
}