
    // Método para cargar mensajes con provider
    loadMessage(role, content, provider = null, timestamp = null) {
        this.messageCount++;
        
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${role}`;
        messageDiv.dataset.messageId = this.messageCount;

        let displayContent = content;
        if (provider) {
            displayContent = this.formatProviderMessage(content, provider);
        }

        if (role === 'error') {
            messageDiv.innerHTML = `
                <div class="error-header">
                    <span class="error-icon">❌</span>
                    <strong>Error</strong>
                </div>
                <div class="error-content">${this.escapeHtml(content)}</div>
            `;
        } else {
            const time = timestamp ? new Date(timestamp).toLocaleTimeString('es-ES', { 
                hour: '2-digit', 
                minute: '2-digit' 
            }) : this.getCurrentTime();
            
            messageDiv.innerHTML = `
                <div class="message-header">
                    <span class="message-role">${this.getRoleIcon(role)} ${this.getRoleText(role, provider)}</span>
                    <span class="message-time">${time}</span>
                </div>
                <div class="message-content">${this.formatContent(displayContent)}</div>
            `;
        }

        this.messagesContainer.appendChild(messageDiv);
        this.scrollToBottom();
        
        return messageDiv;
    }

    // Método para obtener historial completo con timestamps
    getChatHistoryWithTimestamps() {
        const messages = [];
        this.messagesContainer.querySelectorAll('.message').forEach(msg => {
            const role = msg.classList.contains('user') ? 'user' : 
                         msg.classList.contains('error') ? 'error' : 'assistant';
            const content = msg.querySelector('.message-content').textContent;
            const timeText = msg.querySelector('.message-time').textContent;
            const provider = msg.dataset.provider || null;
            
            messages.push({ 
                role, 
                content, 
                provider,
                timestamp: new Date().toISOString() // En una app real, guardarías el timestamp real
            });
        });
        return messages;
    }
