// Chat UI Mejorado con Indicadores de Estado
class ChatUI {
    constructor() {
        this.aiManager = new AIManager();
        this.isProcessing = false;
        this.statusUpdateInterval = null; // Store interval ID for cleanup
        this.initializeEventListeners();
        this.updateAIStatus();
    }

    initializeEventListeners() {
        const aiSelector = document.getElementById('aiSelector');
        if (aiSelector) {
            aiSelector.addEventListener('change', (e) => {
                this.onAIChange(e.target.value);
            });
        }

        const sendButton = document.getElementById('sendButton');
        const messageInput = document.getElementById('messageInput');
        
        if (sendButton && messageInput) {
            sendButton.addEventListener('click', () => this.sendMessage());
            messageInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.sendMessage();
                }
            });
        }

        // Actualizar estado cada 30 segundos
        this.statusUpdateInterval = setInterval(() => this.updateAIStatus(), 30000);
    }
    
    // Add cleanup method to prevent memory leaks
    destroy() {
        if (this.statusUpdateInterval) {
            clearInterval(this.statusUpdateInterval);
            this.statusUpdateInterval = null;
        }
    }

    onAIChange(aiType) {
        const success = this.aiManager.setCurrentAI(aiType);
        if (success) {
            this.showNotification(`Cambiado a ${apiConfig[aiType].name}`, 'info');
            this.updateUIForAI(aiType);
            this.updateAIStatus();
            
            document.querySelectorAll('.ai-info-card').forEach(card => {
                card.classList.remove('active');
            });
            const infoCard = document.getElementById(aiType + 'Info');
            if (infoCard) {
                infoCard.classList.add('active');
            }
        }
    }

    updateAIStatus() {
        const aiStatus = document.getElementById('aiStatus');
        if (!aiStatus) return;

        const aiType = this.aiManager.getCurrentAI();
        let statusText = '';
        let statusClass = '';

        switch(aiType) {
            case 'deepseek':
                statusText = '🔴 DeepSeek - Verificando...';
                statusClass = 'status-error';
                // Podríamos hacer un test de conexión aquí
                break;
            case 'nexus':
                statusText = '🟢 Nexus AI - Listo';
                statusClass = 'status-success';
                break;
            case 'gemini':
                statusText = '🟡 Gemini - Modo Simulación';
                statusClass = 'status-warning';
                break;
        }

        aiStatus.innerHTML = `<span class="${statusClass}">${statusText}</span>`;
    }

    async sendMessage() {
        if (this.isProcessing) return;

        const messageInput = document.getElementById('messageInput');
        const apiKeyInput = document.getElementById('apiKey');
        
        const message = messageInput.value.trim();
        const apiKey = apiKeyInput ? apiKeyInput.value.trim() : '';

        if (!message) {
            this.showNotification('Por favor escribe un mensaje', 'error');
            return;
        }

        this.isProcessing = true;
        messageInput.disabled = true;
        const sendButton = document.getElementById('sendButton');
        sendButton.disabled = true;
        sendButton.textContent = 'Enviando...';

        try {
            this.addMessageToChat('user', message);
            messageInput.value = '';
            messageInput.style.height = 'auto';

            this.showTypingIndicator();

            const response = await this.aiManager.sendMessage(message, apiKey);
            this.hideTypingIndicator();
            this.addMessageToChat('assistant', response);
            
        } catch (error) {
            this.hideTypingIndicator();
            const errorMessage = `❌ Error: ${error.message}\\n\\n🔄 Cambiando automáticamente a Nexus AI...`;
            this.addMessageToChat('error', errorMessage);
            
            // Cambiar automáticamente a Nexus AI
            this.aiManager.setCurrentAI('nexus');
            this.updateAIStatus();
            
            // Enviar mensaje con Nexus AI
            const nexusResponse = await this.aiManager.sendToNexus(message);
            this.addMessageToChat('assistant', nexusResponse);
            
        } finally {
            this.isProcessing = false;
            messageInput.disabled = false;
            sendButton.disabled = false;
            sendButton.textContent = 'Enviar';
            messageInput.focus();
        }
    }

    addMessageToChat(role, content) {
        const chatMessages = document.getElementById('chatMessages');
        if (!chatMessages) return;

        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${role}-message`;
        
        const timestamp = new Date().toLocaleTimeString('es-ES', { 
            hour: '2-digit', minute: '2-digit' 
        });

        messageDiv.innerHTML = `
            <div class="message-content">
                <div class="message-text">${this.escapeHtml(content)}</div>
                <div class="message-time">${timestamp}</div>
            </div>
        `;

        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    showTypingIndicator() {
        const chatMessages = document.getElementById('chatMessages');
        if (!chatMessages) return;

        const typingDiv = document.createElement('div');
        typingDiv.id = 'typingIndicator';
        typingDiv.className = 'message assistant-message typing';
        typingDiv.innerHTML = `
            <div class="message-content">
                <div class="message-text">
                    <div class="typing-dots">
                        <span></span>
                        <span></span>
                        <span></span>
                    </div>
                </div>
            </div>
        `;

        chatMessages.appendChild(typingDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    hideTypingIndicator() {
        const typingIndicator = document.getElementById('typingIndicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }

    showNotification(message, type = 'info') {
        console.log(`[${type}] ${message}`);
    }

    escapeHtml(unsafe) {
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;")
            .replace(/\\n/g, '<br>');
    }

    updateUIForAI(aiType) {
        const apiKeyInput = document.getElementById('apiKey');
        if (apiKeyInput) {
            const placeholders = {
                nexus: 'Opcional para Nexus AI',
                deepseek: 'Ingresa API Key de DeepSeek (sk-...)',
                gemini: 'Ingresa API Key de Google Gemini'
            };
            apiKeyInput.placeholder = placeholders[aiType] || 'Ingresa API Key';
        }
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.chatUI = new ChatUI();
});
