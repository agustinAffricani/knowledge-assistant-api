import "dotenv/config";
import app from "./app.js";
import { connectDB } from "./database/connection.js";

const PORT = process.env.PORT || 3000;

async function startServer() {
    await connectDB();
    app.listen(PORT, () => {
        console.log(`🚀 Servidor iniciado en http://localhost:${PORT}`);
    });
}

startServer();