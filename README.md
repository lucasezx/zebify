# Zebify

Este repositório contém o frontend e o backend da aplicação Zebify.

## Configuração do Backend

Antes de iniciar o servidor é necessário criar um arquivo `.env` dentro da pasta `backend` com as seguintes variáveis:

```
JWT_SECRET=zebify_super_secreto
PORT=3001
```

Estas variáveis são utilizadas pelo `server.js` para configurar a porta e a chave do JWT.

## Frontend com Tailwind

O frontend utiliza [Tailwind CSS](https://tailwindcss.com) para os estilos.
Dentro da pasta `frontend` rode `npm install` para garantir que as dependências
de desenvolvimento estejam instaladas e, em seguida, `npm start` para iniciar a
aplicação em modo de desenvolvimento.

Os estilos do Tailwind são definidos em `src/index.css` e compilados pelo
`postcss` configurado em `postcss.config.js`.
