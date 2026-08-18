# Knowledge Source API

API backend para la creación y gestión de chatbots capaces de responder consultas utilizando una base de conocimiento propia.

El proyecto implementa un flujo RAG (Retrieval-Augmented Generation): las fuentes de conocimiento se procesan, se generan embeddings y se almacenan en MongoDB para realizar búsquedas semánticas. El contexto recuperado se utiliza posteriormente para generar la respuesta mediante OpenAI.

---

## 📚 Índice

- [1. Descripción del proyecto](#descripcion-del-proyecto)
- [2. Tecnologías principales](#tecnologias-principales)
- [3. Requisitos previos y configuración](#requisitos-previos-y-configuracion)
  - [3.1. MongoDB](#mongodb)
  - [3.2. Vector Search](#vector-search)
  - [3.3. Configuración del índice](#configuracion-del-indice)
  - [3.4. Variables de entorno](#variables-de-entorno)
- [4. Arquitectura general](#arquitectura-general)
  - [4.1. Flujo de la empresa / usuario](#flujo-de-la-empresa-usuario)
  - [4.2. Flujo del visitante](#flujo-del-visitante)
  - [4.3. Cómo se relacionan ambos flujos](#como-se-relacionan-ambos-flujos)
  - [4.4. Capas principales](#capas-principales)
- [5. Autenticación](#autenticacion)
  - [5.1. Registro](#registro)
  - [5.2. Login](#login)
  - [5.3. Logout](#logout)
- [6. Manejo centralizado de errores](#manejo-centralizado-de-errores)
- [7. Fuentes de conocimiento](#fuentes-de-conocimiento)
  - [7.1. Fuente `text`](#fuente-text)
  - [7.2. Fuente `pdf`](#fuente-pdf)
  - [7.3. Fuente `url`](#fuente-url)
  - [7.4. Fuente `faq`](#fuente-faq)
- [8. Estados de una fuente de conocimiento](#estados-de-una-fuente-de-conocimiento)
- [9. Constantes y estructura de datos](#constantes-y-estructura-de-datos)
  - [9.1. Colecciones de MongoDB](#colecciones-de-mongodb)
  - [9.2. Tipos de fuentes de conocimiento](#tipos-de-fuentes-de-conocimiento)
  - [9.3. Estados de procesamiento](#estados-de-procesamiento)
- [10. Embeddings y búsqueda semántica](#embeddings-y-busqueda-semantica)
- [11. Filtros de recuperación](#filtros-de-recuperacion)
- [12. Chatbots y `knowledgeIds`](#chatbots-y-knowledgeids)
- [13. Endpoint público del chatbot](#endpoint-publico-del-chatbot)
- [14. Historial conversacional](#historial-conversacional)
- [15. Preguntas de seguimiento](#preguntas-de-seguimiento)
- [16. Comportamiento conversacional de la IA](#comportamiento-conversacional-de-la-ia)
- [17. Contexto y respuestas sin información](#contexto-y-respuestas-sin-informacion)
- [18. Documentación Swagger / OpenAPI](#documentacion-swagger-openapi)
- [19. Principales endpoints](#principales-endpoints)
  - [19.1. Auth](#auth)
  - [19.2. Knowledge](#knowledge)
  - [19.3. Chatbots](#chatbots)
- [20. Ejecución local](#ejecucion-local)
- [21. Almacenamiento de archivos](#almacenamiento-de-archivos)
  - [21.1. Identificación de los archivos PDF](#identificacion-de-los-archivos-pdf)
- [22. Estructura general del proyecto](#estructura-general-del-proyecto)
  - [22.1. Archivos y carpetas principales](#archivos-y-carpetas-principales)
- [23. Decisiones de diseño relevantes](#decisiones-de-diseno-relevantes)
  - [23.1. Separación entre extracción y recuperación](#separacion-entre-extraccion-y-recuperacion)
  - [23.2. Persistencia del historial](#persistencia-del-historial)
  - [23.3. Aislamiento por usuario](#aislamiento-por-usuario)
  - [23.4. Errores centralizados](#errores-centralizados)
  - [23.5. Cookie HttpOnly](#cookie-httponly)
  - [23.6. Umbral de relevancia](#umbral-de-relevancia)
- [24. Flujo completo de uso](#flujo-completo-de-uso)

<a id="descripcion-del-proyecto"></a>
## 📌 1. Descripción del proyecto

La API permite que se:

- registre una cuenta y gestione su sesión;
- cree y administre uno o varios chatbots;
- agregue fuentes de conocimiento de distintos tipos;
- procese esas fuentes y genere embeddings;
- asocie múltiples fuentes a un chatbot;
- exponga un endpoint público para que visitantes puedan realizar consultas;
- mantenga un historial conversacional mediante `sessionId`;
- responda a preguntas utilizando el contexto de la conversación.

El proyecto fue desarrollado como una API REST con Node.js y Express.

---

<a id="tecnologias-principales"></a>
## 🧰 2. Tecnologías principales

- Node.js
- Express
- MongoDB
- MongoDB Vector Search
- OpenAI API
- JWT
- Cookies `HttpOnly`
- Multer
- `pdf-parse`
- `@mozilla/readability`
- `jsdom`
- Swagger / OpenAPI 3

---

<a id="requisitos-previos-y-configuracion"></a>
## ⚙️ 3. Requisitos previos y configuración

Antes de ejecutar el proyecto se necesitan:

- Node.js 22.x
- Una instancia de MongoDB
- Una API Key válida de OpenAI

<a id="mongodb"></a>
### 3.1. MongoDB

El proyecto utiliza MongoDB para almacenar:

- usuarios;
- chatbots;
- fuentes de conocimiento;
- conversaciones.

La URI de MongoDB **no se incluye en el repositorio**. Cada entorno debe utilizar su propia instancia y sus propias credenciales.

La aplicación utiliza la variable:

```env
MONGODB_URI=mongodb+srv://<usuario>:<password>@<cluster>/<base_de_datos>
```

`MONGODB_URI` debe contener la URI de conexión correspondiente a la instancia de MongoDB utilizada para ejecutar el proyecto. El nombre de la base de datos se especifica en la propia URI y puede ser elegido por quien configure el entorno.

Durante el desarrollo se utilizó como ejemplo la base:

```text
knowledge_assistant_db
```

Este nombre no constituye un requisito del proyecto.

<a id="vector-search"></a>
### 3.2. Vector Search

Para que la búsqueda semántica funcione correctamente es necesario crear un índice de tipo **Vector Search** sobre la colección:

```text
knowledge
```

El índice utilizado por la aplicación es:

```text
knowledge_vector_index
```

#### Creación del índice

En MongoDB Atlas:

1. Ingresar al proyecto y seleccionar el cluster utilizado por la aplicación.
2. Abrir **Database** y seleccionar la colección `knowledge`.
3. Ir a la pestaña **Indexes**.
4. Seleccionar la opción para crear un índice de **Vector Search**.
5. Utilizar como nombre del índice:

```text
knowledge_vector_index
```

6. Configurar el índice con el siguiente contenido:

```json
{
  "fields": [
    {
      "type": "vector",
      "path": "embedding",
      "numDimensions": 1536,
      "similarity": "cosine"
    },
    {
      "type": "filter",
      "path": "userId"
    },
    {
      "type": "filter",
      "path": "_id"
    },
    {
      "type": "filter",
      "path": "isActive"
    },
    {
      "type": "filter",
      "path": "status"
    }
  ]
}
```

<a id="configuracion-del-indice"></a>
### 3.3. Configuración del índice

- **Tipo de índice:** Vector Search
- **Nombre:** `knowledge_vector_index`
- **Campo vectorial:** `embedding`
- **Dimensiones:** `1536`
- **Métrica de similitud:** `cosine`

También se definen como campos de filtro:

```text
userId
_id
isActive
status
```

El campo `embedding` contiene el vector generado para cada fuente de conocimiento procesada.

Los campos de filtro permiten restringir la recuperación a las fuentes que cumplen las condiciones utilizadas por la aplicación.

Una vez creado, el índice debe encontrarse en estado:

```text
READY
```

Sin este índice, las consultas que utilizan embeddings no podrán ejecutar correctamente la recuperación semántica.
<a id="variables-de-entorno"></a>
### 3.4. Variables de entorno

El archivo `.env` utiliza las siguientes variables:

```env
PORT=3000

MONGODB_URI=mongodb+srv://<usuario>:<password>@<cluster>/<base_de_datos>

OPENAI_API_KEY=your_openai_api_key
OPENAI_MODEL=gpt-5.5

JWT_SECRET=una_clave_larga_y_dificil_de_adivinar
JWT_EXPIRES_IN=24h

COOKIE_EXPIRES_IN=24h
```



<a id="arquitectura-general"></a>
## 🏗️ 4. Arquitectura general

El sistema se puede entender a partir de dos recorridos principales: **la empresa configura su chatbot y sus fuentes de conocimiento**, mientras que **el visitante utiliza ese chatbot para realizar consultas**.

<a id="flujo-de-la-empresa-usuario"></a>
### 👤 4.1. Flujo de la empresa / usuario

```text
┌───────────────────────────────┐
│        Empresa / Usuario      │
└───────────────┬───────────────┘
                │
                ▼
        Registro / Login
                │
                ▼
         Crear Chatbot
                │
                ▼
     Crear fuente de Knowledge
                │
        ┌───────┼────────┬────────┐
        ▼       ▼        ▼        ▼
      TEXT     PDF      URL      FAQ
        │       │        │        │
        └───────┴────────┴────────┘
                │
                ▼
       Procesamiento del contenido
                │
                ▼
         `processedContent`
                │
                ▼
       Generación del embedding
                │
                ▼
       MongoDB + Vector Search
                │
                ▼
      Asociar fuentes al Chatbot
```

<a id="flujo-del-visitante"></a>
### 🌐 4.2. Flujo del visitante

```text
┌───────────────────────────────┐
│           Visitante           │
└───────────────┬───────────────┘
                │
                ▼
        Chatbot público
                │
                ▼
            Pregunta
                │
                ▼
      Historial de conversación
                │
                ▼
       Consulta contextual
                │
                ▼
       MongoDB Vector Search
                │
                ▼
      Knowledge relevante
                │
                ▼
    ┌─────────────────────────┐
    │  Historial + Contexto   │
    └────────────┬────────────┘
                 │
                 ▼
              OpenAI
                 │
                 ▼
             Respuesta
                 │
                 ▼
        Guardar conversación
```

<a id="como-se-relacionan-ambos-flujos"></a>
### 🔄 4.3. Cómo se relacionan ambos flujos

```text
EMPRESA / USUARIO
       │
       ▼
 Configura Chatbot
       │
       ▼
 Carga Knowledge
       │
       ▼
 MongoDB + Embeddings
       │
       │
       │   ┌───────────────────────────┐
       └──►│     CHATBOT PÚBLICO       │◄── Visitante
           └─────────────┬─────────────┘
                         │
                         ▼
                 Vector Search
                         │
                         ▼
                Knowledge relevante
                         │
                         ▼
                      OpenAI
                         │
                         ▼
                    Respuesta
```

<a id="capas-principales"></a>
### 🧩 4.4. Capas principales

```text
Routes
  ↓
Controllers
  ↓
Services
  ↓
MongoDB / OpenAI / Utilities
```

El manejo de errores se centraliza mediante un middleware global, mientras que los controllers reciben la petición, invocan los services y construyen la respuesta HTTP.

<a id="autenticacion"></a>
## 🔐 5. Autenticación

La API utiliza JWT para la autenticación.

El JWT se almacena en una cookie de autenticación:

```text
authToken
```

La cookie se configura como `HttpOnly`, por lo que no puede ser leída directamente por JavaScript del navegador.

El flujo es:

```text
Login
  |
  v
Generación de JWT
  |
  v
Cookie HttpOnly
  |
  v
Solicitudes autenticadas
  |
  v
verifyToken
```
<a id="registro"></a>

### 5.1. Registro

El registro permite crear un nuevo usuario proporcionando los datos requeridos por la API.

Los datos necesarios son:

- nombre;
- email;
- contraseña;
- nombre del negocio.

El email se normaliza antes de almacenarse y no se permite registrar otro usuario con el mismo correo electrónico.

<a id="login"></a>
### 5.2. Login

El endpoint de login no devuelve el JWT directamente dentro del JSON de respuesta. El token se establece mediante la cookie de autenticación.

<a id="logout"></a>
### 5.3. Logout

El logout elimina la cookie de autenticación.

<a id="importante"></a>
### Importante

En el entorno de desarrollo local la cookie puede utilizar `secure: false` para permitir el funcionamiento con HTTP. En un entorno de producción se recomienda utilizar HTTPS y `Secure`.

---

<a id="manejo-centralizado-de-errores"></a>
## ⚠️ 6. Manejo centralizado de errores

La API utiliza un middleware global para centralizar las respuestas de error.

Los servicios generan errores con:

```javascript
const error = new Error("Mensaje del error.");
error.statusCode = 400;
throw error;
```

El middleware transforma ese error en una respuesta HTTP uniforme:

```json
{
  "success": false,
  "message": "Mensaje del error."
}
```

Cuando el error no tiene un `statusCode`, se utiliza `500`.

En ese caso, la respuesta pública utiliza:

```json
{
  "success": false,
  "message": "Error interno del servidor."
}
```

---

<a id="fuentes-de-conocimiento"></a>
## 📚 7. Fuentes de conocimiento

la API admite cuatro tipos de fuentes de conocimiento:

```text
text
pdf
url
faq
```

Todas las fuentes terminan siguiendo el mismo flujo interno:

```text
Fuente original
      |
      v
Procesamiento
      |
      v
processedContent
      |
      v
Embedding
      |
      v
status = ready
```

De esta manera, el chatbot no necesita conocer cómo fue creada la fuente. Solo necesita disponer de contenido procesado y su representación vectorial.

---

<a id="fuente-text"></a>
### 7.1. Fuente `text`

Recibe contenido directamente.

Ejemplo:

```json
{
  "content": "La empresa atiende de lunes a viernes de 8 a 17 hs."
}
```

El contenido se procesa mediante `processKnowledgeContent()` y posteriormente se genera el embedding.

---

<a id="fuente-pdf"></a>
### 7.2. Fuente `pdf`

Los archivos PDF se reciben mediante `multipart/form-data`.

El archivo se almacena físicamente en:

```text
uploads/knowledge/
```

El nombre físico del archivo se genera mediante un UUID para evitar colisiones.

Flujo:

```text
PDF
 |
 v
Multer
 |
 v
uploads/knowledge/
 |
 v
extractPdfText()
 |
 v
processKnowledgeContent()
 |
 v
generateEmbedding()
 |
 v
MongoDB
```

Cuando se reemplaza un PDF correctamente:

```text
PDF anterior
    |
    v
procesamiento del nuevo PDF
    |
    v
actualización de MongoDB
    |
    v
eliminación del PDF anterior
```

Si el procesamiento del nuevo archivo falla, el archivo nuevo se elimina y el anterior se conserva.

Una fuente PDF recién creada comienza con:

```text
status = pending
```

y pasa a:

```text
status = ready
```

cuando el procesamiento finaliza correctamente.

---

<a id="fuente-url"></a>
### 7.3. Fuente `url`

Las fuentes URL obtienen contenido desde una página web.

Flujo:

```text
URL
 |
 v
fetch
 |
 v
HTML
 |
 v
JSDOM
 |
 v
Mozilla Readability
 |
 v
texto principal
 |
 v
processKnowledgeContent()
 |
 v
generateEmbedding()
```

Se busca extraer el contenido principal de la página evitando elementos innecesarios como navegación, menús y otros elementos que no forman parte del contenido principal.

La validación actual implementa una protección básica:

- solo se permiten `http` y `https`;
- se bloquean destinos locales conocidos como `localhost` y algunas direcciones locales;
- existe un timeout para limitar el tiempo de espera.

Como mejora futura puede implementarse una protección SSRF más completa, incluyendo validación exhaustiva de redirecciones, DNS rebinding y otros casos.

---

<a id="fuente-faq"></a>
### 7.4. Fuente `faq`

Las FAQ se almacenan conservando explícitamente la pregunta y la respuesta:

```json
{
  "question": "¿Cuál es el horario de atención?",
  "answer": "Atendemos de lunes a viernes de 8 a 17 hs."
}
```

Para la recuperación semántica se genera una representación textual:

```text
Pregunta: ¿Cuál es el horario de atención?
Respuesta: Atendemos de lunes a viernes de 8 a 17 hs.
```

Ese contenido se procesa y posteriormente se utiliza para generar el embedding.

Esto permite que una consulta como:

```text
¿Cuándo están abiertos?
```

pueda recuperar una FAQ cuya pregunta original fue:

```text
¿Cuál es el horario de atención?
```

---

<a id="estados-de-una-fuente-de-conocimiento"></a>
## 🔄 8. Estados de una fuente de conocimiento

Las fuentes pueden encontrarse principalmente en estos estados:

<a id="pending"></a>
### `pending`

La fuente fue creada pero todavía no terminó su procesamiento.

<a id="ready"></a>
### `ready`

El contenido fue procesado correctamente y está disponible para la recuperación semántica.

---

<a id="constantes-y-estructura-de-datos"></a>
## 🗂️ 9. Constantes y estructura de datos

El proyecto centraliza las constantes relacionadas con MongoDB y con las fuentes de conocimiento para evitar valores repetidos en distintos módulos.

<a id="colecciones-de-mongodb"></a>
### 9.1. Colecciones de MongoDB

Los nombres de las colecciones se definen mediante `COLLECTIONS`.

Colecciones utilizadas por la aplicación:

```text
users
knowledge
conversations
chatbots
```

Estas constantes se utilizan para acceder a las colecciones desde los servicios sin depender de strings repetidos.

<a id="tipos-de-fuentes-de-conocimiento"></a>
### 9.2. Tipos de fuentes de conocimiento

Los tipos disponibles se definen mediante `KNOWLEDGE_TYPES`:

```text
text
pdf
url
faq
```

Cada tipo determina cómo se obtiene y procesa el contenido de la fuente.

<a id="estados-de-procesamiento"></a>
### 9.3. Estados de procesamiento

Los estados definidos para las fuentes son:

```text
pending
processing
ready
error
```

El estado representa el ciclo de procesamiento de una fuente:

```text
pending
   |
   v
processing
   |
   +----> ready
   |
   +----> error
```

En el flujo actual, una fuente recién creada comienza como `pending` y, una vez procesada correctamente, pasa a `ready`.

Los estados `processing` y `error` forman parte de las constantes del dominio y permiten representar estados intermedios o de fallo del procesamiento.

<a id="embeddings-y-busqueda-semantica"></a>
## 🔎 10. Embeddings y búsqueda semántica

Para cada fuente procesada se genera un embedding.

También se genera un embedding para la consulta del visitante.

El sistema no compara los valores numéricos de los embeddings buscando igualdad exacta. Los compara según cercanía semántica utilizando MongoDB Vector Search.

El flujo es:

```text
Pregunta del visitante
        |
        v
Embedding de la pregunta
        |
        v
MongoDB Vector Search
        |
        v
Fuentes más cercanas semánticamente
```

Después se aplica un umbral de relevancia (`threshold`) para descartar resultados insuficientemente relacionados.

Esto evita utilizar como contexto fuentes cuya similitud sea demasiado baja.

---

<a id="filtros-de-recuperacion"></a>
## 🎯 11. Filtros de recuperación

La búsqueda vectorial no se realiza sobre toda la base de datos.

La recuperación está restringida por:

- usuario propietario de la fuente;
- fuentes asociadas al chatbot;
- estado de la fuente;
- disponibilidad de la fuente.

Esto permite aislar el conocimiento entre distintos Usuarios.

Por ejemplo:

```text
Usuario A
  |
  +--> PDF A

Usuario B
  |
  +--> PDF B
```

Aunque ambos PDFs contengan información muy similar, el chatbot de B solo puede recuperar fuentes permitidas para B.

---

<a id="chatbots-y-knowledgeids"></a>
## 🤖 12. Chatbots y `knowledgeIds`

Un chatbot puede tener múltiples fuentes de conocimiento.

Por ejemplo:

```json
{
  "knowledgeIds": [
    "fuente-text",
    "fuente-pdf",
    "fuente-url",
    "fuente-faq"
  ]
}
```

Las fuentes pueden ser de distintos tipos.

<a id="importante"></a>
### Importante

`knowledgeIds` representa la lista final de fuentes asociadas al chatbot.

Por ejemplo, si el chatbot actualmente tiene:

```json
{
  "knowledgeIds": ["A", "B"]
}
```

y se envía:

```json
{
  "knowledgeIds": ["A", "B", "C"]
}
```

el estado final será:

```json
{
  "knowledgeIds": ["A", "B", "C"]
}
```

El frontend o cliente debe enviar la lista completa que desea conservar.

---

<a id="endpoint-publico-del-chatbot"></a>
## 🌐 13. Endpoint público del chatbot

El chatbot cuenta con un endpoint público para visitantes:

```http
POST /api/chatbots/{id}/chat
```

No requiere autenticación de usuario.

Body mínimo:

```json
{
  "message": "¿Cuánto cuesta el Plan Pro?"
}
```

En la primera consulta no es necesario enviar `sessionId`.

El servidor genera uno y lo devuelve:

```json
{
  "success": true,
  "data": {
    "answer": "El Plan Pro cuesta $50.000 mensuales.",
    "sessionId": "85441acd-e683-4e7e-9413-4cfee84136dc"
  }
}
```

Las consultas siguientes pueden enviar ese mismo `sessionId` para mantener el historial y contexto de la conversación.

---

<a id="historial-conversacional"></a>
## 💬 14. Historial conversacional

Cada conversación se identifica mediante:

```text
sessionId
```

El historial se almacena en MongoDB.

Ejemplo conceptual:

```json
{
  "chatbotId": "...",
  "sessionId": "...",
  "messages": [
    {
      "role": "user",
      "content": "¿Cuánto cuesta el Plan Pro?"
    },
    {
      "role": "assistant",
      "content": "El Plan Pro cuesta $50.000."
    },
    {
      "role": "user",
      "content": "¿Y qué incluye?"
    },
    {
      "role": "assistant",
      "content": "El Plan Pro incluye..."
    }
  ]
}
```

MongoDB conserva el historial completo de la conversación.

Para construir el contexto enviado a la IA se recupera únicamente una cantidad configurable de mensajes recientes.

El historial utilizado como contexto para la IA tiene actualmente un límite de 10 mensajes, definido directamente en el código.

El valor no limita la cantidad de mensajes almacenados en MongoDB.

---

<a id="preguntas-de-seguimiento"></a>
## 🧠 15. Preguntas de seguimiento

El historial también se utiliza para mejorar la recuperación semántica.

Ejemplo:

```text
Usuario:
¿Cuánto cuesta el Plan Pro?

Bot:
El Plan Pro cuesta $50.000.

Usuario:
¿Y qué incluye?
```

La segunda pregunta es ambigua por sí sola.

Por eso, para la búsqueda semántica se construye una consulta enriquecida utilizando parte del historial reciente:

```text
¿Cuánto cuesta el Plan Pro? ¿Y qué incluye?
```

Esta consulta contextual se utiliza para recuperar la fuente relevante.

Posteriormente, OpenAI recibe:

- historial;
- contexto recuperado;
- pregunta actual.

Esto permite resolver referencias y preguntas de seguimiento sin obligar al visitante a repetir el tema.

---

<a id="comportamiento-conversacional-de-la-ia"></a>
## ✨ 16. Comportamiento conversacional de la IA

El prompt del sistema indica que el asistente debe:

- utilizar exclusivamente la información disponible en el contexto;
- no inventar información;
- utilizar el historial para comprender referencias;
- responder de manera natural, cordial y clara;
- no repetir información innecesariamente;
- responder a saludos de forma cordial;
- no agregar saludos artificiales cuando el usuario consulta directamente;
- responder de manera cordial cuando el usuario agradece o se despide;
- indicar cuando no existe información suficiente en las fuentes recuperadas.

Esto permite diferenciar entre una respuesta directa:

```text
¿Cuánto cuesta el Plan Pro?

El Plan Pro cuesta $50.000 mensuales.
```

y una conversación:

```text
Hola, ¿cuánto cuesta el Plan Pro?

¡Hola! 😊 El Plan Pro cuesta $50.000 mensuales.

¿Y qué incluye?

Incluye...

Muchas gracias.

¡De nada! 😊 Cualquier otra consulta, estoy para ayudarte.
```

---

<a id="contexto-y-respuestas-sin-informacion"></a>
## 🛡️ 17. Contexto y respuestas sin información

Si la búsqueda semántica no encuentra fuentes suficientemente relevantes, la API no envía un contexto vacío a la IA esperando que el modelo invente una respuesta.

En ese caso devuelve una respuesta controlada:

```text
No encontré información suficiente en la base de conocimiento para responder esa consulta.
```

Esto forma parte del mecanismo de control de alucinaciones del sistema.

---

<a id="documentacion-swagger-openapi"></a>
## 📖 18. Documentación Swagger / OpenAPI

La API incluye documentación interactiva mediante Swagger UI.

Disponible en:

```text
http://localhost:3000/api-docs
```

La especificación utiliza OpenAPI 3.0.

La documentación contiene:

- endpoints;
- parámetros de ruta;
- cuerpos de petición;
- respuestas;
- códigos HTTP;
- autenticación mediante cookie;
- tipos de fuentes de conocimiento;
- ejemplos de uso.

Los schemas reutilizables se definen en:

```text
components.schemas
```

y se reutilizan mediante `$ref`.

Los principales schemas son:

```text
User
Chatbot
KnowledgeSource
ChatResponse
```

---

<a id="principales-endpoints"></a>
## 🔗 19. Principales endpoints

<a id="auth"></a>
### Auth

```http
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/profile
POST /api/auth/logout
```

<a id="knowledge"></a>
### Knowledge

```http
POST   /api/knowledge
GET    /api/knowledge
GET    /api/knowledge/{id}
PATCH  /api/knowledge/{id}
PATCH  /api/knowledge/{id}/content
DELETE /api/knowledge/{id}
```

<a id="chatbots"></a>
### Chatbots

```http
POST   /api/chatbots
GET    /api/chatbots
GET    /api/chatbots/{id}
PATCH  /api/chatbots/{id}
DELETE /api/chatbots/{id}
POST   /api/chatbots/{id}/chat
```

---

<a id="ejecucion-local"></a>
## ▶️ 20. Ejecución local

Requisitos principales:

- Node.js 22.x
- MongoDB
- una API Key válida de OpenAI

Instalar dependencias:

```bash
npm install
```

Iniciar el servidor en desarrollo:

```bash
npm run dev
```

El script de desarrollo utiliza:

```text
node --watch-path=./src --watch-preserve-output --env-file=.env src/index.js
```

Esto permite reiniciar automáticamente el servidor ante cambios dentro de `src/` sin considerar los archivos generados en `uploads/` como cambios de código.

---

<a id="almacenamiento-de-archivos"></a>
## 📁 21. Almacenamiento de archivos

Los archivos PDF se almacenan localmente en:

```text
uploads/
└── knowledge/
```

MongoDB conserva la referencia correspondiente a la fuente.

El proyecto elimina el PDF anterior cuando una fuente PDF es reemplazada correctamente.

<a id="identificacion-de-los-archivos-pdf"></a>
### 21.1. Identificación de los archivos PDF

Los archivos PDF subidos como fuentes de conocimiento se almacenan utilizando un nombre generado dinámicamente mediante un **UUID**, en lugar del nombre original del archivo.

Por ejemplo:

```text
lista-precios.pdf
        ↓
87e51dc7-6221-4b47-a144-30b401e85986.pdf
```

De esta manera, cada archivo almacenado tiene un identificador único y se evita que dos archivos con el mismo nombre original entren en conflicto dentro de `uploads/knowledge/`.

El nombre original del archivo se conserva como parte de la información de la fuente de conocimiento, mientras que el archivo físico utiliza el UUID generado.

Los archivos utilizados durante las pruebas iniciales que ya no estén referenciados pueden eliminarse manualmente.

---

<a id="estructura-general-del-proyecto"></a>
## 🗃️ 22. Estructura general del proyecto

La estructura principal del proyecto es:

```text
/
├── src/
│   ├── config/
│   │   └── swagger.js
│   │
│   ├── constant/
│   │   ├── collections.js
│   │   └── knowledge.js
│   │
│   ├── database/
│   │   └── connection.js
│   │
│   ├── middlewares/
│   │   ├── auth.middleware.js
│   │   ├── upload.middleware.js
│   │   └── error.middleware.js
│   │
│   ├── modules/
│   │   ├── auth/
│   │   │   ├── auth.controller.js
│   │   │   ├── auth.routes.js
│   │   │   └── auth.service.js
│   │   │
│   │   ├── chatbot/
│   │   │   ├── chatbot.controller.js
│   │   │   ├── chatbot.routes.js
│   │   │   ├── chatbot.service.js
│   │   │   └── ...
│   │   │
│   │   ├── knowledge/
│   │   │   ├── knowledge.controller.js
│   │   │   ├── knowledge.routes.js
│   │   │   ├── knowledge.service.js
│   │   │   ├── knowledge-search.service.js
│   │   │   └── ...
│   │   │
│   │   ├── conversation/
│   │   │   └── conversation.service.js
│   │   │
│   │   └── ai/
│   │       └── ai.service.js
│   │
│   ├── utils/
│   │   ├── duration-to-milliseconds.js
│   │   ├── normalize-email.js
│   │   ├── pdf.js
│   │   └── url.js
│   │
│   ├── app.js
│   └── index.js
│
├── uploads/
│   └── knowledge/
│       └── *.pdf
│
├── package.json
└── .env
```

<a id="archivos-y-carpetas-principales"></a>
### 22.1. Archivos y carpetas principales

- `src/constant/`: concentra las constantes utilizadas por el proyecto, como los nombres de las colecciones y los tipos/estados de las fuentes de conocimiento.
- `src/database/connection.js`: establece y administra la conexión con MongoDB.
- `src/middlewares/`: contiene los middlewares de autenticación, carga de archivos y manejo global de errores.
- `src/modules/`: organiza la lógica por módulos funcionales.
- `src/utils/`: contiene utilidades reutilizables para conversiones de duración, normalización de emails, procesamiento de PDF y extracción de contenido desde URLs.
- `src/app.js`: configuración de Express y registro de rutas, Swagger y middleware.
- `src/index.js`: punto de entrada del servidor.
- `uploads/knowledge/`: almacenamiento local de los archivos PDF utilizados como fuentes de conocimiento.

<a id="decisiones-de-diseno-relevantes"></a>
## 💡 23. Decisiones de diseño relevantes

<a id="separacion-entre-extraccion-y-recuperacion"></a>
### 23.1. Separación entre extracción y recuperación

PDF y URL necesitan procesos diferentes para obtener texto, pero ambos terminan generando:

```text
processedContent
embedding
```

Esto permite que Vector Search sea independiente del origen del contenido.

<a id="persistencia-del-historial"></a>
### 23.2. Persistencia del historial

El historial completo se conserva en MongoDB, mientras que solo una cantidad limitada de mensajes recientes se utiliza como contexto para la IA.

<a id="aislamiento-por-usuario"></a>
### 23.3. Aislamiento por usuario

Las búsquedas están filtradas por el usuario propietario y por las fuentes asociadas al chatbot.

<a id="errores-centralizados"></a>
### 23.4. Errores centralizados

Los servicios indican el error y el middleware global decide la respuesta HTTP.

<a id="cookie-httponly"></a>
### 23.5. Cookie HttpOnly

El JWT no se devuelve directamente en el body del login. Se almacena en una cookie HttpOnly.

<a id="umbral-de-relevancia"></a>
### 23.6. Umbral de relevancia

No cualquier resultado vectorial se utiliza como contexto. Se aplica un threshold para evitar recuperar fuentes poco relacionadas.

---

<a id="flujo-completo-de-uso"></a>
## 🚀 24. Flujo completo de uso

Un flujo típico de utilización es:

```text
1. Registrar usuario
        ↓
2. Iniciar sesión
        ↓
3. Crear una fuente de conocimiento
        ↓
4. Cargar su contenido
        ↓
5. Procesar contenido + embedding
        ↓
6. Crear chatbot
        ↓
7. Asociar una o varias fuentes
        ↓
8. Visitante consulta el endpoint público
        ↓
9. Recuperación semántica
        ↓
10. Construcción del contexto
        ↓
11. Uso del historial conversacional
        ↓
12. Generación de respuesta mediante OpenAI
        ↓
13. Guardado de la conversación
```

---
