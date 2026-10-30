const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../db');
const { jwtSecret, jwtExpiry } = require('../config');
const { requireAdmin } = require('../middleware/auth');
const { getSummary, getShops, setShopActive } = require('../coreClient');

const router = express.Router();
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ID_RE = /^[a-zA-Z0-9_-]{1,128}$/;

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
    if (!EMAIL_RE.test(email)) return res.status(400).json({ error: 'Invalid email format' });
    const result = await pool.query('SELECT * FROM admins WHERE email = $1', [email.toLowerCase()]);
    const admin = result.rows[0];
    if (!admin || !bcrypt.compareSync(password, admin.password)) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const token = jwt.sign({ id: admin.id, email: admin.email, type: 'admin' }, jwtSecret, { expiresIn: jwtExpiry });
    return res.json({ token, admin: { id: admin.id, name: admin.name, email: admin.email } });
  } catch (e) {
    return res.status(500).json({ error: 'Login failed' });
  }
});

router.get('/summary', requireAdmin, async (req, res) => {
  const result = await getSummary();
  if (result.status !== 200) return res.status(502).json({ error: 'Core service unavailable' });
  return res.json(result.payload);
});

router.get('/shops', requireAdmin, async (req, res) => {
  const result = await getShops();
  if (result.status !== 200) return res.status(502).json({ error: 'Core service unavailable' });
  return res.json(result.payload);
});

router.put('/shops/:id/active', requireAdmin, async (req, res) => {
  if (!ID_RE.test(req.params.id)) return res.status(400).json({ error: 'Invalid shop ID' });
  const isActive = req.body.isActive;
  if (isActive !== 0 && isActive !== 1) return res.status(400).json({ error: 'isActive must be 0 or 1' });
  const result = await setShopActive(req.params.id, isActive);
  if (result.status === 404) return res.status(404).json({ error: 'Shop not found' });
  if (result.status !== 200) return res.status(502).json({ error: 'Core service unavailable' });
  return res.json(result.payload);
});

module.exports = router;
