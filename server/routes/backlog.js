const express = require('express');
const { db } = require('../db');
const { verifyToken, requireRole } = require('../middleware/auth');

const router = express.Router();
const VALID_STATUSES  = ['Nova Ideia', 'Em Análise', 'Aprovado', 'Em Desenvolvimento'];
const VALID_PRIORITIES = ['alta', 'média', 'baixa'];

function parse(row) {
  return { ...row, tags: JSON.parse(row.tags) };
}

router.get('/', verifyToken, (req, res) => {
  const items = db.prepare('SELECT * FROM backlog_items ORDER BY created_at DESC').all().map(parse);
  res.json({ items });
});

router.post('/', requireRole('master', 'developer'), (req, res) => {
  const { title, status, tags, assignee, priority, version } = req.body || {};
  if (!title?.trim()) return res.status(400).json({ error: 'Título é obrigatório' });

  const result = db.prepare(`
    INSERT INTO backlog_items (title, status, tags, assignee, priority, version)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(
    title.trim(),
    VALID_STATUSES.includes(status)    ? status   : 'Nova Ideia',
    JSON.stringify(Array.isArray(tags) ? tags      : []),
    assignee?.trim() || '—',
    VALID_PRIORITIES.includes(priority) ? priority : 'média',
    version?.trim() || null
  );

  const item = parse(db.prepare('SELECT * FROM backlog_items WHERE id = ?').get(result.lastInsertRowid));
  res.status(201).json({ item });
});

router.put('/:id', requireRole('master', 'developer'), (req, res) => {
  const { id } = req.params;
  const existing = db.prepare('SELECT * FROM backlog_items WHERE id = ?').get(id);
  if (!existing) return res.status(404).json({ error: 'Item não encontrado' });

  const { title, status, tags, assignee, priority, version } = req.body || {};
  db.prepare(`
    UPDATE backlog_items
    SET title=?, status=?, tags=?, assignee=?, priority=?, version=?, updated_at=datetime('now')
    WHERE id=?
  `).run(
    title?.trim()                          || existing.title,
    VALID_STATUSES.includes(status)         ? status    : existing.status,
    tags !== undefined ? JSON.stringify(Array.isArray(tags) ? tags : []) : existing.tags,
    assignee?.trim()                       || existing.assignee,
    VALID_PRIORITIES.includes(priority)     ? priority  : existing.priority,
    version !== undefined ? (version?.trim() || null)   : existing.version,
    id
  );

  const item = parse(db.prepare('SELECT * FROM backlog_items WHERE id = ?').get(id));
  res.json({ item });
});

router.delete('/:id', requireRole('master', 'developer'), (req, res) => {
  const result = db.prepare('DELETE FROM backlog_items WHERE id = ?').run(req.params.id);
  if (result.changes === 0) return res.status(404).json({ error: 'Item não encontrado' });
  res.json({ ok: true });
});

module.exports = router;
