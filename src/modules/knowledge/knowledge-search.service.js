import { ObjectId } from "mongodb";
import { getDB } from "../../database/connection.js";
import { COLLECTIONS } from "../../constants/collections.js";
import { generateEmbedding } from "../ai/ai.service.js";

// Define un umbral mínimo de relevancia para filtrar los resultados de búsqueda.
const MIN_RELEVANCE_SCORE = 0.64;

// Busca información relevante dentro de las fuentes de conocimiento indicadas.
export async function searchKnowledge(userId, knowledgeIds, query) {

    if (!knowledgeIds || knowledgeIds.length === 0) {

        const error = new Error(
            "No se proporcionaron fuentes de conocimiento."
        );

        error.statusCode = 400;
        throw error;

    }

    if (!query || !query.trim()) {

        const error = new Error(
            "La consulta es obligatoria."
        );

        error.statusCode = 400;
        throw error;

    }

    // Genera el embedding de la consulta para realizar una búsqueda semántica.
    const queryEmbedding = await generateEmbedding(query);

    const knowledgeCollection = getDB().collection(
        COLLECTIONS.KNOWLEDGE
    );

    const knowledgeObjectIds = knowledgeIds.map(
        knowledgeId => new ObjectId(knowledgeId)
    );

    const results = await knowledgeCollection.aggregate([

        {
            // Busca las fuentes más similares semánticamente dentro de las permitidas para el chatbot.
            $vectorSearch: {
                index: "knowledge_vector_index",
                path: "embedding",
                queryVector: queryEmbedding,
                numCandidates: 100,
                limit: 5,
                filter: {
                    userId: new ObjectId(userId),
                    _id: {
                        $in: knowledgeObjectIds
                    },
                    isActive: true,
                    status: "ready"
                }
            }
        },

        {
            $project: {
                _id: 1,
                title: 1,
                processedContent: 1,
                score: {
                    $meta: "vectorSearchScore"
                }
            }
        },

        {
            $match: {
                score: {
                    $gte: MIN_RELEVANCE_SCORE
                }
            }
        }

    ]).toArray();

    return results;
}