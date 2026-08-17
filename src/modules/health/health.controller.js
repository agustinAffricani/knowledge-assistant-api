export function health(req, res) {
    res.status(200).json({
        success: true,
        message: "API funcionando correctamente.",
        data: {

            status: "OK",

            application: "Knowledge Assistant API",

            version: "1.0.0",

            timestamp: new Date()

        }
    });
}