const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { authenticateToken, requirePermission } = require('../middleware/auth');

// Читання новин (Публічно)
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM news ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Отримання однієї новини за ID (Публічно)
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM news WHERE id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Новину не знайдено' });
    }
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Допоміжна функція: повертає локальну дату YYYY-MM-DD HH:mm:ss без зсуву UTC
const getCleanDate = (inputDate) => {
  if (inputDate && typeof inputDate === 'string' && inputDate.trim() !== '') {
    // Якщо прийшов чистий YYYY-MM-DD від <input type="date">
    if (inputDate.length === 10) {
      return `${inputDate} 12:00:00`;
    }
    return inputDate;
  }
  
  // Якщо дату не обрано — генеруємо поточну локальну дату (без UTC зсуву)
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
};

// Створення новини
router.post('/', authenticateToken, requirePermission('news'), async (req, res) => {
  const { title, content, image_url, date, created_at } = req.body;
  const pubDate = getCleanDate(date || created_at);

  try {
    const [result] = await pool.query(
      'INSERT INTO news (title, content, image_url, created_at) VALUES (?, ?, ?, ?)',
      [title, content, image_url, pubDate]
    );
    res.json({ id: result.insertId, title, content, image_url, created_at: pubDate });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Оновлення новини
router.put('/:id', authenticateToken, requirePermission('news'), async (req, res) => {
  const { title, content, image_url, date, created_at } = req.body;
  const pubDate = getCleanDate(date || created_at);

  try {
    await pool.query(
      'UPDATE news SET title = ?, content = ?, image_url = ?, created_at = ? WHERE id = ?',
      [title, content, image_url, pubDate, req.params.id]
    );
    res.json({ message: 'Новину оновлено' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Видалення новини
router.delete('/:id', authenticateToken, requirePermission('news'), async (req, res) => {
  try {
    await pool.query('DELETE FROM news WHERE id = ?', [req.params.id]);
    res.json({ message: 'Новину видалено' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;