class NexusCore {
    constructor() {
        this.version = '1.0.0';
        this.modules = {
            analyzer: new NexusController(),
            optimizer: new NexusController(),
            diagnostician: new NexusController()
        };
    }

    async initialize() {
        console.log(`⚡ Nexus Core v${this.version} inicializado`);
        return {
            status: 'ready',
            version: this.version,
            modules: Object.keys(this.modules)
        };
    }

    async processCommand(command, data = {}) {
        switch (command) {
            case 'analyze':
                return await this.modules.analyzer.analyzeSystem();
            case 'optimize':
                return await this.modules.optimizer.optimize();
            case 'diagnose':
                return await this.modules.diagnostician.diagnose();
            case 'status':
                return await this.getSystemStatus();
            default:
                throw new Error(`Comando no reconocido: ${command}`);
        }
    }

    async getSystemStatus() {
        const metrics = await this.modules.analyzer.gatherSystemMetrics();
        const score = this.modules.analyzer.calculateSystemScore(metrics);
        
        return {
            status: score >= 80 ? 'optimal' : score >= 60 ? 'acceptable' : 'needs_attention',
            score: score,
            metrics: metrics,
            timestamp: new Date().toISOString()
        };
    }

    // Métodos de utilidad para la aplicación principal
    async quickHealthCheck() {
        try {
            const status = await this.getSystemStatus();
            return {
                healthy: status.score >= 70,
                message: status.score >= 70 ? 
                    'Sistema funcionando correctamente' : 
                    'El sistema necesita atención',
                details: status
            };
        } catch (error) {
            return {
                healthy: false,
                message: 'Error en el chequeo de salud',
                error: error.message
            };
        }
    }

    async getPerformanceTips() {
        const status = await this.getSystemStatus();
        const tips = [];

        if (status.metrics.memoryUsage > 70) {
            tips.push("💡 Cierra pestañas no utilizadas para liberar memoria");
        }
        if (status.metrics.storageUsage > 85) {
            tips.push("💡 Libera espacio de almacenamiento para mejor rendimiento");
        }
        if (status.metrics.networkLatency > 150) {
            tips.push("💡 Verifica tu conexión a internet para mejor velocidad");
        }
        if (status.metrics.batteryLevel < 30) {
            tips.push("💡 Conecta el cargador para óptimo rendimiento");
        }

        if (tips.length === 0) {
            tips.push("🎉 Tu sistema está optimizado. ¡Buen trabajo!");
        }

        return {
            tips: tips,
            basedOn: status
        };
    }
}
