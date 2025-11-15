// Aplicación principal de Super PWA AI
class SuperPWAApp {
    constructor() {
        this.currentTheme = 'auto';
        this.themeMediaQuery = null; // Store media query listener for cleanup
        this.init();
    }

    init() {
        this.loadSettings();
        this.initTheme();
        this.initEventListeners();
        this.updateAIInfo('nexus');
        console.log('🚀 Super PWA AI iniciada');
    }

    loadSettings() {
        const savedTheme = localStorage.getItem('theme') || 'auto';
        const savedHistorySize = localStorage.getItem('historySize') || '25';
        const savedLanguage = localStorage.getItem('language') || 'es';
        
        this.currentTheme = savedTheme;
        document.getElementById('themeSelect').value = savedTheme;
        document.getElementById('historySize').value = savedHistorySize;
        document.getElementById('languageSelect').value = savedLanguage;

        // Aplicar configuración de historial al AI Manager
        if (window.chatUI && window.chatUI.aiManager) {
            window.chatUI.aiManager.setMaxHistorySize(savedHistorySize);
        }
    }

    initTheme() {
        this.applyTheme(this.currentTheme);
        
        // Escuchar cambios de preferencia del sistema
        this.themeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleThemeChange = (e) => {
            if (this.currentTheme === 'auto') {
                this.applyTheme('auto');
            }
        };
        this.themeMediaQuery.addEventListener('change', handleThemeChange);
        // Store handler for potential cleanup
        this.themeChangeHandler = handleThemeChange;
    }

    applyTheme(theme) {
        this.currentTheme = theme;
        const isDark = theme === 'dark' || (theme === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches);
        
        document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
        document.getElementById('themeToggle').textContent = isDark ? '☀️' : '🌙';
        
        localStorage.setItem('theme', theme);
    }

    initEventListeners() {
        // Toggle de tema
        document.getElementById('themeToggle').addEventListener('click', () => {
            const themes = ['auto', 'light', 'dark'];
            const currentIndex = themes.indexOf(this.currentTheme);
            const nextTheme = themes[(currentIndex + 1) % themes.length];
            this.applyTheme(nextTheme);
            this.showNotification(`Tema cambiado a: ${nextTheme}`, 'success');
        });

        // Selector de AI
        document.getElementById('aiSelector').addEventListener('change', (e) => {
            this.updateAIInfo(e.target.value);
        });

        // Modal de configuración
        document.getElementById('settingsBtn').addEventListener('click', () => {
            this.openSettings();
        });

        document.getElementById('closeModal').addEventListener('click', () => {
            this.closeSettings();
        });

        document.getElementById('saveSettings').addEventListener('click', () => {
            this.saveSettings();
        });

        document.getElementById('resetSettings').addEventListener('click', () => {
            this.resetSettings();
        });

        // Cerrar modal al hacer clic fuera
        document.getElementById('settingsModal').addEventListener('click', (e) => {
            if (e.target.id === 'settingsModal') {
                this.closeSettings();
            }
        });

        // Botón recargar
        document.getElementById('refreshBtn').addEventListener('click', () => {
            location.reload();
        });

        // Validación de API Key en tiempo real
        const apiKeyInput = document.getElementById('apiKey');
        if (apiKeyInput) {
            apiKeyInput.addEventListener('input', (e) => {
                this.validateApiKey(e.target.value);
            });
        }

        // Instalación PWA
        this.initPWA();
    }

    updateAIInfo(aiType) {
        // Ocultar todos los info items
        document.querySelectorAll('.ai-info-card').forEach(item => {
            item.classList.remove('active');
        });

        // Mostrar el info item correspondiente
        const infoItem = document.getElementById(`${aiType}Info`);
        if (infoItem) {
            infoItem.classList.add('active');
        }

        // Actualizar placeholder del API Key
        const apiKeyInput = document.getElementById('apiKey');
        const placeholders = {
            nexus: 'Opcional para Nexus AI',
            deepseek: 'Ingresa tu API Key de DeepSeek (sk-...)',
            gemini: 'Ingresa tu API Key de Google Gemini'
        };
        
        if (apiKeyInput) {
            apiKeyInput.placeholder = placeholders[aiType] || 'Ingresa tu API Key';
            
            // Limpiar validación previa
            apiKeyInput.classList.remove('valid', 'invalid');
            document.getElementById('apiStatus').textContent = '';
        }
    }

    validateApiKey(apiKey) {
        const aiType = document.getElementById('aiSelector').value;
        const apiStatus = document.getElementById('apiStatus');
        const apiKeyInput = document.getElementById('apiKey');

        if (!apiKey.trim()) {
            apiKeyInput.classList.remove('valid', 'invalid');
            apiStatus.textContent = '';
            return;
        }

        let isValid = false;
        let message = '';

        switch(aiType) {
            case 'deepseek':
                isValid = apiKey.startsWith('sk-') && apiKey.length > 20;
                message = isValid ? '✅ API Key válida' : '❌ Debe comenzar con "sk-" y tener >20 caracteres';
                break;
            case 'gemini':
                isValid = apiKey.length > 10;
                message = isValid ? '✅ API Key válida' : '❌ API Key parece inválida';
                break;
            case 'nexus':
                isValid = true;
                message = '✅ API Key opcional para Nexus AI';
                break;
        }

        apiKeyInput.classList.toggle('valid', isValid);
        apiKeyInput.classList.toggle('invalid', !isValid && apiKey.length > 0);
        apiStatus.textContent = message;
        apiStatus.style.color = isValid ? '#10b981' : '#ef4444';
    }

    openSettings() {
        document.getElementById('settingsModal').style.display = 'block';
    }

    closeSettings() {
        document.getElementById('settingsModal').style.display = 'none';
    }

    saveSettings() {
        const theme = document.getElementById('themeSelect').value;
        const historySize = document.getElementById('historySize').value;
        const language = document.getElementById('languageSelect').value;

        this.applyTheme(theme);
        localStorage.setItem('historySize', historySize);
        localStorage.setItem('language', language);

        // Aplicar configuración de historial
        if (window.chatUI && window.chatUI.aiManager) {
            window.chatUI.aiManager.setMaxHistorySize(historySize);
        }

        this.showNotification('✅ Configuración guardada', 'success');
        this.closeSettings();
    }

    resetSettings() {
        localStorage.clear();
        this.loadSettings();
        this.showNotification('🔄 Configuración restablecida', 'success');
        this.closeSettings();
    }

    initPWA() {
        let deferredPrompt;

        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            deferredPrompt = e;
            const installBtn = document.getElementById('installBtn');
            if (installBtn) {
                installBtn.style.display = 'block';
                installBtn.addEventListener('click', async () => {
                    if (deferredPrompt) {
                        deferredPrompt.prompt();
                        const { outcome } = await deferredPrompt.userChoice;
                        if (outcome === 'accepted') {
                            installBtn.style.display = 'none';
                            this.showNotification('✅ App instalada', 'success');
                        }
                        deferredPrompt = null;
                    }
                });
            }
        });
    }

    showNotification(message, type = 'info') {
        // Crear notificación toast
        const toast = document.createElement('div');
        // Use CSS classes instead of inline styles for better performance
        toast.className = `notification-toast notification-${type}`;
        toast.textContent = message;

        document.body.appendChild(toast);

        // Animación de entrada
        setTimeout(() => toast.classList.add('notification-show'), 100);

        // Auto-remover después de 4 segundos
        setTimeout(() => {
            toast.classList.remove('notification-show');
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }, 4000);
    }
    
    // Add cleanup method
    destroy() {
        if (this.themeMediaQuery && this.themeChangeHandler) {
            this.themeMediaQuery.removeEventListener('change', this.themeChangeHandler);
        }
    }
}

// Inicializar la aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.superPWAApp = new SuperPWAApp();
});

// Manejar errores globales
window.addEventListener('error', (e) => {
    console.error('Error global:', e.error);
});

// Service Worker
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('✅ Service Worker registrado:', registration);
            })
            .catch(error => {
                console.log('❌ Error registrando Service Worker:', error);
            });
    });
}
