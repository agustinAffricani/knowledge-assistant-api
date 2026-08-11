import { ObjectId } from "mongodb";

import { getDB } from "../../database/connection.js";
import { COLLECTIONS } from "../../constants/collections.js";

import {
    KNOWLEDGE_STATUS,
    KNOWLEDGE_TYPES
} from "../../constants/knowledge.js";

export async function createKnowledge(userId, data) {

    const { type, title, description } = data;

    // Validaciones
    if (!type || !title) {

        const error = new Error("El tipo y el título son obligatorios.");
        error.statusCode = 400;
        throw error;

    }

    // Validar tipo permitido
    if (!Object.values(KNOWLEDGE_TYPES).includes(type)) {

        const error = new Error("Tipo de conocimiento inválido.");
        error.statusCode = 400;
        throw error;

    }

    const knowledgeCollection = getDB().collection(COLLECTIONS.KNOWLEDGE);

    const knowledge = {

        userId: new ObjectId(userId),

        type,

        title: title.trim(),

        description: description?.trim() || "",

        isActive: true,

        status: KNOWLEDGE_STATUS.PENDING,

        createdAt: new Date(),

        updatedAt: new Date()

    };

    const result = await knowledgeCollection.insertOne(knowledge);

    return {

        id: result.insertedId,

        ...knowledge

    };

}

export async function getKnowledge(userId) {

    const knowledgeCollection = getDB().collection(
        COLLECTIONS.KNOWLEDGE
    );

    const knowledgeSources = await knowledgeCollection
        .find({
            userId: new ObjectId(userId)
        })
        .sort({
            createdAt: -1
        })
        .toArray();

    return knowledgeSources;
}