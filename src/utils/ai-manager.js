class AIManager {
    constructor() {
        this.geminiClient = new GeminiClient();
        this.deepseekClient = new DeepSeekClient();
        this.settings = new SettingsManager();
        this.isInitialized = false;
    }

    async initialize() {
        if (this.isInitialized) return;
        
        await this.settings.loadSettings();
        const apiKeys = this.settings.settings.apiKeys;

        if (apiKeys.gemini) {
            this.geminiClient.setApiKey(apiKeys.gemini);
            console.log('🔑 Gemini client inicializado');
        }

        if (apiKeys.deepseek) {
            this.deepseekClient.setApiKey(apiKeys.deepseek);
            console.log('🔑 DeepSeek client inicializado');
        }

        this.isInitialized = true;
    }

    async getResponse(provider, message, context = '') {
        await this.initialize();

        console.log(`🤖 Solicitando respuesta de: ${provider}`, { message });

        try {
            switch (provider) {
                case 'gemini':
                    if (!this.settings.getAPIKey('gemini')) {
                        throw new Error('Gemini API key no configurada. Ve a Configuración.');
                    }
                    const prompt = context ? `Contexto: ${context}\n\nPregunta: ${message}` : message;
                    return await this.geminiClient.generateContent(prompt);

                case 'deepseek':
                    if (!this.settings.getAPIKey('deepseek')) {
                        throw new Error('DeepSeek API key no configurada. Ve a Configuración.');
                    }
                    const messages = [
                        { 
                            role: 'system', 
                            content: context || 'Eres DeepSeek AI, un asistente útil y inteligente. Responde en el mismo idioma que el usuario.' 
                        },
                        { role: 'user', content: message }
                    ];
                    return await this.deepseekClient.createChatCompletion(messages);

                case 'nexus':
                    return await this.generateNexusResponse(message);

                default:
                    throw new Error(`Proveedor AI no soportado: ${provider}`);
            }
        } catch (error) {
            console.error(`❌ Error en ${provider}:`, error);
            throw error;
        }
    }

    async generateNexusResponse(message) {
        // Respuesta inteligente del sistema Nexus
        const responses = {
            'hola': '¡Hola! Soy Nexus AI, tu asistente unificado. ¿En qué puedo ayudarte hoy?',
            'ayuda': 'Puedo ayudarte con: 🤖 Chat AI (Gemini/DeepSeek), 🔍 Búsqueda RAG, ⚡ Análisis de sistema',
            'configuración': 'Ve a la pestaña de Configuración para gestionar tus API keys y preferencias.',
            'deepseek': 'Para usar DeepSeek: 1) Ve a Configuración 2) Agrega tu API Key de DeepSeek 3) Selecciona "DeepSeek AI" en el chat',
            'gemini': 'Para usar Gemini: 1) Ve a Configuración 2) Agrega tu API Key de Gemini 3) Selecciona "Google Gemini" en el chat'
        };

        const lowerMessage = message.toLowerCase();
        for (const [key, response] of Object.entries(responses)) {
            if (lowerMessage.includes(key)) {
                return response;
            }
        }

        return `🔍 Nexus está procesando: "${message}". \n\nPara respuestas más detalladas, configura Gemini o DeepSeek en la pestaña de Configuración. ¿Necesitas ayuda para configurarlos?`;
    }

    async checkConnectivity() {
        try {
            const response = await fetch('https://api.deepseek.com/v1/models', {
                method: 'HEAD',
                mode: 'no-cors'
            });
            return true;
        } catch (error) {
            // Intentar con Google como fallback
            try {
                await fetch('https://www.google.com', { method: 'HEAD', mode: 'no-cors' });
                return true;
            } catch {
                return false;
            }
        }
    }

    async getAvailableProviders() {
        await this.initialize();
        const available = [];
        const apiKeys = this.settings.settings.apiKeys;

        if (apiKeys.gemini) available.push('gemini');
        if (apiKeys.deepseek) available.push('deepseek');
        available.push('nexus'); // Siempre disponible

        return available;
    }

    async validateApiKey(provider) {
        await this.initialize();
        
        switch (provider) {
            case 'deepseek':
                return await this.deepseekClient.validateApiKey();
            case 'gemini':
                // Gemini validation would go here
                return { valid: true, message: 'Gemini validation not implemented' };
            default:
                return { valid: false, error: 'Proveedor no soportado' };
        }
    }
}
