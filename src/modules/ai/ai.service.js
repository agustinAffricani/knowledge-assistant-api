import OpenAI from "openai";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

// Genera una respuesta utilizando una pregunta y el contexto proporcionado.
export async function generateAnswer(question, context) {
    if (!question || !question.trim()) {
        const error = new Error(
            "La pregunta es obligatoria."
        );
        error.statusCode = 400;
        throw error;
    }
    if (!context || context.length === 0) {
        const error = new Error(
            "No hay información suficiente para responder la consulta."
        );
        error.statusCode = 400;
        throw error;
    }
    const contextText = context
        .map(item => `${item.title}: ${item.content}`)
        .join("\n\n");
    const systemPrompt = `
Sos un asistente virtual de una empresa.
Tu tarea es responder las consultas de los usuarios utilizando
EXCLUSIVAMENTE la información proporcionada en el contexto.
No inventes información ni utilices conocimientos externos al contexto.
Si la información necesaria para responder no está presente en el contexto,
indica que no encontraste información suficiente para responder.
Contexto:
${contextText}
`;
    try {
        // Utiliza el modelo de OpenAI para generar la respuesta.
        const response = await openai.responses.create({
            model: process.env.OPENAI_MODEL,
            instructions: systemPrompt,
            input: question.trim()
        });
        return response.output_text;
    } catch (error) {
        console.error("OpenAI API error:", error);
        const apiError = new Error(
            "No fue posible obtener una respuesta del servicio de IA."
        );
        apiError.statusCode = error.status || 503;
        throw apiError;
    }
}

// Genera un embedding para un texto.
export async function generateEmbedding(text) {
    if (!text || !text.trim()) {
        const error = new Error(
            "El texto es obligatorio para generar el embedding."
        );
        error.statusCode = 400;
        throw error;
    }
    try {
        // Utiliza el modelo "text-embedding-3-small" para generar embeddings.
        const response = await openai.embeddings.create({
            model: "text-embedding-3-small",
            input: text.trim()
        });
        return response.data[0].embedding;
    } catch (error) {
        console.error("OpenAI Embedding API error:", error);
        const apiError = new Error(
            "No fue posible generar el embedding."
        );
        apiError.statusCode = error.status || 503;
        throw apiError;
    }
}