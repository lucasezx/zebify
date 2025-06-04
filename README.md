# Zebify

Este repositório contém o frontend e o backend da aplicação Zebify.

## Configuração do Backend

Antes de iniciar o servidor é necessário criar um arquivo `.env` dentro da pasta `backend` com as seguintes variáveis (defina `JWT_SECRET` com uma chave de sua escolha):
```
JWT_SECRET=<sua_chave_secreta>
PORT=3001
```

Este arquivo não é versionado e deve ser criado localmente.

Estas variáveis são utilizadas pelo `server.js` para configurar a porta e a chave do JWT.