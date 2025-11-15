#!/bin/bash

# Tu API Key de DeepSeek
API_KEY="sk-9cfae***********************d913"

echo "🔧 Configurando API Key de DeepSeek..."
echo "📋 Key: ${API_KEY:0:8}****${API_KEY: -4}"

# Crear directorio para keys
mkdir -p config/keys

# Guardar API Key
echo "$API_KEY" > config/keys/deepseek.txt
echo "✅ API Key guardada en config/keys/deepseek.txt"

# Actualizar configuración de APIs
cat > config/api-config.js << 'EOF2'
// Configuración de APIs - ACTUALIZADA
const apiConfig = {
    nexus: {
        name: 'Nexus AI',
        endpoint: '/api/chat',
        key: '',
        enabled: true
    },
    deepseek: {
        name: 'DeepSeek AI',
        endpoint: 'https://api.deepseek.com/chat/completions',
        key: '$API_KEY',
        model: 'deepseek-chat',
        enabled: true
    },
    gemini: {
        name: 'Gemini AI', 
        endpoint: 'http://localhost:3001/api/chat',
        key: '',
        enabled: true
    }
};
EOF2

echo "✅ Configuración de APIs actualizada"

# Actualizar el handler de DeepSeek para usar la key directamente
cat > js/deepseek-handler-fixed.js << 'EOF3'
// Manejador de DeepSeek - CON API KEY FIJA
class DeepSeekHandler {
    constructor() {
        this.apiKey = "sk-9cfae***********************d913";
        this.endpoint = 'https://api.deepseek.com/chat/completions';
        this.model = 'deepseek-chat';
    }

    async sendMessage(message, conversationHistory = []) {
        try {
            console.log('Enviando mensaje a DeepSeek con API Key fija...');
            
            const messages = [
                ...conversationHistory,
                { role: 'user', content: message }
            ];

            const response = await fetch(this.endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`
                },
                body: JSON.stringify({
                    model: this.model,
                    messages: messages,
                    stream: false,
                    temperature: 0.7,
                    max_tokens: 2048
                })
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Error DeepSeek:', response.status, errorText);
                
                let errorMessage = `Error ${response.status}: `;
                try {
                    const errorData = JSON.parse(errorText);
                    errorMessage += errorData.error?.message || errorText;
                } catch {
                    errorMessage += errorText || 'Error desconocido';
                }
                
                throw new Error(errorMessage);
            }

            const data = await response.json();
            console.log('✅ Respuesta DeepSeek exitosa');
            
            if (!data.choices || !data.choices[0] || !data.choices[0].message) {
                throw new Error('Respuesta inválida de DeepSeek API');
            }

            return data.choices[0].message.content;

        } catch (error) {
            console.error('Error en DeepSeek:', error);
            throw new Error(`Error con DeepSeek: ${error.message}`);
        }
    }

    validateApiKey() {
        // Ya tenemos la API Key fija, siempre válida
        return true;
    }
}
EOF3

# Reemplazar el handler original
cp js/deepseek-handler-fixed.js js/deepseek-handler.js
rm js/deepseek-handler-fixed.js

echo "✅ Handler de DeepSeek actualizado con API Key fija"

# Actualizar AI Manager para no pedir API Key
cat > js/ai-manager-fixed.js << 'EOF4'
// Gestor principal de AI - ACTUALIZADO
class AIManager {
    constructor() {
        this.currentAI = 'nexus';
        this.conversationHistory = [];
        this.maxHistorySize = 25;
    }

    setCurrentAI(aiType) {
        if (apiConfig[aiType] && apiConfig[aiType].enabled) {
            this.currentAI = aiType;
            console.log('AI cambiada a:', aiType);
            return true;
        }
        return false;
    }

    getCurrentAI() {
        return this.currentAI;
    }

    async sendMessage(message, apiKey = '') {
        const aiType = this.currentAI;
        
        if (!apiConfig[aiType]) {
            throw new Error(`AI ${aiType} no configurada`);
        }

        console.log('Enviando mensaje a', aiType, ':', message.substring(0, 50) + '...');

        try {
            let response;
            
            switch(aiType) {
                case 'deepseek':
                    const deepseek = new DeepSeekHandler();
                    // No necesita validación de API Key porque ya está fija
                    response = await deepseek.sendMessage(message, this.conversationHistory);
                    break;

                case 'nexus':
                    response = await this.sendToNexus(message);
                    break;

                case 'gemini':
                    const gemini = new GeminiHandler();
                    response = await gemini.sendMessage(message);
                    break;

                default:
                    throw new Error('AI no soportada');
            }

            // Actualizar historial
            this.conversationHistory.push(
                { role: 'user', content: message },
                { role: 'assistant', content: response }
            );

            // Limitar tamaño del historial
            if (this.maxHistorySize > 0 && this.conversationHistory.length > this.maxHistorySize * 2) {
                this.conversationHistory = this.conversationHistory.slice(-this.maxHistorySize * 2);
            }

            return response;

        } catch (error) {
            console.error('Error en AIManager:', error);
            throw error;
        }
    }

    async sendToNexus(message) {
        await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));
        
        const responses = [
            `🤖 Nexus AI: He procesado: "${message}". ¿En qué más puedo ayudarte?`,
            `🤖 Nexus AI: Interesante pregunta sobre "${message}". Como IA local, puedo simular conversaciones.`,
            `🤖 Nexus AI: Entendido: "${message}". ¿Te gustaría probar otras IAs disponibles?`,
            `🤖 Nexus AI: Mensaje recibido: "${message}". Recuerda que soy una IA simulada.`,
            `🤖 Nexus AI: ¡Hola! He analizado "${message}". ¿Hay algo específico en lo que te pueda asistir?`
        ];
        
        return responses[Math.floor(Math.random() * responses.length)];
    }

    clearHistory() {
        this.conversationHistory = [];
        console.log('Historial de conversación limpiado');
    }

    getHistory() {
        return this.conversationHistory;
    }

    setMaxHistorySize(size) {
        this.maxHistorySize = parseInt(size) || 0;
        console.log('Tamaño máximo de historial:', this.maxHistorySize);
    }
}
EOF4

cp js/ai-manager-fixed.js js/ai-manager.js
rm js/ai-manager-fixed.js

echo "✅ AI Manager actualizado"

# Crear script de prueba
cat > probar-deepseek.sh << 'EOF5'
#!/bin/bash
echo "🧪 Probando conexión con DeepSeek..."
./start-server.sh
EOF5

chmod +x probar-deepseek.sh

echo ""
echo "🎉 CONFIGURACIÓN COMPLETADA"
echo "============================"
echo "✅ API Key de DeepSeek configurada"
echo "✅ Handlers actualizados" 
echo "✅ No necesitarás ingresar API Key manualmente"
echo ""
echo "🚀 Para probar:"
echo "   ./start-server.sh"
echo "   Luego ve a http://localhost:8080"
echo "   Selecciona 'DeepSeek AI' y ¡chatea!"
