const jwt = require('jsonwebtoken');
const { jwtSecret } = require('./config');

function requireAdmin(req, res, next) {
  const header = req.headers.authorization;
  const token = header && header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Authentication required' });
  try {
    const decoded = jwt.verify(token, jwtSecret);
    if (decoded.type !== 'admin') return res.status(403).json({ error: 'Super admin account required' });
    req.auth = { id: decoded.id, email: decoded.email, type: decoded.type };
    return next();
  } catch (e) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

module.exports = { requireAdmin };
