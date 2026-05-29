require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { seed } = require('./db');

const authRoutes     = require('./routes/auth');
const usersRoutes    = require('./routes/users');
const backlogRoutes  = require('./routes/backlog');
const releasesRoutes = require('./routes/releases');

const app  = express();
const PORT = process.env.PORT || 3001;

const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:5173';
app.use(cors({ origin: CORS_ORIGIN, credentials: true }));
app.use(express.json());

app.use('/api/auth',     authRoutes);
app.use('/api/users',    usersRoutes);
app.use('/api/backlog',  backlogRoutes);
app.use('/api/releases', releasesRoutes);

app.use(express.static(path.join(__dirname, 'public')));
app.get('*', (req, res, next) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'), err => { if (err) next(); });
});

app.use((err, req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: 'Erro interno do servidor' });
});

seed();
app.listen(PORT, '0.0.0.0', () => console.log(`[API] http://0.0.0.0:${PORT}`));
