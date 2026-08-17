import { ObjectId } from "mongodb";
import { getDB } from "../../database/connection.js";
import { COLLECTIONS } from "../../constants/collections.js";

// Crea un nuevo chatbot asociado al usuario.
export async function createChatbot(userId, data) {
    const { name, description, purpose, knowledgeIds } = data;
    if (!name || !name.trim()) {
        const error = new Error(
            "El nombre del chatbot es obligatorio."
        );
        error.statusCode = 400;
        throw error;
    }
    if (knowledgeIds !== undefined && !Array.isArray(knowledgeIds)) {
        const error = new Error(
            "El campo knowledgeIds debe ser un array."
        );
        error.statusCode = 400;
        throw error;
    }
    if (knowledgeIds) {
        for (const knowledgeId of knowledgeIds) {
            if (!ObjectId.isValid(knowledgeId)) {
                const error = new Error(
                    "Uno de los IDs de conocimiento no es válido."
                );
                error.statusCode = 400;
                throw error;
            }
        }
    }
    const chatbotCollection = getDB().collection(
        COLLECTIONS.CHATBOTS
    );
    const knowledgeCollection = getDB().collection(
        COLLECTIONS.KNOWLEDGE
    );
    if (knowledgeIds && knowledgeIds.length > 0) {
        const knowledgeSources = await knowledgeCollection.find({
            _id: {
                $in: knowledgeIds.map(
                    knowledgeId => new ObjectId(knowledgeId)
                )
            },
            userId: new ObjectId(userId)
        }).toArray();
        if (knowledgeSources.length !== knowledgeIds.length) {
            const error = new Error(
                "Una o más fuentes de conocimiento no pertenecen al usuario."
            );
            error.statusCode = 403;
            throw error;
        }
    }
    const now = new Date();
    const chatbot = {
        userId: new ObjectId(userId),
        name: name.trim(),
        description: description?.trim() || "",
        isActive: true,
        purpose: purpose?.trim() || "",
        knowledgeIds: knowledgeIds
            ? knowledgeIds.map(knowledgeId => new ObjectId(knowledgeId))
            : [],
        createdAt: now,
        updatedAt: now
    };
    const result = await chatbotCollection.insertOne(chatbot);
    return {
        ...chatbot,
        _id: result.insertedId
    };
}

// Actualiza los datos permitidos de un chatbot.
export async function updateChatbot(userId, chatbotId, data) {
    if (!ObjectId.isValid(chatbotId)) {
        const error = new Error(
            "El ID del chatbot no es válido."
        );
        error.statusCode = 400;
        throw error;
    }
    const {
        name,
        description,
        purpose,
        isActive,
        knowledgeIds
    } = data;
    if (
        name === undefined &&
        description === undefined &&
        purpose === undefined &&
        isActive === undefined &&
        knowledgeIds === undefined
    ) {
        const error = new Error(
            "No se proporcionaron datos para actualizar."
        );
        error.statusCode = 400;
        throw error;
    }
    const chatbotCollection = getDB().collection(
        COLLECTIONS.CHATBOTS
    );
    const chatbot = await chatbotCollection.findOne({
        _id: new ObjectId(chatbotId),
        userId: new ObjectId(userId)
    });
    if (!chatbot) {
        const error = new Error(
            "Chatbot no encontrado."
        );
        error.statusCode = 404;
        throw error;
    }
    const updates = {};
    if (name !== undefined) {
        if (typeof name !== "string" || !name.trim()) {
            const error = new Error(
                "El nombre del chatbot no puede estar vacío."
            );
            error.statusCode = 400;
            throw error;
        }
        updates.name = name.trim();
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
    if (purpose !== undefined) {
        if (typeof purpose !== "string") {
            const error = new Error(
                "El propósito debe ser un texto."
            );
            error.statusCode = 400;
            throw error;
        }
        updates.purpose = purpose.trim();
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
    const knowledgeCollection = getDB().collection(
        COLLECTIONS.KNOWLEDGE
    );
    if (knowledgeIds !== undefined) {
        if (!Array.isArray(knowledgeIds)) {
            const error = new Error(
                "El campo knowledgeIds debe ser un array."
            );
            error.statusCode = 400;
            throw error;
        }
        const uniqueKnowledgeIds = new Set(knowledgeIds);
        if (uniqueKnowledgeIds.size !== knowledgeIds.length) {
            const error = new Error(
                "No se pueden repetir fuentes de conocimiento."
            );
            error.statusCode = 400;
            throw error;
        }
        for (const knowledgeId of knowledgeIds) {
            if (!ObjectId.isValid(knowledgeId)) {
                const error = new Error(
                    "Uno de los IDs de conocimiento no es válido."
                );
                error.statusCode = 400;
                throw error;
            }
        }
        if (knowledgeIds.length > 0) {
            const knowledgeSources = await knowledgeCollection.find({
                _id: {
                    $in: knowledgeIds.map(
                        knowledgeId => new ObjectId(knowledgeId)
                    )
                },
                userId: new ObjectId(userId)
            }).toArray();
            if (knowledgeSources.length !== knowledgeIds.length) {
                const error = new Error(
                    "Una o más fuentes de conocimiento no pertenecen al usuario."
                );
                error.statusCode = 403;
                throw error;
            }
        }
        updates.knowledgeIds = knowledgeIds.map(
            knowledgeId => new ObjectId(knowledgeId)
        );
    }
    updates.updatedAt = new Date();
    const result = await chatbotCollection.findOneAndUpdate(
        {
            _id: new ObjectId(chatbotId),
            userId: new ObjectId(userId)
        },
        {
            $set: updates
        },
        {
            returnDocument: "after"
        }
    );
    return result;
}

// Obtiene los chatbots del usuario autenticado.
export async function getChatbots(userId) {
    const chatbotCollection = getDB().collection(
        COLLECTIONS.CHATBOTS
    );
    const chatbots = await chatbotCollection
        .find({
            userId: new ObjectId(userId)
        })
        .sort({
            createdAt: -1
        })
        .toArray();
    return chatbots;
}

// Obtiene un chatbot del usuario autenticado.
export async function getChatbotById(userId, chatbotId) {
    if (!ObjectId.isValid(chatbotId)) {
        const error = new Error(
            "El ID del chatbot no es válido."
        );
        error.statusCode = 400;
        throw error;
    }
    const chatbotCollection = getDB().collection(
        COLLECTIONS.CHATBOTS
    );
    const chatbot = await chatbotCollection.findOne({
        _id: new ObjectId(chatbotId),
        userId: new ObjectId(userId)
    });
    if (!chatbot) {
        const error = new Error(
            "Chatbot no encontrado."
        );
        error.statusCode = 404;
        throw error;
    }
    return chatbot;
}

// Elimina un chatbot del usuario autenticado.
export async function deleteChatbot(userId, chatbotId) {
    if (!ObjectId.isValid(chatbotId)) {
        const error = new Error(
            "El ID del chatbot no es válido."
        );
        error.statusCode = 400;
        throw error;
    }
    const chatbotCollection = getDB().collection(
        COLLECTIONS.CHATBOTS
    );
    const result = await chatbotCollection.deleteOne({
        _id: new ObjectId(chatbotId),
        userId: new ObjectId(userId)
    });
    if (result.deletedCount === 0) {
        const error = new Error(
            "Chatbot no encontrado."
        );
        error.statusCode = 404;
        throw error;
    }
    return true;
}