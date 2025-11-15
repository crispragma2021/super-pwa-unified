class StorageManager {
    constructor() {
        this.prefix = 'superpwa_';
    }

    // Guardar datos con prefijo
    set(key, value) {
        try {
            const serializedValue = JSON.stringify(value);
            localStorage.setItem(this.prefix + key, serializedValue);
            return true;
        } catch (error) {
            console.error('Error guardando en storage:', error);
            return false;
        }
    }

    // Obtener datos
    get(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(this.prefix + key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (error) {
            console.error('Error leyendo del storage:', error);
            return defaultValue;
        }
    }

    // Eliminar datos
    remove(key) {
        try {
            localStorage.removeItem(this.prefix + key);
            return true;
        } catch (error) {
            console.error('Error eliminando del storage:', error);
            return false;
        }
    }

    // Limpiar todos los datos de la app
    clear() {
        try {
            const keysToRemove = [];
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key.startsWith(this.prefix)) {
                    keysToRemove.push(key);
                }
            }
            keysToRemove.forEach(key => localStorage.removeItem(key));
            return true;
        } catch (error) {
            console.error('Error limpiando storage:', error);
            return false;
        }
    }

    // Verificar si una clave existe
    has(key) {
        return localStorage.getItem(this.prefix + key) !== null;
    }

    // Obtener todas las claves
    keys() {
        const keys = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key.startsWith(this.prefix)) {
                keys.push(key.replace(this.prefix, ''));
            }
        }
        return keys;
    }

    // Guardar datos de chat
    saveChatHistory(messages) {
        return this.set('chat_history', messages);
    }

    // Obtener historial de chat
    getChatHistory() {
        return this.get('chat_history', []);
    }

    // Guardar configuración de API
    saveAPIConfig(config) {
        return this.set('api_config', config);
    }

    // Obtener configuración de API
    getAPIConfig() {
        return this.get('api_config', {
            gemini: '',
            deepseek: ''
        });
    }

    // Guardar preferencias de usuario
    saveUserPreferences(prefs) {
        return this.set('user_preferences', prefs);
    }

    // Obtener preferencias de usuario
    getUserPreferences() {
        return this.get('user_preferences', {
            theme: 'light',
            defaultModel: 'gemini-pro',
            autoSave: true
        });
    }

    // Estadísticas de uso
    getUsageStats() {
        return this.get('usage_stats', {
            chats: 0,
            searches: 0,
            optimizations: 0,
            firstUse: new Date().toISOString()
        });
    }

    updateUsageStats(type) {
        const stats = this.getUsageStats();
        if (stats[type] !== undefined) {
            stats[type]++;
            this.set('usage_stats', stats);
        }
    }
}
