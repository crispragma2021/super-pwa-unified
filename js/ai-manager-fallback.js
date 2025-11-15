// Gestor de AI con Fallback Automático
class AIManager {
    constructor() {
        this.currentAI = 'nexus'; // Nexus por defecto
        this.conversationHistory = [];
    }

    async sendMessage(message, apiKey = '') {
        try {
            // Siempre usar Nexus AI hasta que tengas API Key válida
            return await this.sendToNexus(message);
        } catch (error) {
            return `🤖 Nexus AI: ${message} - [Modo seguro activado]`;
        }
    }

    async sendToNexus(message) {
        await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 800));
        
        const responses = [
            `🤖 Nexus AI: "${message}" - Estoy aquí para ayudarte. ¿En qué más puedo asistirte?`,
            `🤖 Nexus AI: He procesado tu mensaje. Mientras solucionamos DeepSeek, puedo simular conversaciones contigo.`,
            `🤖 Nexus AI: ¡Hola! Tu mensaje fue recibido. Actualmente en modo local.`,
            `🤖 Nexus AI: Interesante: "${message}". ¿Te gustaría que active otras funcionalidades?`,
            `🤖 Nexus AI: Mensaje entendido. Cuando tengas una API Key válida de DeepSeek, podrás acceder a IA más avanzada.`
        ];
        
        return responses[Math.floor(Math.random() * responses.length)];
    }

    clearHistory() {
        this.conversationHistory = [];
    }
}
