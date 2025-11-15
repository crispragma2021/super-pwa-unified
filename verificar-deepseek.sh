#!/bin/bash
echo "🔍 Diagnóstico de API Key DeepSeek..."

# Verificar formato básico de API Key
echo "1. Verificando formato de API Key..."
if [ -f "config/keys/deepseek.txt" ]; then
    API_KEY=$(cat config/keys/deepseek.txt | tr -d '[:space:]')
    echo "   API Key encontrada: ${API_KEY:0:8}****${API_KEY: -4}"
    
    if [[ ${#API_KEY} -lt 20 ]]; then
        echo "   ❌ API Key muy corta (menos de 20 caracteres)"
    elif [[ ! $API_KEY == sk-* ]]; then
        echo "   ❌ API Key no comienza con 'sk-'"
    else
        echo "   ✅ Formato de API Key correcto"
    fi
else
    echo "   ❌ No se encontró archivo de API Key"
fi

echo ""
echo "2. Probando conexión con DeepSeek API..."
curl -s -X POST "https://api.deepseek.com/chat/completions" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $API_KEY" \
  -d '{
    "model": "deepseek-chat",
    "messages": [{"role": "user", "content": "Hola, responde con OK si funciona"}],
    "max_tokens": 10
  }' 2>/dev/null | head -c 200

echo ""
echo ""
echo "3. Verificando configuración actual..."
cat config/api-config.js
