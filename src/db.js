const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const { Pool } = require('pg');
const { db, bootstrap } = require('./config');

const pool = new Pool({
  host: db.host,
  port: db.port,
  database: db.database,
  user: db.user,
  password: db.password,
  max: 10,
  idleTimeoutMillis: 30000,
});

async function initDb() {
  const sql = fs.readFileSync(path.join(__dirname, '..', 'db', 'schema.sql'), 'utf8');
  await pool.query(sql);
  const existing = await pool.query('SELECT id FROM admins LIMIT 1');
  if (existing.rows.length > 0) return;
  const email = bootstrap.email.toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error('ADMIN_EMAIL is not a valid email');
  }
  if (bootstrap.password.length < 6 || bootstrap.password.length > 128) {
    throw new Error('ADMIN_PASSWORD must be 6-128 characters');
  }
  await pool.query(
    'INSERT INTO admins (id, name, email, password, created_at) VALUES ($1,$2,$3,$4,$5)',
    [crypto.randomUUID(), bootstrap.name.trim().slice(0, 100), email, bcrypt.hashSync(bootstrap.password, 10), new Date().toISOString()]
  );
  console.log(`[admin] Created first super admin ${email}`);
}

module.exports = { pool, initDb };
