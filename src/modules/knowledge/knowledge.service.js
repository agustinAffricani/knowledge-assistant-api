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

export async function getKnowledgeById(userId, knowledgeId) {

    if (!ObjectId.isValid(knowledgeId)) {

        const error = new Error("El ID de la fuente de conocimiento no es válido.");
        error.statusCode = 400;
        throw error;

    }

    const knowledgeCollection = getDB().collection(
        COLLECTIONS.KNOWLEDGE
    );

    const knowledgeSource = await knowledgeCollection.findOne({
        _id: new ObjectId(knowledgeId),
        userId: new ObjectId(userId)
    });

    if (!knowledgeSource) {

        const error = new Error("Fuente de conocimiento no encontrada.");
        error.statusCode = 404;
        throw error;

    }

    return knowledgeSource;
}

export async function updateKnowledge(userId, knowledgeId, data) {

    if (!ObjectId.isValid(knowledgeId)) {

        const error = new Error(
            "El ID de la fuente de conocimiento no es válido."
        );

        error.statusCode = 400;
        throw error;

    }

    const { title, description, isActive } = data;

    if (
        title === undefined &&
        description === undefined &&
        isActive === undefined
    ) {

        const error = new Error(
            "No se proporcionaron datos para actualizar."
        );

        error.statusCode = 400;
        throw error;

    }

    const updates = {};

    if (title !== undefined) {

    if (typeof title !== "string" || !title.trim()) {

        const error = new Error(
            "El título no puede estar vacío."
        );

        error.statusCode = 400;
        throw error;
    }

        updates.title = title.trim();
    }

    if (description !== undefined) {

    if (typeof description !== "string") {

        const error = new Error(
            "La descripción debe ser un texto."
        );

        error.statusCode = 400;
        throw error;

    }

        updates.description = description.trim();

    }

    if (isActive !== undefined) {

        if (typeof isActive !== "boolean") {

            const error = new Error(
                "El campo isActive debe ser booleano."
            );

            error.statusCode = 400;
            throw error;

        }

        updates.isActive = isActive;

    }

    updates.updatedAt = new Date();

    const knowledgeCollection = getDB().collection(
        COLLECTIONS.KNOWLEDGE
    );

    const result = await knowledgeCollection.findOneAndUpdate(
        {
            _id: new ObjectId(knowledgeId),
            userId: new ObjectId(userId)
        },
        {
            $set: updates
        },
        {
            returnDocument: "after"
        }
    );

    if (!result) {

        const error = new Error(
            "Fuente de conocimiento no encontrada."
        );

        error.statusCode = 404;
        throw error;

    }

    return result;
}