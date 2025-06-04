# Zebify

Este repositório contém o frontend e o backend da aplicação Zebify.

## Configuração do Backend

Antes de iniciar o servidor é necessário criar um arquivo `.env` dentro da pasta `backend` com as seguintes variáveis:

```
JWT_SECRET=zebify_super_secreto
PORT=3001
```

Estas variáveis são utilizadas pelo `server.js` para configurar a porta e a chave do JWT.