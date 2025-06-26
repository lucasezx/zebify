#!/usr/bin/env bash
set -euo pipefail

# Carrega o NVM caso este shell não seja interativo
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# 0. Certifica-te de já ter o nvm carregado
if ! command -v nvm >/dev/null 2>&1; then
  echo "nvm não encontrado. Instala primeiro: https://github.com/nvm-sh/nvm" >&2
  exit 1
fi

# 1. Instala / usa a versão definida em .nvmrc (22)
nvm install
nvm use

# 2. Backend
pushd backend >/dev/null
rm -f package-lock.json
npm install
popd >/dev/null

# 3. Frontend
pushd frontend >/dev/null
rm -f package-lock.json
npm install
popd >/dev/null

echo "✔️  Ambiente pronto com Node $(node -v)"
