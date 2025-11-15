// scripts/main.js - LÓGICA DE CHAT CORREGIDA
// Nota: La URL del back-end es el servidor Node.js que corre en Termux.
const BACKEND_URL = 'http://localhost:3000/api/chat'; 

/**
 * Función para enviar el mensaje al back-end de Termux.
 * Reemplaza tu función actual de chat con esta, o integra esta lógica.
 * @param {string} userMessage - El mensaje escrito por el usuario.
 */
async function sendMessageToGemini(userMessage) {
    // Es CRUCIAL que el front-end ya no intente validar o usar la API Key.

    if (!userMessage) {
        return "Error: El mensaje de usuario está vacío.";
    }

    // *** Aquí debe ir la lógica para mostrar el mensaje del usuario y el indicador de carga ***

    try {
        const response = await fetch(BACKEND_URL, {
            method: 'POST',
            headers: {
                // Crucial para que el back-end de Express lea el JSON
                'Content-Type': 'application/json' 
            },
            body: JSON.stringify({
                // Solo enviamos el mensaje al back-end
                message: userMessage 
            })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ error: 'Respuesta inválida del back-end.' }));
            throw new Error(errorData.error || `Error HTTP: ${response.status}. ¿El back-end de Termux (node server.js) está activo?`);
        }

        const data = await response.json();
        const geminiResponseText = data.text; 

        // *** Aquí debe ir la lógica para mostrar 'geminiResponseText' en la interfaz ***

        return geminiResponseText;

    } catch (error) {
        console.error('Error al comunicarse con el back-end:', error);
        
        // Muestra el error al usuario
        return `Error de conexión: ${error.message}`;
    }
}
// Fin de la lógica de chat corregida
