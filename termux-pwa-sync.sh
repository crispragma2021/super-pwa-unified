#!/bin/bash
# termux-pwa-sync.sh - Sync automático de Super PWA Unified v1.0
# Autor: crispragma2021
# Uso: ./termux-pwa-sync.sh [mensaje_opcional]

REPO_DIR="$HOME/super-pwa-unified"
COMMIT_MSG="${1:-auto: $(date +%Y%m%d-%H:%M)}"

cd "$REPO_DIR" || { echo "❌ No se encontró $REPO_DIR"; exit 1; }

# Verificar cambios
if [[ -n $(git status --porcelain) ]]; then
    git add .
    git commit -m "$COMMIT_MSG" -m "Sync desde Termux"
    git push && echo "✅ Super PWA actualizado en GitHub"
else
    echo "ℹ️ Sin cambios para sincronizar"
fi
