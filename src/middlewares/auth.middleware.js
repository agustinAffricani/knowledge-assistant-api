import jwt from "jsonwebtoken";

// Manejador de autenticación
export function verifyToken(req, res, next) {
    const tokenFromCookie = req.cookies.authToken;
    const authHeader = req.headers.authorization;
    const tokenFromHeader =
        authHeader && authHeader.startsWith("Bearer ")
            ? authHeader.split(" ")[1]
            : null;
    const token = tokenFromCookie || tokenFromHeader;
    if (!token) {
        return res.status(401).json({
            success: false,
            message: "Token no proporcionado."
        });
    }
    try {
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );
        req.user = decoded;
        next();
    } catch {
        return res.status(401).json({
            success: false,
            message: "Token inválido o expirado."
        });
    }
}