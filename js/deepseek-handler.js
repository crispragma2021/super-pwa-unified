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
