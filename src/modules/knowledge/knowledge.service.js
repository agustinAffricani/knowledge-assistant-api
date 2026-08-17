import { ObjectId } from "mongodb";
import { getDB } from "../../database/connection.js";
import { COLLECTIONS } from "../../constants/collections.js";
import { processKnowledgeContent } from "./knowledge.processor.js";
import { generateEmbedding } from "../ai/ai.service.js";
import { extractPdfText, deletePdfFile } from "../../utils/pdf.js";
import { extractUrlText } from "../../utils/url.js";

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

export async function deleteKnowledge(userId, knowledgeId) {

    if (!ObjectId.isValid(knowledgeId)) {

        const error = new Error(
            "El ID de la fuente de conocimiento no es válido."
        );

        error.statusCode = 400;
        throw error;

    }

    const knowledgeCollection = getDB().collection(
        COLLECTIONS.KNOWLEDGE
    );

    const result = await knowledgeCollection.deleteOne({
        _id: new ObjectId(knowledgeId),
        userId: new ObjectId(userId)
    });

    if (result.deletedCount === 0) {

        const error = new Error(
            "Fuente de conocimiento no encontrada."
        );

        error.statusCode = 404;
        throw error;

    }

    return true;
}

// Actualiza el contenido de una fuente de conocimiento.
export async function updateKnowledgeContent( userId, knowledgeId, content, file, url, question, answer ) {

    if (!ObjectId.isValid(knowledgeId)) {

        const error = new Error(
            "El ID de la fuente de conocimiento no es válido."
        );

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

        const error = new Error(
            "Fuente de conocimiento no encontrada."
        );

        error.statusCode = 404;
        throw error;

    }

    const updates = {};

    let previousFilePath = null;
    let newFilePath = null;

    // Manejo de la actualización de contenido para fuentes de conocimiento de tipo texto
    if (knowledgeSource.type === KNOWLEDGE_TYPES.TEXT) {

        if (typeof content !== "string" || !content.trim()) {

            const error = new Error(
                "El contenido es obligatorio y no puede estar vacío."
            );

            error.statusCode = 400;
            throw error;

        }

        const processedContent = processKnowledgeContent(
            content
        );

        const embedding = await generateEmbedding(
            processedContent
        );

        updates["source.content"] = content.trim();
        updates.processedContent = processedContent;
        updates.embedding = embedding;
        updates.status = "ready";

    }

    // Manejo de la actualización de contenido para fuentes de conocimiento de tipo PDF
    if (knowledgeSource.type === KNOWLEDGE_TYPES.PDF) {

        if (!file) {

            const error = new Error(
                "El archivo PDF es obligatorio."
            );

            error.statusCode = 400;
            throw error;

        }

        previousFilePath = knowledgeSource.source?.path;
        newFilePath = file.path;

        try {

            const extractedText = await extractPdfText(
                file.path
            );

            const processedContent = processKnowledgeContent(
                extractedText
            );

            const embedding = await generateEmbedding(
                processedContent
            );

            updates.source = {
                filename: file.originalname,
                path: file.path
            };

            updates.processedContent = processedContent;
            updates.embedding = embedding;
            updates.status = "ready";

        } catch (error) {

            await deletePdfFile(file.path);

            throw error;

        }

    }

    // Manejo de la actualización de contenido para fuentes de conocimiento de tipo URL
    if (knowledgeSource.type === KNOWLEDGE_TYPES.URL) {

        if (typeof url !== "string" || !url.trim()) {

            const error = new Error(
                "La URL es obligatoria."
            );

            error.statusCode = 400;
            throw error;

        }

        const extractedText = await extractUrlText(
            url.trim()
        );

        const processedContent = processKnowledgeContent(
            extractedText
        );

        const embedding = await generateEmbedding(
            processedContent
        );

        updates.source = {
            url: url.trim()
        };

        updates.processedContent = processedContent;
        updates.embedding = embedding;
        updates.status = "ready";

    }

    // Manejo de la actualización de contenido para fuentes de conocimiento de tipo FAQ
    if (knowledgeSource.type === KNOWLEDGE_TYPES.FAQ) {

        if (
            typeof question !== "string" ||
            !question.trim()
        ) {

            const error = new Error(
                "La pregunta es obligatoria."
            );

            error.statusCode = 400;
            throw error;

        }

        if (
            typeof answer !== "string" ||
            !answer.trim()
        ) {

            const error = new Error(
                "La respuesta es obligatoria."
            );

            error.statusCode = 400;
            throw error;

        }

        const processedContent = processKnowledgeContent(
            `Pregunta: ${question.trim()}\nRespuesta: ${answer.trim()}`
        );

        const embedding = await generateEmbedding(
            processedContent
        );

        updates.source = {
            question: question.trim(),
            answer: answer.trim()
        };

        updates.processedContent = processedContent;
        updates.embedding = embedding;
        updates.status = "ready";

    }

    updates.updatedAt = new Date();

    try {

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

        if (
            knowledgeSource.type === KNOWLEDGE_TYPES.PDF &&
            previousFilePath &&
            newFilePath
        ) {

            try {

                await deletePdfFile(previousFilePath);

            } catch (error) {

                console.error(
                    "No fue posible eliminar el PDF anterior:",
                    error
                );

            }

        }

        return result;

    } catch (error) {

        if (
            knowledgeSource.type === KNOWLEDGE_TYPES.PDF &&
            newFilePath
        ) {

            await deletePdfFile(newFilePath);

        }

        throw error;

    }

}