#!/bin/bash
echo "🧪 Probando API Key después del pago..."

API_KEY="sk-9cfae***********************d913"

echo "🔑 API Key: ${API_KEY:0:8}****${API_KEY: -4}"
echo ""

# Probar la conexión con DeepSeek
echo "1. Probando autenticación..."
response=$(curl -s -w "HTTP_STATUS:%{http_code}" -X POST "https://api.deepseek.com/chat/completions" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $API_KEY" \
  -d '{
    "model": "deepseek-chat",
    "messages": [{"role": "user", "content": "Responde solo con OK si funciona"}],
    "max_tokens": 10
  }')

# Extraer HTTP status
http_status=$(echo "$response" | grep -o 'HTTP_STATUS:[0-9]*' | cut -d: -f2)
body=$(echo "$response" | sed 's/HTTP_STATUS:[0-9]*//g')

echo "   Código HTTP: $http_status"

if [ "$http_status" = "200" ]; then
    echo "   ✅ ¡API Key FUNCIONA después del pago!"
    echo "   Respuesta: $body"
else
    echo "   ❌ Todavía hay problemas"
    echo "   Error: $body"
fi

echo ""
echo "2. Reactivando DeepSeek en la configuración..."
cat > config/api-config.js << 'EOF2'
// Configuración de APIs - DEEPSEEK REACTIVADO
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
        key: 'sk-9cfae***********************d913',
        model: 'deepseek-chat',
        enabled: true  // REACTIVADO
    },
    gemini: {
        name: 'Gemini AI', 
        endpoint: 'http://localhost:3001/api/chat',
        key: '',
        enabled: true
    }
};
EOF2

echo "✅ DeepSeek reactivado en la configuración"

echo ""
echo "3. Actualizando handlers..."
cat > js/deepseek-handler-reactived.js << 'EOF3'
// Manejador de DeepSeek - REACTIVADO
class DeepSeekHandler {
    constructor(apiKey = null) {
        // Usar API Key fija o la que se pase
        this.apiKey = apiKey || "sk-9cfae***********************d913";
        this.endpoint = 'https://api.deepseek.com/chat/completions';
        this.model = 'deepseek-chat';
        console.log('🔧 DeepSeek Handler reactivado con API Key después del pago');
    }

    async sendMessage(message, conversationHistory = []) {
        try {
            console.log('🔄 Enviando mensaje a DeepSeek (post-pago)...');
            
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

            console.log('📊 Status de respuesta:', response.status);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('❌ Error DeepSeek:', response.status, errorText);
                
                // Si sigue fallando después del pago, puede ser otro problema
                if (response.status === 401) {
                    throw new Error('API Key sigue siendo inválida. Verifica que el pago se haya procesado correctamente.');
                }
                
                throw new Error(`Error ${response.status}: ${errorText}`);
            }

            const data = await response.json();
            console.log('✅ ¡DeepSeek respondió exitosamente después del pago!');
            
            return data.choices[0].message.content;

        } catch (error) {
            console.error('❌ Error en DeepSeek:', error);
            throw error;
        }
    }

    validateApiKey(apiKey = null) {
        const keyToValidate = apiKey || this.apiKey;
        return keyToValidate && keyToValidate.startsWith('sk-') && keyToValidate.length > 20;
    }
}
EOF3

cp js/deepseek-handler-reactived.js js/deepseek-handler.js
rm js/deepseek-handler-reactived.js

echo "✅ Handlers actualizados"

echo ""
echo "🎉 CONFIGURACIÓN COMPLETADA"
echo "============================"
echo "✅ DeepSeek reactivado después del pago"
echo "✅ API Key configurada: ${API_KEY:0:8}****${API_KEY: -4}"
echo "✅ Listo para probar"

echo ""
echo "🚀 INSTRUCCIONES:"
echo "   1. Ejecuta: ./start-server.sh"
echo "   2. Ve a: http://localhost:8080"
echo "   3. Selecciona 'DeepSeek AI'"
echo "   4. ¡Envía un mensaje!"
echo ""
echo "📝 NOTA: Si todavía falla, espera 5-10 minutos ya que el pago"
echo "       puede tomar unos minutos en procesarse completamente."
