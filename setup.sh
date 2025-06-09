#!/bin/bash

echo "🛠️  Iniciando configuração do ambiente Zebify..."

# Verifica se nvm está instalado
if ! command -v nvm &> /dev/null; then
  echo "❌ NVM não encontrado. Instalando NVM..."
  curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
  source ~/.nvm/nvm.sh
else
  echo "✅ NVM encontrado."
fi

# Usa Node 18 via .nvmrc
if [ -f ".nvmrc" ]; then
  echo "📦 Usando Node $(cat .nvmrc) via .nvmrc"
  nvm install
  nvm use
else
  echo "⚠️  Nenhum .nvmrc encontrado. Criando com Node 18..."
  echo "18" > .nvmrc
  nvm install 18
  nvm use 18
fi

# Instala dependências do frontend
if [ -d "frontend" ]; then
  echo "📁 Instalando dependências do frontend..."
  cd frontend
  rm -rf node_modules package-lock.json
  npm install
  cd ..
else
  echo "❌ Pasta 'frontend' não encontrada!"
fi

# Instala dependências do backend
if [ -d "backend" ]; then
  echo "📁 Instalando dependências do backend..."
  cd backend
  rm -rf node_modules package-lock.json
  npm install
  cd ..
else
  echo "⚠️  Pasta 'backend' não encontrada (ok se não tiver backend JS)."
fi

echo "✅ Ambiente configurado com sucesso!"
echo "➡️  Agora você pode rodar: cd frontend && npm start"
