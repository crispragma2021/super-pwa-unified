class RAGEngine {
    constructor() {
        this.documents = new Map();
        this.index = new Map();
        this.storage = new StorageManager();
        this.initialized = false;
    }

    async initialize() {
        if (this.initialized) return;

        // Cargar documentos existentes
        const savedDocs = this.storage.loadRAGDocuments();
        savedDocs.forEach(doc => {
            this.addDocumentToIndex(doc);
        });

        this.initialized = true;
        console.log('🔍 RAG Engine inicializado con', this.documents.size, 'documentos');
    }

    async search(query, options = {}) {
        await this.initialize();

        const {
            maxResults = 5,
            minScore = 0.3,
            useSemantic = true
        } = options;

        if (!query.trim()) {
            return {
                query,
                results: [],
                total: 0,
                message: 'Por favor ingresa un término de búsqueda'
            };
        }

        let results = [];

        if (useSemantic) {
            results = this.semanticSearch(query);
        } else {
            results = this.keywordSearch(query);
        }

        // Filtrar y ordenar resultados
        const filteredResults = results
            .filter(result => result.score >= minScore)
            .sort((a, b) => b.score - a.score)
            .slice(0, maxResults);

        return {
            query,
            results: filteredResults,
            total: filteredResults.length,
            searchType: useSemantic ? 'semántica' : 'por palabras clave'
        };
    }

    semanticSearch(query) {
        const queryTerms = this.tokenize(query.toLowerCase());
        const results = [];

        this.documents.forEach((doc, id) => {
            const score = this.calculateSimilarity(queryTerms, doc.tokens);
            if (score > 0) {
                results.push({
                    id,
                    document: doc,
                    score,
                    matches: this.findMatches(queryTerms, doc.tokens)
                });
            }
        });

        return results;
    }

    keywordSearch(query) {
        const queryTerms = this.tokenize(query.toLowerCase());
        const results = [];
        
        // Pre-compile regex patterns outside the loop for better performance
        const regexPatterns = queryTerms.map(term => ({
            term,
            regex: new RegExp(term, 'g')
        }));

        this.documents.forEach((doc, id) => {
            let score = 0;
            const matches = [];

            regexPatterns.forEach(({ term, regex }) => {
                if (doc.tokens.includes(term)) {
                    score += 0.5;
                    matches.push(term);
                }

                // Buscar en contenido también
                const contentMatches = (doc.content.toLowerCase().match(regex) || []).length;
                score += contentMatches * 0.1;
            });

            if (score > 0) {
                results.push({
                    id,
                    document: doc,
                    score: Math.min(score, 1),
                    matches
                });
            }
        });

        return results;
    }

    tokenize(text) {
        return text
            .toLowerCase()
            .replace(/[^\w\sáéíóúñ]/g, '')
            .split(/\s+/)
            .filter(term => term.length > 2);
    }

    calculateSimilarity(queryTerms, docTokens) {
        const querySet = new Set(queryTerms);
        const docSet = new Set(docTokens);

        const intersection = new Set([...querySet].filter(x => docSet.has(x)));
        const union = new Set([...querySet, ...docSet]);

        if (union.size === 0) return 0;

        // Coeficiente de Jaccard
        const jaccard = intersection.size / union.size;

        // Ponderar términos más largos
        const lengthBonus = queryTerms.reduce((sum, term) => {
            return sum + (term.length > 5 ? 0.1 : 0);
        }, 0);

        return Math.min(jaccard + lengthBonus, 1);
    }

    findMatches(queryTerms, docTokens) {
        return queryTerms.filter(term => docTokens.includes(term));
    }

    addDocument(content, metadata = {}) {
        const id = this.generateId();
        const tokens = this.tokenize(content);

        const document = {
            id,
            content,
            tokens,
            metadata: {
                title: metadata.title || `Documento ${id}`,
                source: metadata.source || 'user',
                timestamp: new Date().toISOString(),
                ...metadata
            }
        };

        this.documents.set(id, document);
        this.addDocumentToIndex(document);

        // Guardar en almacenamiento
        this.saveDocuments();

        return id;
    }

    addDocumentToIndex(doc) {
        doc.tokens.forEach(token => {
            if (!this.index.has(token)) {
                this.index.set(token, new Set());
            }
            this.index.get(token).add(doc.id);
        });
    }

    generateId() {
        return 'doc_' + Date.now() + '_' + Math.random().toString(36).slice(2, 11);
    }

    saveDocuments() {
        const documents = Array.from(this.documents.values());
        this.storage.saveRAGDocuments(documents);
    }

    removeDocument(id) {
        const doc = this.documents.get(id);
        if (doc) {
            // Remover del índice
            doc.tokens.forEach(token => {
                if (this.index.has(token)) {
                    this.index.get(token).delete(id);
                    if (this.index.get(token).size === 0) {
                        this.index.delete(token);
                    }
                }
            });

            // Remover del almacenamiento
            this.documents.delete(id);
            this.saveDocuments();
        }
    }

    clearDocuments() {
        this.documents.clear();
        this.index.clear();
        this.storage.remove('rag_documents');
    }

    getDocumentCount() {
        return this.documents.size;
    }

    displayResults(results, container) {
        if (!results.results || results.results.length === 0) {
            container.innerHTML = `
                <div class="no-results">
                    <p>🔍 No se encontraron resultados para: "${results.query}"</p>
                    <p class="suggestion">Intenta con otros términos o agrega más documentos.</p>
                </div>
            `;
            return;
        }

        let html = `
            <div class="search-info">
                <p>Encontrados ${results.total} resultados (${results.searchType})</p>
            </div>
        `;

        results.results.forEach((result, index) => {
            const preview = this.getPreview(result.document.content, 150);
            const matchInfo = result.matches.length > 0 ? 
                `Coincidencias: ${result.matches.join(', ')}` : '';

            html += `
                <div class="search-result" data-score="${result.score.toFixed(2)}">
                    <div class="result-header">
                        <h3>${result.document.metadata.title}</h3>
                        <span class="score">${(result.score * 100).toFixed(0)}% relevante</span>
                    </div>
                    <div class="result-content">
                        <p>${preview}</p>
                        ${matchInfo ? `<div class="matches">${matchInfo}</div>` : ''}
                    </div>
                    <div class="result-meta">
                        <span class="source">Fuente: ${result.document.metadata.source}</span>
                        <span class="date">${new Date(result.document.metadata.timestamp).toLocaleDateString()}</span>
                    </div>
                </div>
            `;
        });

        container.innerHTML = html;
    }

    getPreview(content, maxLength) {
        if (content.length <= maxLength) return content;
        
        // Use slice instead of deprecated substr
        return content.slice(0, maxLength) + '...';
    }

    // Método para agregar documentos de ejemplo
    addSampleDocuments() {
        const samples = [
            {
                content: "La inteligencia artificial está transformando la manera en que interactuamos con la tecnología. Desde asistentes virtuales hasta sistemas de recomendación, la IA está presente en muchas aplicaciones modernas.",
                metadata: {
                    title: "Introducción a la IA",
                    source: "conocimiento general"
                }
            },
            {
                content: "Las Progressive Web Apps (PWA) combinan lo mejor de las aplicaciones web y móviles. Ofrecen experiencias similares a las apps nativas con la accesibilidad de la web.",
                metadata: {
                    title: "Qué son las PWA",
                    source: "desarrollo web"
                }
            },
            {
                content: "El machine learning es un subcampo de la inteligencia artificial que se centra en el desarrollo de algoritmos que pueden aprender de los datos y hacer predicciones.",
                metadata: {
                    title: "Machine Learning Básico",
                    source: "ciencia de datos"
                }
            }
        ];

        samples.forEach(sample => {
            this.addDocument(sample.content, sample.metadata);
        });

        return samples.length;
    }
}
