const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { authenticateToken, requirePermission } = require('../middleware/auth');

router.get('/random', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM gallery ORDER BY RAND() LIMIT 5');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/', async (req, res) => {
  const { albumId } = req.query;
  try {
    const query = albumId 
      ? 'SELECT * FROM gallery WHERE album_id = ? ORDER BY id DESC' 
      : 'SELECT * FROM gallery ORDER BY id DESC';
    const [rows] = await pool.query(query, albumId ? [albumId] : []);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', authenticateToken, requirePermission('gallery'), async (req, res) => {
  const { title, image_url, album_id } = req.body;
  try {
    const [result] = await pool.query('INSERT INTO gallery (title, image_url, album_id) VALUES (?, ?, ?)', [title, image_url, album_id]);
    res.json({ id: result.insertId, title, image_url, album_id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', authenticateToken, requirePermission('gallery'), async (req, res) => {
  try {
    await pool.query('DELETE FROM gallery WHERE id = ?', [req.params.id]);
    res.json({ message: 'Фото видалено' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;