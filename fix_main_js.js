// Este es el código JavaScript que debe ir en scripts/main.js
// Busca la línea donde está el método changeChatHistory y reemplaza desde ahí

    changeChatHistory(setting) {
        this.settings.saveSetting('chatHistory', setting);
        this.showNotification(`💬 Historial: ${this.getChatHistoryText(setting)}`, 'success');
    }

    getChatHistoryText(setting) {
        const options = {
            'keep': 'Mantener historial',
            'clear-day': 'Limpiar diariamente',
            'clear-session': 'Solo esta sesión'
        };
        return options[setting] || setting;
    }

    loadSettingsDisplay() {
        const settings = this.settings.getAllSettings();

        document.getElementById('theme-select').value = settings.theme || 'light';
        document.getElementById('default-model').value = settings.defaultModel || 'nexus';
        document.getElementById('chat-history').value = settings.chatHistory || 'keep';

        // No mostrar keys actuales por seguridad, pero mostrar estado
        document.getElementById('gemini-key').value = '';
        document.getElementById('deepseek-key').value = '';

        // Mostrar estado actual de las APIs
        this.updateAPIKeyStatus();
    }

    async updateAPIKeyStatus() {
        const settings = this.settings.getAllSettings();
        const deepseekInput = document.getElementById('deepseek-key');
        const geminiInput = document.getElementById('gemini-key');

        if (settings.apiKeys.deepseek) {
            deepseekInput.placeholder = '✅ DeepSeek API Key configurada';
            deepseekInput.style.borderColor = 'var(--success-color)';
        } else {
            deepseekInput.placeholder = 'sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx';
            deepseekInput.style.borderColor = 'var(--border-color)';
        }

        if (settings.apiKeys.gemini) {
            geminiInput.placeholder = '✅ Gemini API Key configurada';
            geminiInput.style.borderColor = 'var(--success-color)';
        } else {
            geminiInput.placeholder = 'AIzaSyxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx';
            geminiInput.style.borderColor = 'var(--border-color)';
        }
    }

    // Método para cargar el historial de chat según la configuración
    setupChatHistory() {
        const settings = this.settings.getAllSettings();
        const historySetting = settings.chatHistory || 'keep';

        switch(historySetting) {
            case 'clear-day':
                // Limpiar si es un nuevo día
                const lastClear = localStorage.getItem('lastChatClear');
                const today = new Date().toDateString();

                if (lastClear !== today) {
                    this.chatManager.clearChat();
                    localStorage.setItem('lastChatClear', today);
                }
                break;

            case 'clear-session':
                // El historial se limpia automáticamente al recargar
                break;

            case 'keep':
            default:
                // Mantener historial - cargar mensajes guardados
                const savedHistory = this.settings.get('chatHistory');
                if (savedHistory && Array.isArray(savedHistory)) {
                    savedHistory.forEach(msg => {
                        this.chatManager.addMessage(msg.role, msg.content, msg.provider);
                    });
                }
                break;
        }
    }

    // Método para guardar el historial del chat
    saveChatHistory() {
        const settings = this.settings.getAllSettings();
        if (settings.chatHistory === 'keep') {
            const history = this.chatManager.getChatHistory();
            this.settings.set('chatHistory', history);
        }
    }

    // Método para manejar la limpieza automática del historial
    setupAutoCleanup() {
        const settings = this.settings.getAllSettings();
        if (settings.chatHistory === 'clear-session') {
            // Limpiar al cargar la página para sesión nueva
            this.chatManager.clearChat();
        }
    }
}

// Agregar event listener para guardar el historial antes de cerrar la página
window.addEventListener('beforeunload', () => {
    if (window.superPWA) {
        window.superPWA.saveChatHistory();
    }
});

// Inicializar la aplicación
document.addEventListener('DOMContentLoaded', () => {
    window.superPWA = new SuperPWAApp();
});

// Service Worker
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('✅ SW registered: ', registration);
            })
            .catch(registrationError => {
                console.log('❌ SW registration failed: ', registrationError);
            });
    });
}
