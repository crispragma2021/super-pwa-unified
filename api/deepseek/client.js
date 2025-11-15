class DeepSeekClient {
    constructor(apiKey = '') {
        this.apiKey = apiKey;
        this.baseURL = 'https://api.deepseek.com/v1';
    }

    setApiKey(apiKey) {
        this.apiKey = apiKey;
        console.log('🔑 DeepSeek API Key configurada');
    }

    async createChatCompletion(messages, model = 'deepseek-chat') {
        if (!this.apiKey) {
            throw new Error('🔑 DeepSeek API key no configurada. Ve a Configuración para agregarla.');
        }

        console.log('🔄 Enviando solicitud a DeepSeek...', { model, messages: messages.length });

        const response = await fetch(`${this.baseURL}/chat/completions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.apiKey}`
            },
            body: JSON.stringify({
                model: model,
                messages: messages,
                stream: false,
                max_tokens: 1000,
                temperature: 0.7
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ Error DeepSeek API:', response.status, errorText);
            
            if (response.status === 401) {
                throw new Error('API Key inválida. Verifica tu clave de DeepSeek.');
            } else if (response.status === 429) {
                throw new Error('Límite de tasa excedido. Espera un momento.');
            } else {
                throw new Error(`Error DeepSeek: ${response.status} - ${errorText}`);
            }
        }

        const data = await response.json();
        console.log('✅ Respuesta DeepSeek recibida');
        return data.choices[0].message.content;
    }

    async streamChatCompletion(messages, onChunk, model = 'deepseek-chat') {
        if (!this.apiKey) {
            throw new Error('DeepSeek API key no configurada');
        }

        const response = await fetch(`${this.baseURL}/chat/completions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.apiKey}`
            },
            body: JSON.stringify({
                model: model,
                messages: messages,
                stream: true,
                max_tokens: 1000,
                temperature: 0.7
            })
        });

        if (!response.ok) {
            throw new Error(`Error DeepSeek API: ${response.statusText}`);
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        try {
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split('\n');
                buffer = lines.pop() || '';

                for (const line of lines) {
                    if (line.startsWith('data: ') && line !== 'data: [DONE]') {
                        try {
                            const data = JSON.parse(line.slice(6));
                            const content = data.choices[0]?.delta?.content;
                            if (content && onChunk) {
                                onChunk(content);
                            }
                        } catch (e) {
                            // Ignorar líneas JSON inválidas
                        }
                    }
                }
            }
        } finally {
            reader.releaseLock();
        }
    }

    // Verificar si la API key es válida
    async validateApiKey() {
        if (!this.apiKey) {
            return { valid: false, error: 'No API key provided' };
        }

        try {
            const response = await fetch(`${this.baseURL}/models`, {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`
                }
            });

            if (response.ok) {
                return { valid: true, message: '✅ API Key válida' };
            } else {
                return { valid: false, error: `API Key inválida: ${response.status}` };
            }
        } catch (error) {
            return { valid: false, error: `Error de conexión: ${error.message}` };
        }
    }
}
