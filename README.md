# Patch Notes Dashboard — Light System Soft

Painel de patch notes completo com três módulos: Backlog (Kanban), Gerenciamento de Release e Release Notes Pública.

Arquitetura full-stack: frontend React (Vite) + API Express + banco SQLite embutido no Node.js.

## Pré-requisitos

- [Node.js](https://nodejs.org/) versão **22 ou superior** (necessário para `node:sqlite` nativo)
- npm (vem junto com o Node)

## Deploy (Railway + Vercel)

### 1. Backend no Railway

1. Crie uma conta em [railway.app](https://railway.app) e um novo projeto
2. Conecte o repositório GitHub
3. O `railway.json` na raiz já configura build e start automaticamente
4. Em **Variables**, adicione:

| Variável | Valor |
|---|---|
| `JWT_SECRET` | string aleatória longa |
| `MASTER_EMAIL` | seu email de admin |
| `MASTER_PASSWORD` | senha forte |
| `MASTER_NAME` | seu nome |
| `CORS_ORIGIN` | URL do Vercel (ex: `https://seu-app.vercel.app`) |

5. Após o deploy, copie a URL pública gerada (ex: `https://xyz.up.railway.app`)

> **SQLite e persistência:** O banco (`patchnotes.db`) fica no sistema de arquivos do container e é resetado a cada novo deploy. Para persistência real, crie um **Volume** no Railway e aponte `DB_PATH` para o ponto de montagem (ex: `/data/patchnotes.db`), ajustando `db.js` para ler `process.env.DB_PATH`.

### 2. Frontend no Vercel

1. Crie uma conta em [vercel.com](https://vercel.com) e importe o repositório
2. O `vercel.json` na raiz já configura o build
3. Em **Environment Variables**, adicione:

| Variável | Valor |
|---|---|
| `VITE_API_URL` | URL do Railway (ex: `https://xyz.up.railway.app`) |

4. Faça o deploy — o Vercel vai rodar `npm run build` e publicar a pasta `dist`

---

## Como rodar localmente

```bash
# 1. Instale as dependências do frontend
npm install

# 2. Instale as dependências do servidor
npm run setup:server

# 3. Configure as variáveis de ambiente do servidor
copy server\.env.example server\.env
# Edite server/.env com seus valores (veja seção Variáveis de Ambiente abaixo)

# 4. Inicie frontend + API ao mesmo tempo
npm run dev
```

O terminal exibirá:

```
[API] http://localhost:3001
  ➜  Local:   http://localhost:5173/
```

Acesse `http://localhost:5173` no navegador. O primeiro usuário **master** é criado automaticamente ao iniciar a API (credenciais definidas no `.env`).

---

## Variáveis de Ambiente

Crie o arquivo `server/.env`:

```env
JWT_SECRET=troque-por-uma-string-longa-e-aleatoria
MASTER_NAME=Administrador
MASTER_EMAIL=admin@lightsystem.com.br
MASTER_PASSWORD=Admin@123
PORT=3001
```

> O usuário master só é inserido na primeira execução (banco vazio). Para redefinir, apague `server/patchnotes.db`.

---

## Scripts disponíveis

| Comando                | Descrição                                              |
|------------------------|--------------------------------------------------------|
| `npm run dev`          | Inicia API + frontend em paralelo (recomendado)        |
| `npm run dev:ui`       | Somente o frontend Vite com HMR                        |
| `npm run dev:api`      | Somente a API Express com `--watch`                    |
| `npm run build`        | Gera build de produção em `/dist`                      |
| `npm run preview`      | Pré-visualiza o build de produção localmente           |
| `npm run setup:server` | Instala dependências do servidor (`server/`)           |

---

## Estrutura do projeto

```
lightsystem-patchnotes/
├── public/
│   └── favicon.svg
├── server/
│   ├── middleware/
│   │   └── auth.js              # Middlewares verifyToken e requireRole
│   ├── routes/
│   │   ├── auth.js              # POST /auth/login, GET /auth/me
│   │   ├── backlog.js           # CRUD /backlog
│   │   ├── releases.js          # CRUD /releases
│   │   └── users.js             # CRUD /users (master only)
│   ├── db.js                    # Schema SQLite + seed inicial
│   ├── index.js                 # Entry point Express
│   ├── package.json
│   └── .env                     # Não versionado
├── src/
│   ├── components/
│   │   ├── admin/
│   │   │   └── UserManagement.jsx   # Gerenciamento de usuários (master)
│   │   ├── Backlog.jsx              # Aba interna — Kanban de demandas
│   │   ├── Header.jsx               # Barra de navegação superior
│   │   ├── Login.jsx                # Tela de login
│   │   ├── PublicNotes.jsx          # Aba pública — Release Notes
│   │   ├── ReleaseManagement.jsx    # Aba interna — Gerenciamento de versões
│   │   └── ui.jsx                   # Primitivos reutilizáveis (Avatar, Tag, Badge)
│   ├── context/
│   │   └── AuthContext.jsx          # Estado de autenticação global + authFetch
│   ├── App.jsx                      # Componente raiz + roteamento de abas
│   ├── constants.js                 # Tokens de design, cores e constantes
│   ├── data.js                      # Dados estáticos de fallback
│   ├── index.css                    # Reset global e estilos base
│   └── main.jsx                     # Ponto de entrada React
├── index.html
├── package.json
├── vite.config.js
└── README.md
```

---

## Autenticação e Perfis

O sistema usa JWT (Bearer token) armazenado no `localStorage`. Há três perfis:

| Perfil        | Acesso                                                              |
|---------------|---------------------------------------------------------------------|
| `master`      | Acesso total: backlog, releases, gerenciamento de usuários          |
| `developer`   | Backlog e Release Management                                        |
| `viewer`      | Somente Release Notes pública                                       |

O perfil `master` inicial é criado via seed na primeira execução. Novos usuários são criados pelo painel de **Gerenciamento de Usuários** (visível apenas para masters).

---

## API — Endpoints principais

Todos os endpoints (exceto login) exigem header `Authorization: Bearer <token>`.

| Método   | Rota                  | Descrição                          |
|----------|-----------------------|------------------------------------|
| `POST`   | `/auth/login`         | Login (retorna JWT)                |
| `GET`    | `/auth/me`            | Retorna usuário autenticado        |
| `GET`    | `/backlog`            | Lista itens do backlog             |
| `POST`   | `/backlog`            | Cria item                          |
| `PATCH`  | `/backlog/:id`        | Atualiza item                      |
| `DELETE` | `/backlog/:id`        | Remove item                        |
| `GET`    | `/releases`           | Lista releases                     |
| `POST`   | `/releases`           | Cria release                       |
| `PATCH`  | `/releases/:id`       | Atualiza release                   |
| `DELETE` | `/releases/:id`       | Remove release                     |
| `GET`    | `/users`              | Lista usuários (master)            |
| `POST`   | `/users`              | Cria usuário (master)              |
| `PATCH`  | `/users/:id`          | Atualiza usuário (master)          |
| `DELETE` | `/users/:id`          | Remove usuário (master)            |

---

## Banco de Dados

SQLite nativo via `node:sqlite` (Node 22+). Arquivo em `server/patchnotes.db`.

Tabelas: `users`, `backlog_items`, `releases`.

Para resetar o banco e recriar o seed, apague `server/patchnotes.db` e reinicie a API.

---

## Funcionalidades implementadas

- **Login** com autenticação JWT e proteção por perfil de acesso
- **Backlog Kanban** com 4 colunas e movimentação de cards entre status
- **Indicador de prioridade** por cor (alta / média / baixa)
- **Tags categoriais** com cores semânticas
- **Avatares** gerados automaticamente a partir do nome
- **Release Management** com seleção de versão e painel de detalhes
- **Progress tracker** de redação com 5 etapas
- **Área pública** com hero da versão mais recente publicada
- **Badge "NOVO"** automático para versões publicadas após a última visita
- **Busca** com highlight do termo nos itens
- **Filtro** por versão específica
- **"Marcar tudo como lido"** que zera os badges NOVO
- **Gerenciamento de usuários** (criação, edição, ativação/desativação — master only)

---

## Tecnologias

| Lib / Runtime  | Versão | Uso                          |
|----------------|--------|------------------------------|
| React          | 18     | UI                           |
| Vite           | 6      | Bundler / Dev server         |
| Express        | 4      | API REST                     |
| node:sqlite    | —      | Banco de dados (Node 22 nativo) |
| jsonwebtoken   | 9      | Autenticação JWT             |
| bcryptjs       | 2      | Hash de senhas               |
| concurrently   | 8      | Rodar API + UI em paralelo   |
| DM Sans        | —      | Tipografia (Google Fonts)    |
