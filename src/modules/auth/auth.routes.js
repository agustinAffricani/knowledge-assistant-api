import { Router } from "express";
import { registerUser, loginUser, profile, logoutUser } from "./auth.controller.js";
import { verifyToken } from "../../middlewares/auth.middleware.js";

const router = Router();

/**
 * @openapi
 * /api/auth/register:
 *   post:
 *     summary: Registra un nuevo usuario
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *               - businessName
 *             properties:
 *               name:
 *                 type: string
 *                 example: Juan Agustín Affricani
 *               email:
 *                 type: string
 *                 format: email
 *                 example: juan@email.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: Password123!
 *               businessName:
 *                 type: string
 *                 example: Botilink
 *     responses:
 *       201:
 *         description: Usuario registrado correctamente.
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
 *                   example: Usuario registrado correctamente.
 *                 data:
 *                   $ref: "#/components/schemas/User"
 *       400:
 *         description: Datos inválidos o campos obligatorios faltantes.
 *       409:
 *         description: El email ya está registrado.
 *       500:
 *         description: Error interno del servidor.
 */
router.post("/register", registerUser);

/**
 * @openapi
 * /api/auth/login:
 *   post:
 *     summary: Inicia sesión y establece la cookie de autenticación
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: juan@email.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: Password123!
 *     responses:
 *       200:
 *         description: |
 *           Inicio de sesión exitoso. El JWT se almacena en una cookie HttpOnly
 *           llamada authToken. La cookie es enviada automáticamente en las
 *           solicitudes posteriores.
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
 *                   example: Inicio de sesión exitoso.
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       $ref: "#/components/schemas/User"
 *       400:
 *         description: Datos inválidos.
 *       401:
 *         description: Credenciales inválidas.
 *       500:
 *         description: Error interno del servidor.
 */
router.post("/login", loginUser);

/**
 * @openapi
 * /api/auth/logout:
 *   post:
 *     summary: Cierra la sesión del usuario
 *     tags:
 *       - Auth
 *     responses:
 *       200:
 *         description: Sesión cerrada correctamente. Se elimina la cookie de autenticación.
 */
router.post("/logout", logoutUser);

/**
 * @openapi
 * /api/auth/profile:
 *   get:
 *     summary: Obtiene el perfil del usuario autenticado
 *     tags:
 *       - Auth
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Datos del usuario autenticado.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: "#/components/schemas/User"
 *       401:
 *         description: Token no proporcionado, inválido o expirado.
 *       500:
 *         description: Error interno del servidor.
 */
router.get("/profile", verifyToken, profile);

export default router;