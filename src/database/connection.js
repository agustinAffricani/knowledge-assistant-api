import { MongoClient } from "mongodb";

if (!process.env.MONGODB_URI) {
    throw new Error("La variable MONGODB_URI no está definida.");
}

const client = new MongoClient(process.env.MONGODB_URI); // Crea una instancia del cliente de MongoDB.

let database;

// Establece la conexión con la base de datos MongoDB.
export async function connectDB() {
    try {
        await client.connect();
        database = client.db();
        await database.command({ ping: 1 });
        console.log("✅ Conexión exitosa a MongoDB");

    } catch (error) {
        console.error("❌ Error al conectar con MongoDB");
        console.error(error);
        process.exit(1);
    }
}

// Obtiene la instancia de la base de datos.
export function getDB() {
    if (!database) {
        throw new Error("La base de datos aún no fue inicializada.");
    }
    return database;
}