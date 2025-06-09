# Zebify

Zebify é uma aplicação fullstack que simula uma rede social, desenvolvida com Node.js no backend e React no frontend, estilizada com Tailwind CSS.

---

## 🧠 Estrutura do Projeto

```
zebify/
├── backend/       # API REST com Express e autenticação JWT
├── frontend/      # Interface do usuário com React + Tailwind
└── setup.sh       # Script para configuração automática em novas máquinas
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

- Usa Node.js v18 com `nvm`
- Instala todas as dependências do frontend e backend
- Prepara o ambiente em qualquer máquina nova

---

## 🔐 Configuração do Backend

Crie um arquivo `.env` dentro da pasta `backend` com as seguintes variáveis:

```env
JWT_SECRET=<zebify_super_secreto>
PORT=3001
```

> Esse arquivo **não é versionado** por segurança (`.env` está incluído no `.gitignore`).

---

## 💻 Executar o Frontend

O frontend usa [Tailwind CSS](https://tailwindcss.com) para os estilos.

1. Acesse a pasta:

```bash
cd frontend
```

2. Inicie a aplicação:

```bash
npm start
```

Tailwind está configurado em:

- `tailwind.config.js`
- `postcss.config.js`
- `src/index.css`

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

---

## ✅ Boas Práticas

- Sempre use Node.js 18 (definido em `.nvmrc`)
- Nunca envie `node_modules/` para o Git
- Use `./setup.sh` sempre que mudar de máquina ou clonar o projeto

---

## 📄 Licença

Projeto acadêmico desenvolvido com fins educacionais.