#!/bin/bash
echo "🚀 Configurador de DeepSeek API Key"

# Crear directorio para keys si no existe
mkdir -p config/keys

# Preguntar por la API Key
echo ""
echo "📝 Por favor ingresa tu API Key de DeepSeek:"
echo "   (debe comenzar con 'sk-' y tener más de 20 caracteres)"
echo "   Puedes obtenerla en: https://platform.deepseek.com/api_keys"
echo ""
read -p "🔑 Tu API Key: " api_key

# Validar API Key
if [[ -z "$api_key" ]]; then
    echo "❌ No ingresaste ninguna API Key"
    exit 1
fi

# Limpiar espacios
api_key=$(echo "$api_key" | tr -d '[:space:]')

# Validar formato
if [[ ${#api_key} -lt 20 ]]; then
    echo "❌ API Key muy corta (debe tener al menos 20 caracteres)"
    exit 1
fi

if [[ ! $api_key == sk-* ]]; then
    echo "❌ API Key debe comenzar con 'sk-'"
    exit 1
fi

# Guardar API Key
echo "$api_key" > config/keys/deepseek.txt
echo "✅ API Key guardada: ${api_key:0:8}****${api_key: -4}"

# Actualizar configuración
cat > config/api-config.js << 'EOF2'
// Configuración de APIs
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
        key: '$api_key',
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

echo "✅ Configuración actualizada"
echo ""
echo "🎯 Para probar:"
echo "   1. Ejecuta: ./start-server.sh"
echo "   2. Ve a: http://localhost:8080"
echo "   3. Selecciona 'DeepSeek AI'"
echo "   4. ¡Envía un mensaje!"
