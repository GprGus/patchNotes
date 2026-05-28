const express = require('express');
const bcrypt = require('bcryptjs');
const { db } = require('../db');
const { requireRole } = require('../middleware/auth');

const router = express.Router();
const VALID_ROLES = ['master', 'developer', 'viewer'];

router.get('/', requireRole('master'), (req, res) => {
  const users = db
    .prepare('SELECT id, name, email, role, active, last_visit, created_at, updated_at FROM users ORDER BY created_at DESC')
    .all();
  res.json({ users });
});

router.post('/', requireRole('master'), (req, res) => {
  const { name, email, password, role } = req.body || {};
  if (!name || !email || !password || !role) {
    return res.status(400).json({ error: 'Nome, e-mail, senha e perfil são obrigatórios' });
  }
  if (!VALID_ROLES.includes(role)) {
    return res.status(400).json({ error: 'Perfil inválido' });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: 'Senha deve ter no mínimo 6 caracteres' });
  }

  const exists = db.prepare('SELECT id FROM users WHERE email = ?').get(email.toLowerCase().trim());
  if (exists) return res.status(409).json({ error: 'E-mail já cadastrado' });

  const hash = bcrypt.hashSync(password, 10);
  const result = db
    .prepare('INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)')
    .run(name.trim(), email.toLowerCase().trim(), hash, role);

  const user = db
    .prepare('SELECT id, name, email, role, active, created_at FROM users WHERE id = ?')
    .get(result.lastInsertRowid);
  res.status(201).json({ user });
});

router.put('/:id', requireRole('master'), (req, res) => {
  const id = parseInt(req.params.id);
  const target = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
  if (!target) return res.status(404).json({ error: 'Usuário não encontrado' });

  const { name, email, role, active, password } = req.body || {};

  // Impede remover o último master
  if (target.role === 'master' && role && role !== 'master') {
    const masterCount = db.prepare("SELECT COUNT(*) as c FROM users WHERE role = 'master'").get().c;
    if (masterCount <= 1) {
      return res.status(400).json({ error: 'Não é possível rebaixar o último usuário master' });
    }
  }

  if (email && email.toLowerCase().trim() !== target.email) {
    const dup = db.prepare('SELECT id FROM users WHERE email = ? AND id != ?').get(email.toLowerCase().trim(), id);
    if (dup) return res.status(409).json({ error: 'E-mail já está em uso' });
  }

  if (role && !VALID_ROLES.includes(role)) {
    return res.status(400).json({ error: 'Perfil inválido' });
  }

  const updates = {
    name:   (name?.trim())           || target.name,
    email:  (email?.toLowerCase().trim()) || target.email,
    role:   role                     || target.role,
    active: active !== undefined ? (active ? 1 : 0) : target.active,
  };

  if (password) {
    if (password.length < 6) return res.status(400).json({ error: 'Senha deve ter no mínimo 6 caracteres' });
    updates.password_hash = bcrypt.hashSync(password, 10);
    db.prepare("UPDATE users SET name=?, email=?, role=?, active=?, password_hash=?, updated_at=datetime('now') WHERE id=?")
      .run(updates.name, updates.email, updates.role, updates.active, updates.password_hash, id);
  } else {
    db.prepare("UPDATE users SET name=?, email=?, role=?, active=?, updated_at=datetime('now') WHERE id=?")
      .run(updates.name, updates.email, updates.role, updates.active, id);
  }

  const user = db
    .prepare('SELECT id, name, email, role, active, created_at, updated_at FROM users WHERE id = ?')
    .get(id);
  res.json({ user });
});

router.delete('/:id', requireRole('master'), (req, res) => {
  const id = parseInt(req.params.id);
  if (id === req.user.id) {
    return res.status(400).json({ error: 'Você não pode excluir sua própria conta' });
  }

  const target = db.prepare('SELECT role FROM users WHERE id = ?').get(id);
  if (!target) return res.status(404).json({ error: 'Usuário não encontrado' });

  if (target.role === 'master') {
    const masterCount = db.prepare("SELECT COUNT(*) as c FROM users WHERE role = 'master'").get().c;
    if (masterCount <= 1) {
      return res.status(400).json({ error: 'Não é possível excluir o último usuário master' });
    }
  }

  db.prepare('DELETE FROM users WHERE id = ?').run(id);
  res.json({ ok: true });
});

module.exports = router;
