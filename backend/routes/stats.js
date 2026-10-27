const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { authenticateToken, requirePermission } = require('../middleware/auth');

router.get('/', authenticateToken, requirePermission('stats'), async (req, res) => {
  try {
    const [[{ newsCount }]] = await pool.query('SELECT COUNT(*) as newsCount FROM news');
    const [[{ albumsCount }]] = await pool.query('SELECT COUNT(*) as albumsCount FROM albums');
    const [[{ galleryCount }]] = await pool.query('SELECT COUNT(*) as galleryCount FROM gallery');
    const [[{ usersCount }]] = await pool.query('SELECT COUNT(*) as usersCount FROM users');

    res.json({
      newsCount,
      albumsCount,
      galleryCount,
      usersCount,
      nodeVersion: process.version,
      serverTime: new Date().toLocaleString('uk-UA')
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;