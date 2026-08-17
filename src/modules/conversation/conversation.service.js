import { ObjectId } from "mongodb";

import { getDB } from "../../database/connection.js";
import { COLLECTIONS } from "../../constants/collections.js";

// Obtiene una conversación por chatbot y sessionId.
export async function getConversation(chatbotId, sessionId) {

    const conversationCollection = getDB().collection(
        COLLECTIONS.CONVERSATIONS
    );

    return conversationCollection.findOne({
        chatbotId: new ObjectId(chatbotId),
        sessionId
    });

}

// Crea una nueva conversación.
export async function createConversation(chatbotId, sessionId) {

    const conversationCollection = getDB().collection(
        COLLECTIONS.CONVERSATIONS
    );

    const now = new Date();

    const conversation = {
        chatbotId: new ObjectId(chatbotId),
        sessionId,
        messages: [],
        createdAt: now,
        updatedAt: now
    };

    const result = await conversationCollection.insertOne(
        conversation
    );

    return {
        ...conversation,
        _id: result.insertedId
    };

}

// Agrega un mensaje a una conversación existente.
export async function addConversationMessage(
    conversationId,
    role,
    content
) {

    const conversationCollection = getDB().collection(
        COLLECTIONS.CONVERSATIONS
    );

    const message = {
        role,
        content,
        createdAt: new Date()
    };

    const result = await conversationCollection.findOneAndUpdate(
        {
            _id: new ObjectId(conversationId)
        },
        {
            $push: {
                messages: message
            },
            $set: {
                updatedAt: new Date()
            }
        },
        {
            returnDocument: "after"
        }
    );

    return result;

}

// Obtiene los últimos mensajes de una conversación.
export async function getConversationHistory(
    conversationId,
    limit = 10 // Número máximo de mensajes a recuperar
) {
    const conversationCollection = getDB().collection(
        COLLECTIONS.CONVERSATIONS
    );

    const conversation = await conversationCollection.findOne(
        {
            _id: new ObjectId(conversationId)
        },
        {
            projection: {
                messages: {
                    $slice: -limit
                }
            }
        }
    );
    return conversation?.messages || [];
}