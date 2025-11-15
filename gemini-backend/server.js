// server.js (Versión Final Compatible 5.0)
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');

// CORRECCIÓN FINAL: Usamos la importación de desestructuración simple,
// que casi siempre funciona en Node.js v24 con librerías modernas.
const { GoogleGenerativeAI } = require('@google/genai');

const app = express();
const PORT = process.env.PORT || 3000;
const API_KEY = process.env.GEMINI_API_KEY;

app.use(bodyParser.json());

if (!API_KEY || API_KEY.includes('<PEGA_AQUÍ_TU_API_KEY_DE_GEMINI>')) {
    console.error("ERROR: La API Key no fue reemplazada correctamente en el archivo .env.");
    process.exit(1);
}

// Inicializar el cliente de Gemini
const ai = new GoogleGenerativeAI(API_KEY);
const modelName = "gemini-2.5-flash"; 

// 📦 RUTA PRINCIPAL DE CHAT
app.post('/api/chat', async (req, res) => {
    try {
        const { message } = req.body;

        if (!message) {
            return res.status(400).json({ error: "Falta el mensaje del usuario." });
        }

        console.log(`Mensaje recibido: ${message}`);

        // Llamada a la API de Gemini
        const response = await ai.getGenerativeModel({ model: modelName }).generateContent(message);
        
        res.json({ text: response.text });

    } catch (error) {
        console.error("Error al procesar la solicitud de chat:", error.message);
        res.status(500).json({ error: "Error interno del servidor. ¿Es la API Key válida?" });
    }
});

// Ruta de prueba
app.get('/', (req, res) => {
    res.send(`Servidor Gemini Back-end corriendo en el puerto ${PORT}. Usa /api/chat para la IA.`);
});

// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`🚀 Servidor Express iniciado en http://localhost:${PORT}`);
    console.log(`¡Ya puedes hacer peticiones POST a http://localhost:${PORT}/api/chat!`);
});
