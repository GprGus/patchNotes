require('dotenv').config();
const { DatabaseSync } = require('node:sqlite');
const bcrypt = require('bcryptjs');
const path = require('path');

const db = new DatabaseSync(path.join(__dirname, 'patchnotes.db'));
db.exec('PRAGMA journal_mode = WAL');
db.exec('PRAGMA foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    name          TEXT    NOT NULL,
    email         TEXT    UNIQUE NOT NULL,
    password_hash TEXT    NOT NULL,
    role          TEXT    NOT NULL DEFAULT 'viewer',
    active        INTEGER NOT NULL DEFAULT 1,
    last_visit    TEXT,
    created_at    TEXT    NOT NULL DEFAULT (datetime('now')),
    updated_at    TEXT    NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS backlog_items (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    title      TEXT    NOT NULL,
    status     TEXT    NOT NULL DEFAULT 'Nova Ideia',
    tags       TEXT    NOT NULL DEFAULT '[]',
    assignee   TEXT    NOT NULL DEFAULT '—',
    priority   TEXT    NOT NULL DEFAULT 'média',
    version    TEXT,
    created_at TEXT    NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT    NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS releases (
    id             INTEGER PRIMARY KEY AUTOINCREMENT,
    version        TEXT UNIQUE NOT NULL,
    date           TEXT NOT NULL,
    name           TEXT NOT NULL,
    status         TEXT NOT NULL DEFAULT 'Em Redação',
    writing_status TEXT NOT NULL DEFAULT 'Rascunho',
    highlight      TEXT NOT NULL DEFAULT '',
    novidades      TEXT NOT NULL DEFAULT '[]',
    melhorias      TEXT NOT NULL DEFAULT '[]',
    correcoes      TEXT NOT NULL DEFAULT '[]',
    created_at     TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at     TEXT NOT NULL DEFAULT (datetime('now'))
  );
`);

function seed() {
  // Usuário master inicial
  if (db.prepare('SELECT COUNT(*) AS c FROM users').get().c === 0) {
    const hash = bcrypt.hashSync(process.env.MASTER_PASSWORD || 'Admin@123', 10);
    db.prepare('INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)').run(
      process.env.MASTER_NAME  || 'Administrador',
      process.env.MASTER_EMAIL || 'admin@lightsystem.com.br',
      hash,
      'master'
    );
    console.log('[DB] Usuário master criado:', process.env.MASTER_EMAIL);
  }

  // Releases iniciais
  if (db.prepare('SELECT COUNT(*) AS c FROM releases').get().c === 0) {
    const ins = db.prepare(`
      INSERT INTO releases (version, date, name, status, writing_status, highlight, novidades, melhorias, correcoes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const seedData = [
      [
        'v2.3.0', '2026-06-20', 'Ciclo Verão', 'Em Redação', 'Revisão Técnica',
        'Redesign completo do dashboard financeiro com novos KPIs em tempo real e exportação nativa para PDF.',
        JSON.stringify([
          { id: 'n1', text: 'Dashboard financeiro com KPIs em tempo real — receita, inadimplência e margem' },
          { id: 'n2', text: 'API REST pública de consulta de estoque com autenticação por token' },
        ]),
        JSON.stringify([
          { id: 'm1', text: 'Exportação de relatórios agora suporta PDF, XLSX e CSV simultaneamente' },
          { id: 'm2', text: 'Filtros avançados na tela de pedidos com salvamento de preferências' },
          { id: 'm3', text: 'Tempo de carregamento do módulo fiscal reduzido em 40%' },
        ]),
        JSON.stringify([]),
      ],
      [
        'v2.2.1', '2026-05-10', 'Hotfix NFe', 'Publicado', 'Publicado',
        'Correção crítica no emissor de NFe 3.10 que causava rejeição no SEFAZ em notas com múltiplos destinatários.',
        JSON.stringify([]),
        JSON.stringify([{ id: 'm4', text: 'Mensagem de erro do SEFAZ agora exibe código e descrição completos' }]),
        JSON.stringify([
          { id: 'c1', text: 'Correção crítica: NFe rejeitada pelo SEFAZ em notas com mais de um destinatário' },
          { id: 'c2', text: 'Cálculo de ICMS-ST incorreto em operações interestaduais para MG e PE' },
          { id: 'c3', text: 'Sessão expirava mesmo com atividade contínua no painel' },
        ]),
      ],
      [
        'v2.2.0', '2026-04-08', 'Simples+ 3.0', 'Publicado', 'Publicado',
        'Grande atualização do módulo Simples+ com nova engine fiscal compatível com as regras de 2026.',
        JSON.stringify([
          { id: 'n3', text: 'Módulo Simples+ 3.0: engine fiscal completamente reescrita para 2026' },
          { id: 'n4', text: 'Painel de auditoria tributária com histórico dos últimos 12 meses' },
        ]),
        JSON.stringify([
          { id: 'm5', text: 'Interface de cadastro de clientes unificada entre Auto Flex e Multi System' },
          { id: 'm6', text: 'Busca inteligente com sugestões por nome, CNPJ ou código interno' },
        ]),
        JSON.stringify([
          { id: 'c4', text: 'Importação de XML de fornecedores falhava para arquivos acima de 5 MB' },
          { id: 'c5', text: 'Campo de data de entrega não respeitava fuso horário configurado' },
        ]),
      ],
      [
        'v2.1.0', '2026-02-14', 'Conectividade', 'Publicado', 'Publicado',
        'Lançamento das integrações com Mercado Pago, Bling e WooCommerce.',
        JSON.stringify([
          { id: 'n5', text: 'Integração nativa com Mercado Pago para pagamentos e split' },
          { id: 'n6', text: 'Conector com Bling ERP para sincronização bidirecional de estoque' },
          { id: 'n7', text: 'Plugin WooCommerce para e-commerce integrado ao Auto Flex' },
        ]),
        JSON.stringify([{ id: 'm7', text: 'Webhooks agora com retry automático e log de falhas' }]),
        JSON.stringify([{ id: 'c6', text: 'Relatório de vendas por período gerava totais duplicados em alguns casos' }]),
      ],
    ];
    db.exec('BEGIN');
    for (const row of seedData) ins.run(...row);
    db.exec('COMMIT');
    console.log('[DB] Releases populadas');
  }

  // Backlog inicial
  if (db.prepare('SELECT COUNT(*) AS c FROM backlog_items').get().c === 0) {
    const ins = db.prepare(`
      INSERT INTO backlog_items (title, status, tags, assignee, priority, version)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    const seedData = [
      ['Dashboard financeiro redesenhado',              'Em Desenvolvimento', JSON.stringify(['Alto Impacto', 'UI/UX']),          'Lucas M.',    'alta',  'v2.3.0'],
      ['Exportação de relatórios em PDF',               'Aprovado',           JSON.stringify(['UI/UX']),                          'Fernanda C.', 'média', 'v2.3.0'],
      ['Bug no cálculo de ICMS em pedidos parcelados',  'Em Análise',         JSON.stringify(['Correção Crítica', 'Back-end']),   'Rafael S.',   'alta',  null    ],
      ['Integração com NFe 4.0',                        'Nova Ideia',         JSON.stringify(['Integração', 'Back-end']),         '—',           'alta',  null    ],
      ['Filtro avançado na tela de pedidos',            'Aprovado',           JSON.stringify(['UI/UX']),                          'Fernanda C.', 'média', 'v2.3.0'],
      ['API REST de consulta de estoque em tempo real', 'Em Desenvolvimento', JSON.stringify(['Back-end', 'Integração']),         'Rafael S.',   'alta',  'v2.3.0'],
      ['Módulo de autenticação por dois fatores',       'Em Análise',         JSON.stringify(['Segurança']),                      'Lucas M.',    'alta',  null    ],
      ['Cache de consultas frequentes no Auto Flex',    'Nova Ideia',         JSON.stringify(['Performance', 'Back-end']),        '—',           'média', null    ],
      ['App mobile para consulta de pedidos',           'Nova Ideia',         JSON.stringify(['Mobile', 'UI/UX']),                '—',           'baixa', null    ],
      ['Modo escuro no Multi System Visual',            'Em Análise',         JSON.stringify(['UI/UX']),                          'Fernanda C.', 'média', null    ],
    ];
    db.exec('BEGIN');
    for (const row of seedData) ins.run(...row);
    db.exec('COMMIT');
    console.log('[DB] Backlog populado');
  }
}

module.exports = { db, seed };
