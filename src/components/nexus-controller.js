class NexusController {
    constructor() {
        this.storage = new StorageManager();
        this.initialized = false;
        // Add cache for expensive operations
        this.storageAnalysisCache = null;
        this.storageAnalysisCacheTime = 0;
        this.CACHE_TTL = 30000; // 30 seconds cache TTL
    }

    async initialize() {
        if (this.initialized) return;

        console.log('⚡ Inicializando Nexus Core...');
        this.initialized = true;

        // Cargar configuración del sistema
        this.systemConfig = this.storage.get('nexus_config', {
            performanceMode: 'balanced',
            autoOptimize: true,
            diagnosticsEnabled: true,
            cacheSize: 100
        });

        return true;
    }

    async analyzeSystem() {
        await this.initialize();

        const analysis = {
            timestamp: new Date().toISOString(),
            performance: await this.getPerformanceMetrics(),
            storage: await this.getStorageAnalysis(),
            network: await this.getNetworkStatus(),
            aiProviders: await this.getAIProviderStatus(),
            recommendations: []
        };

        // Generar recomendaciones
        if (analysis.storage.usage > 80) {
            analysis.recommendations.push('💾 Considera limpiar el almacenamiento local');
        }

        if (analysis.performance.memoryUsage > 70) {
            analysis.recommendations.push('🚀 Cierra pestañas innecesarias para mejorar rendimiento');
        }

        if (!analysis.network.isOnline) {
            analysis.recommendations.push('🌐 Estás en modo offline - algunas funciones pueden no estar disponibles');
        }

        this.storage.set('last_analysis', analysis);

        return this.formatAnalysis(analysis);
    }

    async getPerformanceMetrics() {
        if ('memory' in performance) {
            const memory = performance.memory;
            return {
                memoryUsage: Math.round((memory.usedJSHeapSize / memory.totalJSHeapSize) * 100),
                totalMemory: Math.round(memory.totalJSHeapSize / 1048576) + ' MB'
            };
        }

        return {
            memoryUsage: 'No disponible',
            totalMemory: 'No disponible'
        };
    }

    async getStorageAnalysis() {
        // Check cache first to avoid expensive JSON.stringify
        const now = Date.now();
        if (this.storageAnalysisCache && (now - this.storageAnalysisCacheTime) < this.CACHE_TTL) {
            return this.storageAnalysisCache;
        }
        
        // Calculate storage size more efficiently
        let used = 0;
        const len = localStorage.length;
        for (let i = 0; i < len; i++) {
            const key = localStorage.key(i);
            if (key) {
                // Count key + value length instead of stringifying entire storage
                used += key.length + (localStorage.getItem(key) || '').length;
            }
        }
        
        const limit = 5 * 1024 * 1024; // 5MB típico
        const usage = Math.round((used / limit) * 100);

        const result = {
            used: Math.round(used / 1024) + ' KB',
            limit: Math.round(limit / 1024) + ' KB',
            usage: usage
        };
        
        // Cache the result
        this.storageAnalysisCache = result;
        this.storageAnalysisCacheTime = now;
        
        return result;
    }

    async getNetworkStatus() {
        return {
            isOnline: navigator.onLine,
            connectionType: this.getConnectionType(),
            lastOnline: this.storage.get('last_online', 'N/A')
        };
    }

    async getAIProviderStatus() {
        const settings = new SettingsManager();
        await settings.loadSettings();

        return {
            gemini: {
                configured: !!settings.getAPIKey('gemini'),
                status: !!settings.getAPIKey('gemini') ? '✅ Configurado' : '❌ No configurado'
            },
            deepseek: {
                configured: !!settings.getAPIKey('deepseek'),
                status: !!settings.getAPIKey('deepseek') ? '✅ Configurado' : '❌ No configurado'
            },
            nexus: {
                configured: true,
                status: '✅ Siempre disponible'
            }
        };
    }

    getConnectionType() {
        if ('connection' in navigator) {
            return navigator.connection.effectiveType || 'desconocido';
        }
        return 'desconocido';
    }

    formatAnalysis(analysis) {
        let result = '## 📊 Análisis del Sistema Nexus\n\n';

        result += '### 🚀 Rendimiento\n';
        result += `- Uso de memoria: ${analysis.performance.memoryUsage}${typeof analysis.performance.memoryUsage === 'number' ? '%' : ''}\n`;
        result += `- Memoria total: ${analysis.performance.totalMemory}\n\n`;

        result += '### 💾 Almacenamiento\n';
        result += `- Usado: ${analysis.storage.used}\n`;
        result += `- Límite: ${analysis.storage.limit}\n`;
        result += `- Uso: ${analysis.storage.usage}%\n\n`;

        result += '### 🌐 Red\n';
        result += `- En línea: ${analysis.network.isOnline ? '✅ Sí' : '❌ No'}\n`;
        result += `- Tipo de conexión: ${analysis.network.connectionType}\n\n`;

        result += '### 🤖 Proveedores AI\n';
        Object.entries(analysis.aiProviders).forEach(([provider, info]) => {
            result += `- ${provider.charAt(0).toUpperCase() + provider.slice(1)}: ${info.status}\n`;
        });

        if (analysis.recommendations.length > 0) {
            result += '\n### 💡 Recomendaciones\n';
            analysis.recommendations.forEach(rec => {
                result += `- ${rec}\n`;
            });
        }

        return result;
    }

    async optimize() {
        await this.initialize();

        const optimizations = [];

        // Limpiar cache viejo
        const keys = this.storage.keys();
        const now = Date.now();
        let cleaned = 0;

        keys.forEach(key => {
            if (key.startsWith('cache_')) {
                const item = this.storage.get(key);
                if (item && item.timestamp && (now - item.timestamp > 24 * 60 * 60 * 1000)) {
                    this.storage.remove(key);
                    cleaned++;
                }
            }
        });

        if (cleaned > 0) {
            optimizations.push(`🧹 Limpiados ${cleaned} elementos de cache antiguos`);
        }

        // Optimizar configuración
        this.systemConfig.performanceMode = 'optimized';
        this.storage.set('nexus_config', this.systemConfig);
        optimizations.push('⚡ Modo de rendimiento optimizado activado');

        // Forzar garbage collection si está disponible
        if (global.gc) {
            global.gc();
            optimizations.push('🗑️ Recolección de basura forzada');
        }

        return optimizations.length > 0 
            ? `Optimizaciones aplicadas:\n${optimizations.join('\n')}`
            : '✅ El sistema ya está optimizado';
    }

    async diagnose() {
        await this.initialize();

        const diagnostics = {
            app: await this.diagnoseApp(),
            storage: await this.diagnoseStorage(),
            apis: await this.diagnoseAPIs(),
            performance: await this.diagnosePerformance()
        };

        return this.formatDiagnostics(diagnostics);
    }

    async diagnoseApp() {
        const issues = [];
        const warnings = [];

        // Verificar Service Worker
        if (!('serviceWorker' in navigator)) {
            issues.push('Service Worker no soportado');
        }

        // Verificar almacenamiento
        if (!localStorage) {
            issues.push('LocalStorage no disponible');
        }

        // Verificar APIs modernas
        if (!('Promise' in window)) {
            warnings.push('Promises no soportados - navegador antiguo');
        }

        return { issues, warnings };
    }

    async diagnoseStorage() {
        try {
            localStorage.setItem('test', 'test');
            localStorage.removeItem('test');
            return { status: '✅ Funcional', issues: [] };
        } catch (e) {
            return { status: '❌ Con problemas', issues: ['Storage lleno o no disponible'] };
        }
    }

    async diagnoseAPIs() {
        const settings = new SettingsManager();
        await settings.loadSettings();

        const apiStatus = {
            gemini: settings.getAPIKey('gemini') ? '✅ Configurado' : '⚠️ Sin API Key',
            deepseek: settings.getAPIKey('deepseek') ? '✅ Configurado' : '⚠️ Sin API Key',
            fetch: 'fetch' in window ? '✅ Disponible' : '❌ No disponible'
        };

        return apiStatus;
    }

    async diagnosePerformance() {
        const metrics = {
            loadTime: performance.timing ? performance.timing.loadEventEnd - performance.timing.navigationStart : 'N/A',
            memory: 'memory' in performance ? 'Disponible' : 'No disponible',
            cores: navigator.hardwareConcurrency || 'Desconocido'
        };

        return metrics;
    }

    formatDiagnostics(diagnostics) {
        let result = '## 🔧 Diagnóstico Completo del Sistema\n\n';

        result += '### 📱 Estado de la App\n';
        result += `- Problemas: ${diagnostics.app.issues.length}\n`;
        result += `- Advertencias: ${diagnostics.app.warnings.length}\n\n`;

        result += '### 💾 Almacenamiento\n';
        result += `- Estado: ${diagnostics.storage.status}\n`;
        if (diagnostics.storage.issues.length > 0) {
            result += `- Problemas: ${diagnostics.storage.issues.join(', ')}\n`;
        }
        result += '\n';

        result += '### 🔌 APIs y Servicios\n';
        Object.entries(diagnostics.apis).forEach(([api, status]) => {
            result += `- ${api}: ${status}\n`;
        });
        result += '\n';

        result += '### 🚀 Rendimiento\n';
        Object.entries(diagnostics.performance).forEach(([metric, value]) => {
            result += `- ${metric}: ${value}\n`;
        });

        return result;
    }
}
