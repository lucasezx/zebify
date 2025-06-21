# Zebify

Zebify é uma aplicação fullstack que simula uma rede social, desenvolvida com Node.js no backend e React no frontend, estilizada com Tailwind CSS.

---

## 🧠 Estrutura do Projeto

```
zebify/
├── backend/       API REST com Express e autenticação JWT
├── frontend/      Interface do usuário com React + Tailwind
└── setup.sh       Script de configuração automática (nvm + npm ci)
```

---

## ⚙️ Configuração Inicial

### 1. Clone o repositório:

```bash
git clone https://github.com/lucasezx/zebify.git
cd zebify
```

### 2. Rode o script de configuração:

```bash
./setup.sh
```

Esse script:

- Usa automaticamente o Node.js **v22** via [nvm](https://github.com/nvm-sh/nvm)
- Instala as dependências do frontend e backend com `npm ci`
- Prepara o ambiente em qualquer máquina nova

---

## 🔐 Configuração do Backend

Crie um arquivo `.env` dentro da pasta `backend` com as seguintes variáveis:

```env
JWT_SECRET=<zebify_super_secreto>
PORT=3001
```

> Esse arquivo **não é versionado** por segurança (`.env` está incluído no `.gitignore`)

---

## 💻 Executar o Projeto

### Backend (API)

```bash
cd backend
npm start    # ou: node server.js
```

### Frontend (React + Vite)

```bash
cd frontend
npm run dev
```

A aplicação estará acessível em `http://localhost:5173`

---

## 📦 Principais Tecnologias

**Frontend**

- React 18
- React Router DOM
- Tailwind CSS
- Socket.IO Client

**Backend**

- Express
- JSON Web Token (JWT)
- bcrypt
- dotenv
- SQLite3
- Socket.IO

---

## ✅ Boas Práticas

- Use **Node.js 22** (definido em `.nvmrc`)
- Rode `./setup.sh` sempre que clonar ou reinstalar o projeto
- Nunca envie `node_modules/` ou `.env` para o Git
- Faça commits limpos e frequentes

---

## 📄 Licença

Projeto acadêmico desenvolvido com fins educacionais — PAP (Prova de Aptidão Profissional).