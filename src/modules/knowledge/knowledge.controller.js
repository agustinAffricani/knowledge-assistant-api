import { createKnowledge } from "./knowledge.service.js";

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