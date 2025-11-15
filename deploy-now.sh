#!/bin/bash
# Deploy actual a gh-pages
BRANCH="gh-pages"
COMMIT_MSG="deploy: PWA instalable + estilos + IA + CI/CD"

git checkout "$BRANCH"
git rm -rf .
git checkout master -- .
git add .
git commit -m "$COMMIT_MSG"
git push -f origin "$BRANCH"
git checkout master
echo "✅ Deploy realizado"
