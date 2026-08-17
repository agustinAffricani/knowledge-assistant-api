import { register, login, getProfile } from "./auth.service.js";
import { durationToMilliseconds } from "../../utils/duration-to-milliseconds.js";

// Registra un nuevo usuario.
export async function registerUser(req, res) {
    const user = await register(req.body);
    return res.status(201).json({
        success: true,
        message: "Usuario registrado correctamente.",
        data: user
    });
}

// Inicia sesión y devuelve un token JWT en una cookie.
export async function loginUser(req, res) {
    const result = await login(req.body);
    // Configura la cookie de autenticación con el token JWT.
    res.cookie("authToken", result.token, {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
        maxAge: durationToMilliseconds(
            process.env.COOKIE_EXPIRES_IN
        )
    });
    return res.status(200).json({
        success: true,
        message: "Inicio de sesión exitoso.",
        data: {
            user: result.user
        }
    });
}

// Obtiene el perfil del usuario autenticado.
export async function profile(req, res) {
    const user = await getProfile(req.user.id);
    return res.status(200).json({
        success: true,
        data: user
    });
}

// Cierra la sesión eliminando la cookie de autenticación.
export async function logoutUser(req, res) {
    // Elimina la cookie de autenticación estableciendo su valor en vacío y maxAge en 0.
    res.clearCookie("authToken", {
        httpOnly: true,
        secure: false,
        sameSite: "lax"
    });
    return res.status(200).json({
        success: true,
        message: "Sesión cerrada correctamente."
    });
}