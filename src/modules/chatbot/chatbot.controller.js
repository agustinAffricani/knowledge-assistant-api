import { 
    createChatbot, 
    updateChatbot, 
    getChatbots,
    getChatbotById,
    deleteChatbot
} from "./chatbot.service.js";

// Crea un nuevo chatbot para el usuario autenticado.
export async function createChatbotSource(req, res) {

    try {

        const chatbot = await createChatbot(
            req.user.id,
            req.body
        );

        return res.status(201).json({

            success: true,

            message: "Chatbot creado correctamente.",

            data: chatbot

        });

    } catch (error) {

        return res.status(error.statusCode || 500).json({

            success: false,

            message: error.message

        });

    }

}

// Actualiza los datos permitidos de un chatbot.
export async function updateChatbotSource(req, res) {

    try {

        const chatbot = await updateChatbot(
            req.user.id,
            req.params.id,
            req.body
        );

        return res.status(200).json({

            success: true,

            message: "Chatbot actualizado correctamente.",

            data: chatbot

        });

    } catch (error) {

        return res.status(error.statusCode || 500).json({

            success: false,

            message: error.message

        });

    }

}

// Obtiene los chatbots del usuario autenticado.
export async function getChatbotsSource(req, res) {

    try {

        const chatbots = await getChatbots(
            req.user.id
        );

        return res.status(200).json({

            success: true,

            data: chatbots

        });

    } catch (error) {

        return res.status(error.statusCode || 500).json({

            success: false,

            message: error.message

        });

    }

}

// Obtiene un chatbot del usuario autenticado.
export async function getChatbotByIdSource(req, res) {

    try {

        const chatbot = await getChatbotById(
            req.user.id,
            req.params.id
        );

        return res.status(200).json({

            success: true,

            data: chatbot

        });

    } catch (error) {

        return res.status(error.statusCode || 500).json({

            success: false,

            message: error.message

        });

    }

}

// Elimina un chatbot del usuario autenticado.
export async function deleteChatbotSource(req, res) {

    try {

        await deleteChatbot(
            req.user.id,
            req.params.id
        );

        return res.status(200).json({

            success: true,

            message: "Chatbot eliminado correctamente."

        });

    } catch (error) {

        return res.status(error.statusCode || 500).json({

            success: false,

            message: error.message

        });

    }

}