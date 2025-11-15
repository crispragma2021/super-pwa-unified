
    // Métodos específicos para el historial de chat
    async saveChatHistory(history) {
        if (this.settings.chatHistory === 'keep') {
            return this.set('chatHistory', history);
        }
        return true;
    }

    async getChatHistory() {
        if (this.settings.chatHistory === 'keep') {
            return this.get('chatHistory', []);
        }
        return [];
    }

    // Método para limpiar historial según configuración
    async cleanupChatHistory() {
        const setting = this.settings.chatHistory;
        
        switch(setting) {
            case 'clear-day':
                const today = new Date().toDateString();
                const lastCleanup = this.get('lastChatCleanup');
                
                if (lastCleanup !== today) {
                    this.remove('chatHistory');
                    this.set('lastChatCleanup', today);
                }
                break;
                
            case 'clear-session':
                this.remove('chatHistory');
                break;
                
            case 'keep':
            default:
                // No hacer nada, mantener historial
                break;
        }
    }
