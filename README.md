# 📋 Patch Notes Dashboard — Light System Soft

Painel de patch notes completo com três módulos: Backlog (Kanban), Gerenciamento de Release e Release Notes Pública.

## Pré-requisitos

- [Node.js](https://nodejs.org/) versão **18 ou superior**
- npm (vem junto com o Node) ou yarn/pnpm

## Como rodar localmente

```bash
# 1. Instale as dependências
npm install

# 2. Inicie o servidor de desenvolvimento
npm run dev
```

O terminal vai exibir algo como:

```
  VITE v6.x.x  ready in Xms

  ➜  Local:   http://localhost:5173/
  ➜  Network: http://192.168.x.x:5173/
```

Abra `http://localhost:5173` no navegador.

---

## Scripts disponíveis

| Comando         | Descrição                                      |
|-----------------|------------------------------------------------|
| `npm run dev`   | Inicia o servidor de desenvolvimento com HMR   |
| `npm run build` | Gera build de produção em `/dist`              |
| `npm run preview` | Pré-visualiza o build de produção localmente |

---

## Estrutura do projeto

```
lightsystem-patchnotes/
├── public/
│   └── favicon.svg
├── src/
│   ├── components/
│   │   ├── Backlog.jsx          # Aba interna — Kanban de demandas
│   │   ├── Header.jsx           # Barra de navegação superior
│   │   ├── PublicNotes.jsx      # Aba pública — Release Notes
│   │   ├── ReleaseManagement.jsx # Aba interna — Gerenciamento de versões
│   │   └── ui.jsx               # Primitivos reutilizáveis (Avatar, Tag, Badge)
│   ├── App.jsx                  # Componente raiz + roteamento de abas
│   ├── constants.js             # Tokens de design, cores e constantes
│   ├── data.js                  # Dados mock: backlog e releases
│   ├── index.css                # Reset global e estilos base
│   └── main.jsx                 # Ponto de entrada React
├── index.html
├── package.json
├── vite.config.js
└── README.md
```

---

## Customização rápida

### Trocar data de "última visita" (badge NOVO)
Em `src/constants.js`, altere a constante `LAST_VISIT_DATE`:
```js
export const LAST_VISIT_DATE = "2026-04-20"; // formato YYYY-MM-DD
```

Em produção, esse valor viria de `localStorage` ou de um endpoint de usuário.

### Adicionar uma versão nova
Em `src/data.js`, insira um novo objeto no array `RELEASES`:
```js
{
  version: "v2.4.0",
  date: "2026-09-01",
  name: "Nome da Release",
  status: "Em Redação",           // "Em Redação" | "Publicado"
  writingStatus: "Rascunho",      // veja WRITING_STEPS em constants.js
  highlight: "Descrição do destaque desta versão.",
  novidades: [{ id: "n99", text: "Descrição da novidade" }],
  melhorias: [],
  correcoes: [],
}
```

### Trocar paleta de cores
Todos os tokens de cor estão em `src/constants.js` no objeto `C`. Altere os valores hex conforme necessário.

---

## Funcionalidades implementadas

- **Backlog Kanban** com 4 colunas e movimentação de cards entre status
- **Indicador de prioridade** por cor (alta / média / baixa)
- **Tags categoriais** com cores semânticas
- **Avatares** gerados automaticamente a partir do nome
- **Release Management** com seleção de versão e painel de detalhes
- **Progress tracker** de redação com 5 etapas
- **Área pública** com hero da versão mais recente
- **Badge "NOVO"** automático para versões publicadas após a última visita
- **Busca** com highlight do termo nos itens
- **Filtro** por versão específica
- **"Marcar tudo como lido"** que zera os badges NOVO

---

## Tecnologias

| Lib | Versão | Uso |
|-----|--------|-----|
| React | 18 | UI |
| Vite | 6 | Bundler / Dev server |
| DM Sans | — | Tipografia (Google Fonts) |
