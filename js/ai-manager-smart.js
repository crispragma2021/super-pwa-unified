// Gestor de AI INTELIGENTE con Fallback Automático
class AIManager {
    constructor() {
        this.currentAI = 'nexus';
        this.conversationHistory = [];
        this.deepseekAttempts = 0;
        this.maxDeepseekAttempts = 2;
    }

    setCurrentAI(aiType) {
        if (apiConfig[aiType] && apiConfig[aiType].enabled) {
            this.currentAI = aiType;
            console.log('AI cambiada a:', aiType);
            return true;
        }
        return false;
    }

    async sendMessage(message, apiKey = '') {
        const aiType = this.currentAI;
        
        console.log('Enviando a', aiType, 'intento', this.deepseekAttempts);

        try {
            let response;
            
            switch(aiType) {
                case 'deepseek':
                    // Si hemos intentado muchas veces con DeepSeek, cambiar a Nexus
                    if (this.deepseekAttempts >= this.maxDeepseekAttempts) {
                        console.log('🔁 Demasiados fallos con DeepSeek, cambiando a Nexus');
                        response = await this.sendToNexus(message);
                        response += '\\n\\n🔧 [Nota: DeepSeek temporalmente no disponible]';
                    } else {
                        try {
                            const deepseek = new DeepSeekHandler(apiKey);
                            response = await deepseek.sendMessage(message, this.conversationHistory);
                            this.deepseekAttempts = 0; // Resetear contador si funciona
                        } catch (deepseekError) {
                            this.deepseekAttempts++;
                            console.log('❌ DeepSeek falló, intento:', this.deepseekAttempts);
                            throw deepseekError;
                        }
                    }
                    break;

                case 'nexus':
                    response = await this.sendToNexus(message);
                    break;

                case 'gemini':
                    const gemini = new GeminiHandler();
                    response = await gemini.sendMessage(message);
                    break;

                default:
                    response = await this.sendToNexus(message);
            }

            // Actualizar historial
            this.conversationHistory.push(
                { role: 'user', content: message },
                { role: 'assistant', content: response }
            );

            return response;

        } catch (error) {
            console.error('Error en AI Manager:', error);
            
            // Fallback automático a Nexus AI
            const fallbackResponse = await this.sendToNexus(message);
            return fallbackResponse + '\\n\\n⚠️ [Sistema: Fallback a Nexus AI activado]';
        }
    }

    async sendToNexus(message) {
        await new Promise(resolve => setTimeout(resolve, 600 + Math.random() * 600));
        
        const responses = [
            `🤖 Nexus AI: "${message}" - Estoy aquí para ayudarte inmediatamente.`,
            `🤖 Nexus AI: Mensaje recibido. Mientras solucionamos DeepSeek, puedo asistirte localmente.`,
            `🤖 Nexus AI: ¡Perfecto! "${message}" - ¿En qué más puedo colaborar contigo?`,
            `🤖 Nexus AI: Entendido. Tu consulta ha sido procesada localmente.`,
            `🤖 Nexus AI: "${message}" - Recibido y procesado. ¿Algo más en lo que pueda ayudar?`
        ];
        
        return responses[Math.floor(Math.random() * responses.length)];
    }

    clearHistory() {
        this.conversationHistory = [];
        this.deepseekAttempts = 0;
    }

    resetDeepseekAttempts() {
        this.deepseekAttempts = 0;
    }
}
