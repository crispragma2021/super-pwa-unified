#!/bin/bash
# Backup inteligente - solo repos con cambios sin push
BACKUP_DIR="$HOME/backups/git-$(date +%Y%m%d)"
mkdir -p "$BACKUP_DIR"

echo "🔍 Buscando repos con cambios..."

# Buscar todos los repos Git
find ~ -name ".git" -type d | while read repo; do
    cd "$(dirname "$repo")"
    
    # Verificar si hay commits sin push
    if [[ -n $(git log origin/master..master 2>/dev/null || git log origin/main..main 2>/dev/null) ]]; then
        PROJECT_NAME=$(basename "$PWD")
        echo "📦 Guardando: $PROJECT_NAME"
        
        # Crear backup como archivo tar
        tar -czf "$BACKUP_DIR/${PROJECT_NAME}-backup-$(date +%H%M).tar.gz" \
            --exclude="node_modules" --exclude=".git" \
            -C "$(dirname "$PWD")" "$PROJECT_NAME"
    fi
done

echo "✅ Backup completado en: $BACKUP_DIR"
ls -lh "$BACKUP_DIR"
