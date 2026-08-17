import { 
    createKnowledge, 
    getKnowledge, 
    getKnowledgeById, 
    updateKnowledge, 
    deleteKnowledge,
    updateKnowledgeContent
} from "./knowledge.service.js";

// Crea una nueva fuente de conocimiento para el usuario.
export async function createKnowledgeSource(req, res) {
    const knowledge = await createKnowledge(req.user.id, req.body);
    return res.status(201).json({
        success: true,
        message: "Fuente de conocimiento creada correctamente.",
        data: knowledge
    });
}

// Obtiene todas las fuentes de conocimiento del usuario.
export async function getKnowledgeSources(req, res) {
    const knowledgeSources = await getKnowledge(req.user.id);
    return res.status(200).json({
        success: true,
        data: knowledgeSources
    });
}

// Obtiene una fuente de conocimiento específica por su ID.
export async function getKnowledgeSource(req, res) {
    const knowledgeSource = await getKnowledgeById(
        req.user.id,
        req.params.id
    );
    return res.status(200).json({
        success: true,
        data: knowledgeSource
    });
}

// Actualiza los datos principales de una fuente de conocimiento 
export async function updateKnowledgeSource(req, res) {
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
}

// Elimina una fuente de conocimiento.
export async function deleteKnowledgeSource(req, res) {
    await deleteKnowledge(
        req.user.id,
        req.params.id
    );
    return res.status(200).json({
        success: true,
        message: "Fuente de conocimiento eliminada correctamente."
    });
}

// Actualiza el contenido de una fuente de conocimiento.
export async function updateKnowledgeContentSource(req, res) {
    // console.log("req.file:", req.file);
    // console.log("req.body:", req.body);
    const knowledgeSource = await updateKnowledgeContent(
        req.user.id,
        req.params.id,
        req.body?.content,
        req.file,
        req.body?.url,
        req.body?.question,
        req.body?.answer
    );
    return res.status(200).json({
        success: true,
        message: "Contenido de la fuente actualizado correctamente.",
        data: knowledgeSource
    });
}