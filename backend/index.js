const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

if (!process.env.DB_PASSWORD || !process.env.ADMIN_TOKEN) {
  console.error('Missing DB_PASSWORD or ADMIN_TOKEN in .env');
  process.exit(1);
}

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  user: 'bloguser',
  password: process.env.DB_PASSWORD,
  database: 'blog',
});

const app = express();
app.use(cors());
app.use(express.json());

// wraps async handlers so errors return 500 instead of crashing
const wrap = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

function requireAdmin(req, res, next) {
  if (req.headers['x-admin-token'] !== process.env.ADMIN_TOKEN) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
}

app.get('/api/health', (req, res) => res.json({ ok: true }));

app.get('/api/posts', wrap(async (req, res) => {
  const { rows } = await pool.query(
    'SELECT id, title, content, created_at FROM posts ORDER BY created_at DESC'
  );
  res.json(rows);
}));

app.get('/api/posts/:id', wrap(async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) return res.status(404).json({ error: 'Not found' });
  const { rows } = await pool.query('SELECT * FROM posts WHERE id = $1', [id]);
  if (!rows.length) return res.status(404).json({ error: 'Not found' });
  res.json(rows[0]);
}));

app.post('/api/posts', requireAdmin, wrap(async (req, res) => {
  const { title, content } = req.body || {};
  if (!title || !content) return res.status(400).json({ error: 'Title and content required' });
  const { rows } = await pool.query(
    'INSERT INTO posts (title, content) VALUES ($1, $2) RETURNING *',
    [title, content]
  );
  res.status(201).json(rows[0]);
}));

app.delete('/api/posts/:id', requireAdmin, wrap(async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) return res.status(404).json({ error: 'Not found' });
  await pool.query('DELETE FROM posts WHERE id = $1', [id]);
  res.status(204).end();
}));

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Server error' });
});

async function start() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS posts (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT now()
    )`);
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, '127.0.0.1', () => console.log(`API running on ${PORT}`));
}
start().catch((e) => { console.error(e); process.exit(1); });
