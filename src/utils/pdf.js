import fs from "fs/promises";

import { PDFParse } from "pdf-parse";

// Extrae el texto de un archivo PDF.
export async function extractPdfText(filePath) {

    try {

        const fileBuffer = await fs.readFile(filePath);

        const parser = new PDFParse({
            data: fileBuffer
        });

        const result = await parser.getText();

        await parser.destroy();

        return result.text;

    } catch (error) {

        console.error("PDF extraction error:", error);

        const pdfError = new Error(
            "No fue posible extraer el texto del archivo PDF."
        );

        pdfError.statusCode = 400;

        throw pdfError;

    }

}

// Elimina un archivo PDF si existe.
export async function deletePdfFile(filePath) {

    if (!filePath) {
        return;
    }

    try {

        await fs.unlink(filePath);

    } catch (error) {

        if (error.code !== "ENOENT") {
            throw error;
        }

    }

}