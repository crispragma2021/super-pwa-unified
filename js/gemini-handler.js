// Manejador específico para Google Gemini AI (Free Tier)
class GeminiHandler {
    constructor(apiKey) {
        this.apiKey = apiKey;
        this.endpoint = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';
        this.model = 'gemini-2.5-flash'; // Modelo gratuito rápido y eficiente
    }

    setApiKey(newApiKey) {
        this.apiKey = newApiKey;
        console.log('Gemini API Key actualizada.');
    }

    async sendMessage(message, conversationHistory = []) {
        try {
            console.log('Enviando mensaje a Gemini...');

            // Adaptar el historial al formato de Gemini (role: 'user' o 'model')
            const contents = conversationHistory.map(msg => ({
                role: msg.role === 'assistant' ? 'model' : 'user',
                parts: [{ text: msg.content }]
            }));
            
            contents.push({ role: 'user', parts: [{ text: message }] });

            // La clave se pasa como parámetro de consulta
            const response = await fetch(`${this.endpoint}?key=${this.apiKey}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    contents: contents,
                    config: {
                        temperature: 0.7,
                        maxOutputTokens: 2048
                    }
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error('Error Gemini:', response.status, errorData);
                throw new Error(`Error ${response.status}: ${errorData.error.message || 'Error desconocido de Gemini API'}`);
            }

            const data = await response.json();
            console.log('Respuesta Gemini:', data);

            const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

            if (!text) {
                throw new Error('Respuesta inválida o bloqueada de Gemini API');
            }

            return text;

        } catch (error) {
            console.error('Error en Gemini:', error);
            throw new Error(`Error con Gemini: ${error.message}`);
        }
    }

    validateApiKey(apiKey) {
        return apiKey && apiKey.length > 10;
    }
}
