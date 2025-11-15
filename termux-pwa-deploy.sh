#!/bin/bash
DIST_DIR="${1:-dist}"
BRANCH="gh-pages"
COMMIT_MSG="deploy: $(date +%Y%m%d-%H:%M)"

cd ~/super-pwa-unified || { echo "❌ No encontrado"; exit 1; }

if [[ ! -d "$DIST_DIR" ]]; then
    echo "❌ No se encontró $DIST_DIR"
    echo "💡 Crea tu build con: npm run build"
    exit 1
fi

git checkout --orphan $BRANCH
git rm -rf .
cp -r $DIST_DIR/* .
echo "# Super PWA Unified" > README.md
git add .
git commit -m "$COMMIT_MSG"
git push -f origin $BRANCH
git checkout master

echo "✅ Deploy completado!"
echo "🌐 Tu PWA está en: https://crispragma2021.github.io/super-pwa-unified/"
