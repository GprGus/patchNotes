const express = require('express');
const { db } = require('../db');
const { verifyToken, requireRole } = require('../middleware/auth');

const router = express.Router();

const WRITING_STEPS = [
  'Rascunho',
  'Revisão Técnica',
  'Revisão de Marketing',
  'Pronto para Publicar',
  'Publicado',
];

function parse(row) {
  return {
    ...row,
    novidades: JSON.parse(row.novidades),
    melhorias: JSON.parse(row.melhorias),
    correcoes: JSON.parse(row.correcoes),
  };
}

router.get('/', verifyToken, (req, res) => {
  const releases = db.prepare('SELECT * FROM releases ORDER BY date DESC').all().map(parse);
  res.json({ releases });
});

router.get('/:version', verifyToken, (req, res) => {
  const row = db.prepare('SELECT * FROM releases WHERE version = ?').get(req.params.version);
  if (!row) return res.status(404).json({ error: 'Versão não encontrada' });
  res.json({ release: parse(row) });
});

router.post('/', requireRole('master', 'developer'), (req, res) => {
  const { version, date, name, highlight } = req.body || {};
  if (!version?.trim() || !date || !name?.trim()) {
    return res.status(400).json({ error: 'Versão, data e nome são obrigatórios' });
  }

  const exists = db.prepare('SELECT id FROM releases WHERE version = ?').get(version.trim());
  if (exists) return res.status(409).json({ error: 'Esta versão já existe' });

  const result = db.prepare(`
    INSERT INTO releases (version, date, name, status, writing_status, highlight, novidades, melhorias, correcoes)
    VALUES (?, ?, ?, 'Em Redação', 'Rascunho', ?, '[]', '[]', '[]')
  `).run(version.trim(), date, name.trim(), highlight?.trim() || '');

  const release = parse(db.prepare('SELECT * FROM releases WHERE id = ?').get(result.lastInsertRowid));
  res.status(201).json({ release });
});

router.put('/:version', requireRole('master', 'developer'), (req, res) => {
  const { version } = req.params;
  const existing = db.prepare('SELECT * FROM releases WHERE version = ?').get(version);
  if (!existing) return res.status(404).json({ error: 'Versão não encontrada' });

  const { date, name, writing_status, highlight, novidades, melhorias, correcoes } = req.body || {};

  const newWritingStatus = WRITING_STEPS.includes(writing_status) ? writing_status : existing.writing_status;
  const newStatus = newWritingStatus === 'Publicado' ? 'Publicado' : 'Em Redação';

  db.prepare(`
    UPDATE releases
    SET date=?, name=?, status=?, writing_status=?, highlight=?,
        novidades=?, melhorias=?, correcoes=?, updated_at=datetime('now')
    WHERE version=?
  `).run(
    date               || existing.date,
    name?.trim()       || existing.name,
    newStatus,
    newWritingStatus,
    highlight !== undefined ? highlight.trim() : existing.highlight,
    novidades !== undefined ? JSON.stringify(novidades) : existing.novidades,
    melhorias !== undefined ? JSON.stringify(melhorias) : existing.melhorias,
    correcoes !== undefined ? JSON.stringify(correcoes) : existing.correcoes,
    version
  );

  const release = parse(db.prepare('SELECT * FROM releases WHERE version = ?').get(version));
  res.json({ release });
});

router.delete('/:version', requireRole('master'), (req, res) => {
  const result = db.prepare('DELETE FROM releases WHERE version = ?').run(req.params.version);
  if (result.changes === 0) return res.status(404).json({ error: 'Versão não encontrada' });
  res.json({ ok: true });
});

module.exports = router;
