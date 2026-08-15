import { register, login, getProfile } from "./auth.service.js";
import { durationToMilliseconds } from "../../utils/duration-to-milliseconds.js";

// Registra un nuevo usuario.
export async function registerUser(req, res) {

    try {

        const user = await register(req.body);

        return res.status(201).json({

            success: true,

            message: "Usuario registrado correctamente.",

            data: user

        });

    } catch (error) {

        return res.status(error.statusCode || 500).json({

            success: false,

            message: error.message

        });

    }
}

// Inicia sesión y devuelve un token JWT en una cookie.
export async function loginUser(req, res) {

    try {

        const result = await login(req.body);

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

    } catch (error) {

        return res.status(error.statusCode || 500).json({

            success: false,

            message: error.message

        });

    }

}

// Obtiene el perfil del usuario autenticado.
export async function profile(req, res) {

    try {

        const user = await getProfile(req.user.id);

        return res.status(200).json({

            success: true,

            data: user

        });

    } catch (error) {

        return res.status(error.statusCode || 500).json({

            success: false,

            message: error.message

        });

    }

}

// Cierra la sesión eliminando la cookie de autenticación.
export async function logoutUser(req, res) {

    try {

        res.clearCookie("authToken", {
            httpOnly: true,
            secure: false,
            sameSite: "lax"
        });

        return res.status(200).json({

            success: true,

            message: "Sesión cerrada correctamente."

        });

    } catch (error) {

        return res.status(error.statusCode || 500).json({

            success: false,

            message: error.message

        });

    }

}