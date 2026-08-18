import express from "express";

import { verifyToken } from "../../middlewares/auth.middleware.js";
import { uploadKnowledgeFile } from "../../middlewares/upload.middleware.js";
import { 
    createKnowledgeSource, 
    getKnowledgeSources, 
    getKnowledgeSource, 
    updateKnowledgeSource, 
    deleteKnowledgeSource,
    updateKnowledgeContentSource
} from "./knowledge.controller.js";

const router = express.Router();

/**
 * @openapi
 * /api/knowledge:
 *   post:
 *     summary: Crea una nueva fuente de conocimiento
 *     tags:
 *       - Knowledge
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - type
 *               - title
 *             properties:
 *               type:
 *                 type: string
 *                 enum:
 *                   - text
 *                   - pdf
 *                   - url
 *                   - faq
 *                 description: "Tipo de fuente de conocimiento. Valores permitidos: text, pdf, url, faq."
 *                 example: text
 *               title:
 *                 type: string
 *                 example: Título de la fuente de conocimiento
 *               description:
 *                 type: string
 *                 example: Descripción general de la fuente de conocimiento
 *     responses:
 *       201:
 *         description: Fuente de conocimiento creada correctamente.
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
 *                   example: Fuente de conocimiento creada correctamente.
 *                 data:
 *                   $ref: "#/components/schemas/KnowledgeSource"
 *       400:
 *         description: Datos inválidos o tipo de fuente no permitido.
 *       401:
 *         description: Usuario no autenticado.
 *       500:
 *         description: Error interno del servidor.
 */
router.post("/", verifyToken, createKnowledgeSource);

/**
 * @openapi
 * /api/knowledge:
 *   get:
 *     summary: Obtiene las fuentes de conocimiento del usuario autenticado
 *     tags:
 *       - Knowledge
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Lista de fuentes de conocimiento del usuario.
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
 *                     $ref: "#/components/schemas/KnowledgeSource"
 *       401:
 *         description: Usuario no autenticado.
 *       500:
 *         description: Error interno del servidor.
 */
router.get("/", verifyToken, getKnowledgeSources);

/**
 * @openapi
 * /api/knowledge/{id}:
 *   get:
 *     summary: Obtiene una fuente de conocimiento específica
 *     tags:
 *       - Knowledge
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID de la fuente de conocimiento.
 *         schema:
 *           type: string
 *         example: 6a7d01f6a112abce629d4438
 *     responses:
 *       200:
 *         description: Fuente de conocimiento obtenida correctamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: "#/components/schemas/KnowledgeSource"
 *       400:
 *         description: El ID de la fuente de conocimiento no es válido.
 *       401:
 *         description: Usuario no autenticado.
 *       404:
 *         description: Fuente de conocimiento no encontrada.
 *       500:
 *         description: Error interno del servidor.
 */
router.get("/:id", verifyToken, getKnowledgeSource);

/**
 * @openapi
 * /api/knowledge/{id}:
 *   patch:
 *     summary: Actualiza los datos de una fuente de conocimiento
 *     tags:
 *       - Knowledge
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID de la fuente de conocimiento.
 *         schema:
 *           type: string
 *         example: 6a7d01f6a112abce629d4438
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: Título de la fuente de conocimiento.
 *                 example: Título actualizado de la fuente
 *               description:
 *                 type: string
 *                 description: Descripción de la fuente de conocimiento.
 *                 example: Descripción actualizada de la fuente
 *               isActive:
 *                 type: boolean
 *                 description: Indica si la fuente está activa.
 *                 example: true
 *     responses:
 *       200:
 *         description: Fuente de conocimiento actualizada correctamente.
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
 *                   example: Fuente de conocimiento actualizada correctamente.
 *                 data:
 *                   $ref: "#/components/schemas/KnowledgeSource"
 *       400:
 *         description: Datos inválidos o ID de fuente no válido.
 *       401:
 *         description: Usuario no autenticado.
 *       404:
 *         description: Fuente de conocimiento no encontrada.
 *       500:
 *         description: Error interno del servidor.
 */
router.patch("/:id", verifyToken, updateKnowledgeSource);

/**
 * @openapi
 * /api/knowledge/{id}/content:
 *   patch:
 *     summary: Actualiza el contenido de una fuente de conocimiento
 *     tags:
 *       - Knowledge
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID de la fuente de conocimiento.
 *         schema:
 *           type: string
 *         example: 6a7d01f6a112abce629d4438
 *     requestBody:
 *       required: true
 *       description: |
 *         El contenido debe enviarse según el tipo de fuente de conocimiento:
 *         - text: enviar el campo content mediante application/json.
 *         - url: enviar el campo url mediante application/json.
 *         - faq: enviar los campos question y answer mediante application/json.
 *         - pdf: enviar el archivo mediante multipart/form-data usando el campo file.
 *       content:
 *         application/json:
 *           schema:
 *             oneOf:
 *               - title: Fuente de tipo text
 *                 type: object
 *                 required:
 *                   - content
 *                 properties:
 *                   content:
 *                     type: string
 *                     description: Contenido de la fuente de tipo text.
 *                     example: Botilink atiende de lunes a viernes de 8 a 17 hs.
 *
 *               - title: Fuente de tipo url
 *                 type: object
 *                 required:
 *                   - url
 *                 properties:
 *                   url:
 *                     type: string
 *                     format: uri
 *                     description: URL de la fuente de conocimiento.
 *                     example: https://learnwebscraping.dev/
 *
 *               - title: Fuente de tipo faq
 *                 type: object
 *                 required:
 *                   - question
 *                   - answer
 *                 properties:
 *                   question:
 *                     type: string
 *                     description: Pregunta de la FAQ.
 *                     example: ¿Cuál es el horario de atención?
 *                   answer:
 *                     type: string
 *                     description: Respuesta asociada a la pregunta.
 *                     example: Atendemos de lunes a viernes de 8 a 17 hs.
 *
 *         multipart/form-data:
 *           schema:
 *             title: Fuente de tipo pdf
 *             type: object
 *             required:
 *               - file
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: Archivo PDF de la fuente de conocimiento.
 *     responses:
 *       200:
 *         description: Contenido de la fuente actualizado correctamente.
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
 *                   example: Contenido de la fuente actualizado correctamente.
 *                 data:
 *                   $ref: "#/components/schemas/KnowledgeSource"
 *       400:
 *         description: Datos inválidos, contenido faltante o archivo PDF no válido.
 *       401:
 *         description: Usuario no autenticado.
 *       404:
 *         description: Fuente de conocimiento no encontrada.
 *       500:
 *         description: Error interno del servidor.
 */
router.patch("/:id/content", verifyToken, uploadKnowledgeFile, updateKnowledgeContentSource);

/**
 * @openapi
 * /api/knowledge/{id}:
 *   delete:
 *     summary: Elimina una fuente de conocimiento
 *     tags:
 *       - Knowledge
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID de la fuente de conocimiento.
 *         schema:
 *           type: string
 *         example: 6a7d01f6a112abce629d4438
 *     responses:
 *       200:
 *         description: Fuente de conocimiento eliminada correctamente.
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
 *                   example: Fuente de conocimiento eliminada correctamente.
 *       400:
 *         description: El ID de la fuente de conocimiento no es válido.
 *       401:
 *         description: Usuario no autenticado.
 *       404:
 *         description: Fuente de conocimiento no encontrada.
 *       500:
 *         description: Error interno del servidor.
 */
router.delete("/:id", verifyToken, deleteKnowledgeSource);

export default router;