import { 
    createKnowledge, 
    getKnowledge, 
    getKnowledgeById, 
    updateKnowledge, 
    deleteKnowledge,
    updateKnowledgeContent
} from "./knowledge.service.js";

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

export async function getKnowledgeSource(req, res) {

    try {

        const knowledgeSource = await getKnowledgeById(
            req.user.id,
            req.params.id
        );

        return res.status(200).json({

            success: true,

            data: knowledgeSource

        });

    } catch (error) {

        return res.status(error.statusCode || 500).json({

            success: false,

            message: error.message

        });

    }

}

export async function updateKnowledgeSource(req, res) {

    try {

        const knowledgeSource = await updateKnowledge(
            req.user.id,
            req.params.id,
            req.body
        );

        return res.status(200).json({

            success: true,

            message: "Fuente de conocimiento actualizada correctamente.",

            data: knowledgeSource

        });

    } catch (error) {

        return res.status(error.statusCode || 500).json({

            success: false,

            message: error.message

        });

    }

}

export async function deleteKnowledgeSource(req, res) {

    try {

        await deleteKnowledge(
            req.user.id,
            req.params.id
        );

        return res.status(200).json({

            success: true,

            message: "Fuente de conocimiento eliminada correctamente."

        });

    } catch (error) {

        return res.status(error.statusCode || 500).json({

            success: false,

            message: error.message

        });

    }

}

// Actualiza el contenido de una fuente de conocimiento.
export async function updateKnowledgeContentSource(req, res) {

    try {

        const knowledgeSource = await updateKnowledgeContent(
            req.user.id,
            req.params.id,
            req.body.content
        );

        return res.status(200).json({

            success: true,

            message: "Contenido de la fuente actualizado correctamente.",

            data: knowledgeSource

        });

    } catch (error) {

        return res.status(error.statusCode || 500).json({

            success: false,

            message: error.message

        });

    }

}