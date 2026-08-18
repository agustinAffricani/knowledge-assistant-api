import swaggerJsdoc from "swagger-jsdoc";

const options = {

    definition: {

        openapi: "3.0.0",

        info: {
            title: "Knowledge Source API",
            version: "1.0.0",
            description: "API para gestión de chatbots y fuentes de conocimiento."
        },

        components: {

            securitySchemes: {

                cookieAuth: {
                    type: "apiKey",
                    in: "cookie",
                    name: "authToken",
                    description: "Cookie HttpOnly que contiene el JWT de autenticación."
                }

            },

            schemas: {

                User: {
                    type: "object",
                    properties: {
                        id: {
                            type: "string",
                            example: "6a773c7554824ba262d04685"
                        },
                        name: {
                            type: "string",
                            example: "Juan Agustín Affricani"
                        },
                        email: {
                            type: "string",
                            format: "email",
                            example: "juan@email.com"
                        },
                        businessName: {
                            type: "string",
                            example: "Botilink"
                        }
                    }
                },

                Chatbot: {
                    type: "object",
                    properties: {
                        _id: {
                            type: "string",
                            example: "6a7e1a76ddbd76c65f35cbe2"
                        },
                        userId: {
                            type: "string",
                            example: "6a773c7554824ba262d04685"
                        },
                        name: {
                            type: "string",
                            example: "Asistente de Ventas"
                        },
                        description: {
                            type: "string",
                            example: "Responde consultas comerciales."
                        },
                        isActive: {
                            type: "boolean",
                            example: true
                        },
                        purpose: {
                            type: "string",
                            example: "Ventas y atención comercial."
                        },
                        knowledgeIds: {
                            type: "array",
                            items: {
                                type: "string"
                            },
                            example: [ "6a7d01f6a112abce629d4438",
                                     "6a80cc7a5e29a2f14f300590"],
                            description: "IDs de fuentes de conocimiento asociadas al chatbot. Es opcional y puede contener múltiples fuentes de distintos tipos. Al actualizar el chatbot, la lista enviada reemplaza la configuración anterior."
                        },
                        createdAt: {
                            type: "string",
                            format: "date-time",
                            example: "2026-08-13T19:26:46.978Z"
                        },
                        updatedAt: {
                            type: "string",
                            format: "date-time",
                            example: "2026-08-14T20:51:14.185Z"
                        }
                    }
                },

                KnowledgeSource: {
                    type: "object",
                    description: "Datos originales de la fuente de conocimiento. Su contenido depende del tipo de fuente.",
                    properties: {
                        _id: {
                            type: "string",
                            example: "6a7d01f6a112abce629d4438"
                        },
                        userId: {
                            type: "string",
                            example: "6a773c7554824ba262d04685"
                        },
                        type: {
                            type: "string",
                            enum: [
                                "text",
                                "pdf",
                                "url",
                                "faq"
                            ],
                            example: "text"
                        },
                        title: {
                            type: "string",
                            example: "Información general"
                        },
                        description: {
                            type: "string",
                            example: "Descripción general de la fuente de conocimiento."
                        },
                        isActive: {
                            type: "boolean",
                            example: true
                        },
                        status: {
                            type: "string",
                            enum: [
                                "pending",
                                "ready"
                            ],
                            description: "Estado de procesamiento de la fuente de conocimiento.",
                            example: "pending"
                        },
                        processedContent: {
                            type: "string",
                            example: "Contenido procesado que el sistema utiliza para recuperación semántica. Se encuentra disponible una vez que la fuente fue procesada correctamente.",
                        },
                        createdAt: {
                            type: "string",
                            format: "date-time",
                            example: "2026-08-12T23:29:58.926Z"
                        },
                        updatedAt: {
                            type: "string",
                            format: "date-time",
                            example: "2026-08-13T00:26:54.986Z"
                        }
                    }
                },

                ChatResponse: {
                    type: "object",
                    properties: {
                        success: {
                            type: "boolean",
                            example: true
                        },
                        data: {
                            type: "object",
                            properties: {
                                answer: {
                                    type: "string",
                                    example: "El Plan Pro cuesta $50.000 mensuales."
                                },
                                sessionId: {
                                    type: "string",
                                    description: "Identificador de la conversación. En la primera consulta es generado por el servidor y debe reutilizarse en las siguientes consultas para mantener el historial de la conversación.",
                                    example: "85441acd-e683-4e7e-9413-4cfee84136dc"
                                }
                            }
                        }
                    }
                }
            }
        }
    },

    apis: [
        "./src/modules/**/*.routes.js"
    ]

};

export const swaggerSpec = swaggerJsdoc(options);