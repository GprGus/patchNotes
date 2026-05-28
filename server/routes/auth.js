const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { db } = require('../db');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

router.post('/login', (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ error: 'E-mail e senha são obrigatórios' });
  }

  const user = db
    .prepare('SELECT * FROM users WHERE email = ? AND active = 1')
    .get(email.toLowerCase().trim());

  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    return res.status(401).json({ error: 'Credenciais inválidas' });
  }

  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role, name: user.name },
    process.env.JWT_SECRET,
    { expiresIn: '12h' }
  );

  res.json({
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      last_visit: user.last_visit,
    },
  });
});

router.get('/me', verifyToken, (req, res) => {
  const user = db
    .prepare('SELECT id, name, email, role, active, last_visit FROM users WHERE id = ?')
    .get(req.user.id);
  if (!user || !user.active) {
    return res.status(401).json({ error: 'Usuário inativo ou não encontrado' });
  }
  res.json({ user });
});

router.put('/mark-read', verifyToken, (req, res) => {
  const today = new Date().toISOString().slice(0, 10);
  db.prepare("UPDATE users SET last_visit = ?, updated_at = datetime('now') WHERE id = ?")
    .run(today, req.user.id);
  res.json({ ok: true, last_visit: today });
});

module.exports = router;
