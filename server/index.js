require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { seed } = require('./db');

const authRoutes     = require('./routes/auth');
const usersRoutes    = require('./routes/users');
const backlogRoutes  = require('./routes/backlog');
const releasesRoutes = require('./routes/releases');

const app  = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());

app.use('/auth',     authRoutes);
app.use('/users',    usersRoutes);
app.use('/backlog',  backlogRoutes);
app.use('/releases', releasesRoutes);

app.use((err, req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: 'Erro interno do servidor' });
});

seed();
app.listen(PORT, () => console.log(`[API] http://localhost:${PORT}`));
