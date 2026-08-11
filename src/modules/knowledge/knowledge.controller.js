import { createKnowledge, getKnowledge } from "./knowledge.service.js";

export async function createKnowledgeSource(req, res) {

    try {

        const knowledge = await createKnowledge(req.user.id, req.body);

        return res.status(201).json({

            success: true,

            message: "Fuente de conocimiento creada correctamente.",

            data: knowledge

        });

    } catch (error) {

        return res.status(error.statusCode || 500).json({

            success: false,

            message: error.message

        });

    }

}

export async function getKnowledgeSources(req, res) {

    try {

        const knowledgeSources = await getKnowledge(req.user.id);

        return res.status(200).json({

            success: true,

            data: knowledgeSources

        });

    } catch (error) {

        return res.status(error.statusCode || 500).json({

            success: false,

            message: error.message

        });

    }

}