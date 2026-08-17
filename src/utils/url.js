import { JSDOM } from "jsdom";
import { Readability } from "@mozilla/readability";

// Valida que la URL sea pública y utilice HTTP o HTTPS.
function validateUrl(url) {
    let parsedUrl;
    try {
        parsedUrl = new URL(url);
    } catch {
        const error = new Error(
            "La URL no es válida."
        );
        error.statusCode = 400;
        throw error;
    }
    if (!["http:", "https:"].includes(parsedUrl.protocol)) {
        const error = new Error(
            "Solo se permiten URLs HTTP o HTTPS."
        );
        error.statusCode = 400;
        throw error;
    }
    const hostname = parsedUrl.hostname.toLowerCase();
    // Lista de hosts bloqueados para evitar solicitudes a recursos locales o internos.
    const blockedHosts = [
        "localhost",
        "127.0.0.1",
        "0.0.0.0",
        "::1"
    ];
    if (blockedHosts.includes(hostname)) {
        const error = new Error(
            "La URL apunta a un destino no permitido."
        );
        error.statusCode = 400;
        throw error;
    }
    return parsedUrl.toString();
}

// Extrae el contenido principal de una URL.
export async function extractUrlText(url) {
    if (!url || !url.trim()) {
        const error = new Error(
            "La URL es obligatoria."
        );
        error.statusCode = 400;
        throw error;
    }
    const validatedUrl = validateUrl(url.trim());
    try {
        const controller = new AbortController();
        const timeout = setTimeout(() => {
            controller.abort(); // Aborta la solicitud si tarda demasiado.
        }, 10000);
        let response;
        try {
            response = await fetch(
                validatedUrl,
                {
                    signal: controller.signal
                }
            );
        } finally {
            clearTimeout(timeout);
        }
        if (!response.ok) {
            const error = new Error(
                "No fue posible obtener el contenido de la URL."
            );
            error.statusCode = 400;
            throw error;
        }
        const html = await response.text();
        // Utiliza JSDOM y Readability para extraer el contenido principal de la página.
        const dom = new JSDOM(
            html,
            {
                url: validatedUrl,
                runScripts: "outside-only",
                resources: "usable"
            }
        );
        const reader = new Readability(
            dom.window.document
        );
        const article = reader.parse();
        if (!article || !article.textContent?.trim()) {
            const error = new Error(
                "No fue posible extraer contenido útil de la URL."
            );
            error.statusCode = 400;
            throw error;
        }
        return article.textContent.trim();
    } catch (error) {
        console.error("URL extraction error:", error);
        if (error.statusCode) {
            throw error;
        }
        const urlError = new Error(
            "No fue posible obtener el contenido de la URL."
        );
        urlError.statusCode = 400;
        throw urlError;
    }
}