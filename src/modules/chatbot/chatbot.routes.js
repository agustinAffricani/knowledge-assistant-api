import express from "express";

import { verifyToken } from "../../middlewares/auth.middleware.js";

import { 
    createChatbotSource, 
    updateChatbotSource, 
    getChatbotsSource,
    getChatbotByIdSource,
    deleteChatbotSource,
    processChatMessageSource
} from "./chatbot.controller.js";

const router = express.Router();

/**
 * @openapi
 * /api/chatbots:
 *   post:
 *     summary: Crea un nuevo chatbot
 *     tags:
 *       - Chatbots
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 description: Nombre del chatbot.
 *                 example: Asistente de Ventas
 *               description:
 *                 type: string
 *                 description: Descripción del chatbot.
 *                 example: Responde consultas comerciales.
 *               purpose:
 *                 type: string
 *                 description: Propósito del chatbot.
 *                 example: Ventas y atención comercial.
 *               isActive:
 *                 type: boolean
 *                 description: Indica si el chatbot está disponible.
 *                 example: true
 *               knowledgeIds:
 *                 type: array
 *                 description: Lista de fuentes de conocimiento que quedarán asociadas al chatbot. Puede contener múltiples fuentes de distintos tipos.
 *                 items:
 *                   type: string
 *                 example:
 *                   - 6a7d01f6a112abce629d4438
 *                   - 6a80cc7a5e29a2f14f300590
 *     responses:
 *       201:
 *         description: Chatbot creado correctamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Chatbot creado correctamente.
 *                 data:
 *                   $ref: "#/components/schemas/Chatbot"
 *       400:
 *         description: Datos inválidos.
 *       401:
 *         description: Usuario no autenticado.
 *       403:
 *         description: Una o más fuentes de conocimiento no pertenecen al usuario.
 *       500:
 *         description: Error interno del servidor.
 */
router.post("/", verifyToken, createChatbotSource);

/**
 * @openapi
 * /api/chatbots:
 *   get:
 *     summary: Obtiene los chatbots del usuario autenticado
 *     tags:
 *       - Chatbots
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Lista de chatbots del usuario.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: "#/components/schemas/Chatbot"
 *       401:
 *         description: Usuario no autenticado.
 *       500:
 *         description: Error interno del servidor.
 */
router.get("/", verifyToken, getChatbotsSource);

/**
 * @openapi
 * /api/chatbots/{id}:
 *   get:
 *     summary: Obtiene un chatbot específico
 *     tags:
 *       - Chatbots
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID del chatbot.
 *         schema:
 *           type: string
 *         example: 6a7e506f083f189e6e144fca
 *     responses:
 *       200:
 *         description: Chatbot obtenido correctamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: "#/components/schemas/Chatbot"
 *       400:
 *         description: El ID del chatbot no es válido.
 *       401:
 *         description: Usuario no autenticado.
 *       404:
 *         description: Chatbot no encontrado.
 *       500:
 *         description: Error interno del servidor.
 */
router.get("/:id", verifyToken, getChatbotByIdSource);

/**
 * @openapi
 * /api/chatbots/{id}:
 *   patch:
 *     summary: Actualiza los datos de un chatbot
 *     tags:
 *       - Chatbots
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID del chatbot.
 *         schema:
 *           type: string
 *         example: 6a7e506f083f189e6e144fca
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Nombre del chatbot.
 *                 example: Asistente de Ventas
 *               description:
 *                 type: string
 *                 description: Descripción del chatbot.
 *                 example: Responde consultas comerciales.
 *               purpose:
 *                 type: string
 *                 description: Propósito del chatbot.
 *                 example: Ventas y atención comercial.
 *               isActive:
 *                 type: boolean
 *                 description: Indica si el chatbot está disponible.
 *                 example: true
 *               knowledgeIds:
 *                 type: array
 *                 description: Lista final de fuentes de conocimiento asociadas al chatbot. Puede contener múltiples fuentes de distintos tipos.
 *                 items:
 *                   type: string
 *                 example:
 *                   - 6a7d01f6a112abce629d4438
 *                   - 6a80cc7a5e29a2f14f300590
 *     responses:
 *       200:
 *         description: Chatbot actualizado correctamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Chatbot actualizado correctamente.
 *                 data:
 *                   $ref: "#/components/schemas/Chatbot"
 *       400:
 *         description: Datos inválidos, IDs no válidos o fuentes repetidas.
 *       401:
 *         description: Usuario no autenticado.
 *       403:
 *         description: Una o más fuentes de conocimiento no pertenecen al usuario.
 *       404:
 *         description: Chatbot no encontrado.
       500:
 *         description: Error interno del servidor.
 */
router.patch("/:id", verifyToken, updateChatbotSource);

/**
 * @openapi
 * /api/chatbots/{id}:
 *   delete:
 *     summary: Elimina un chatbot
 *     tags:
 *       - Chatbots
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID del chatbot.
 *         schema:
 *           type: string
 *         example: 6a7e506f083f189e6e144fca
 *     responses:
 *       200:
 *         description: Chatbot eliminado correctamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Chatbot eliminado correctamente.
 *       400:
 *         description: El ID del chatbot no es válido.
 *       401:
 *         description: Usuario no autenticado.
 *       404:
 *         description: Chatbot no encontrado.
 *       500:
 *         description: Error interno del servidor.
 */
router.delete("/:id", verifyToken, deleteChatbotSource);

/**
 * @openapi
 * /api/chatbots/{id}/chat:
 *   post:
 *     summary: Envía un mensaje al chatbot público
 *     description: |
 *       Permite a un visitante enviar un mensaje a un chatbot sin autenticación.
 *       El chatbot utiliza las fuentes de conocimiento asociadas para recuperar
 *       información relevante y generar una respuesta.
 *
 *       En la primera consulta no es necesario enviar un sessionId.
 *       El servidor genera uno y lo devuelve en la respuesta.
 *       Las consultas posteriores pueden reutilizar ese sessionId para mantener
 *       el historial de la conversación.
 *     tags:
 *       - Chatbots
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID del chatbot público.
 *         schema:
 *           type: string
 *         example: 6a7e506f083f189e6e144fca
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - message
 *             properties:
 *               message:
 *                 type: string
 *                 description: Mensaje o consulta realizada por el visitante.
 *                 example: ¿Cuánto cuesta el Plan Pro?
 *               sessionId:
 *                 type: string
 *                 nullable: true
 *                 description: Identificador de la conversación. Es opcional en la primera consulta y debe reutilizarse para continuar una conversación existente.
 *                 example: 85441acd-e683-4e7e-9413-4cfee84136dc
 *     responses:
 *       200:
 *         description: Respuesta generada correctamente.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ChatResponse"
 *       400:
 *         description: Mensaje vacío, chatbot inactivo o chatbot sin fuentes de conocimiento configuradas.
 *       404:
 *         description: Chatbot no encontrado o conversación no encontrada.
 *       500:
 *         description: Error interno del servidor.
 */
router.post("/:id/chat", processChatMessageSource);

export default router;