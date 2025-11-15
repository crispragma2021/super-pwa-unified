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
