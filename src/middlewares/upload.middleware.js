import multer from "multer";
import path from "path";
import crypto from "crypto";
import fs from "fs";

// Directorio donde se almacenarán los archivos PDF subidos.
const uploadDirectory = path.resolve(
    "uploads",
    "knowledge"
);

if (!fs.existsSync(uploadDirectory)) {
    fs.mkdirSync(uploadDirectory, {
        recursive: true
    });
}

// Configuración de almacenamiento para multer.
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDirectory);
    },
    filename: (req, file, cb) => {
        const extension = path.extname(file.originalname);
        const uniqueName = `${crypto.randomUUID()}${extension}`;
        cb(null, uniqueName);
    }
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype !== "application/pdf") {
        return cb(
            new Error("Solo se permiten archivos PDF.")
        );
    }
    cb(null, true);
};

// Configuración de multer para la carga de archivos PDF.
export const uploadKnowledgeFile = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024
    }
}).single("file");