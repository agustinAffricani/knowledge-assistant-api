import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { ObjectId } from "mongodb";
import { getDB } from "../../database/connection.js";
import { COLLECTIONS } from "../../constants/collections.js";

//Registro de usuario
export async function register(data) {

    const { name, email, password, businessName } = data;
    if (!name || !email || !password || !businessName) {

        const error = new Error("Todos los campos son obligatorios.");

        error.statusCode = 400;

        throw error;

    }

    const normalizedEmail = email.trim().toLowerCase();
    const usersCollection = getDB().collection(COLLECTIONS.USERS);

    const existingUser = await usersCollection.findOne({
        normalizedEmail
    });

    if (existingUser) {
        const error = new Error("Ya existe un usuario registrado con ese correo electrónico.");
        error.statusCode = 409;
        throw error;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = {

        name,

        email: normalizedEmail,

        password: hashedPassword,

        businessName,

        createdAt: new Date(),

        updatedAt: new Date()

    };

    const result = await usersCollection.insertOne(newUser);

    return {

        id: result.insertedId,

        name,

        normalizedEmail,

        businessName

    };

}

//Login de usuario
export async function login(data) {

    const { email, password } = data;

    if (!email || !password) {

        const error = new Error("El correo electrónico y la contraseña son obligatorios.");

        error.statusCode = 400;

        throw error;

    }

    const normalizedEmail = email.trim().toLowerCase();

    const usersCollection = getDB().collection(COLLECTIONS.USERS);

    const user = await usersCollection.findOne({
        email: normalizedEmail
    });

    if (!user) {

        const error = new Error("Correo electrónico o contraseña incorrectos.");

        error.statusCode = 401;

        throw error;

    }

    const passwordMatch = await bcrypt.compare(
        password,
        user.password
    );

    if (!passwordMatch) {

        const error = new Error("Correo electrónico o contraseña incorrectos.");

        error.statusCode = 401;

        throw error;

    }

    const token = jwt.sign(

        {
            id: user._id,
            email: user.email
        },

        process.env.JWT_SECRET,

        {
            expiresIn: process.env.JWT_EXPIRES_IN || "24h"
        }

    );

    return {

        token,

        user: {

            id: user._id,

            name: user.name,

            email: user.email,

            businessName: user.businessName

        }

    };

}

//Obtener perfil de usuario
export async function getProfile(userId) {

    const usersCollection = getDB().collection(COLLECTIONS.USERS);

    const user = await usersCollection.findOne({
        _id: new ObjectId(userId)
    });

    if (!user) {

        const error = new Error("Usuario no encontrado.");

        error.statusCode = 404;

        throw error;

    }

    return {

        id: user._id,

        name: user.name,

        email: user.email,

        businessName: user.businessName

    };

}