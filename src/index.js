const express = require('express');
const cors = require('cors');
const { port, corsOrigin } = require('./config');
const { initDb } = require('./db');
const adminRoutes = require('./routes/admin');

const app = express();

app.use(cors({ origin: corsOrigin }));
app.use(express.json({ limit: '1mb' }));

app.get('/', (req, res) => {
  res.json({ service: 'stitchbook-admin', status: 'ok' });
});

app.use('/api/admin', adminRoutes);

initDb()
  .then(() => {
    app.listen(port, () => {
      console.log(`stitchbook-admin listening on ${port}`);
    });
  })
  .catch((error) => {
    console.error('[fatal] Database setup failed:', error.message);
    process.exit(1);
  });
