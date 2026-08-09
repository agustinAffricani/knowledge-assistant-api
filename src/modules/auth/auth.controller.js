import { register, login, getProfile } from "./auth.service.js";

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

export async function loginUser(req, res) {

    try {

        const result = await login(req.body);

        return res.status(200).json({

            success: true,

            message: "Inicio de sesión exitoso.",

            data: result

        });

    } catch (error) {

        return res.status(error.statusCode || 500).json({

            success: false,

            message: error.message

        });

    }

}

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