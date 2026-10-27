const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { authenticateToken, requirePermission } = require('../middleware/auth');

// Отримання всіх альбомів (Публічно)
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM albums ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) {
    // Якщо колонка створена як `date`, а не `created_at`
    try {
      const [rowsFallback] = await pool.query('SELECT * FROM albums ORDER BY date DESC');
      res.json(rowsFallback);
    } catch (fallbackErr) {
      res.status(500).json({ error: err.message });
    }
  }
});

// Допоміжна функція: повертає локальну дату YYYY-MM-DD HH:mm:ss без UTC зсуву
const getCleanDate = (inputDate) => {
  if (inputDate && typeof inputDate === 'string' && inputDate.trim() !== '') {
    if (inputDate.length === 10) {
      return `${inputDate} 12:00:00`;
    }
    return inputDate;
  }
  
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
};

// Створення альбому
router.post('/', authenticateToken, requirePermission('gallery'), async (req, res) => {
  const { title, date, created_at } = req.body;
  const albumDate = getCleanDate(date || created_at);

  try {
    // Спроба вставити created_at
    const [result] = await pool.query(
      'INSERT INTO albums (title, created_at) VALUES (?, ?)',
      [title, albumDate]
    );
    res.json({ id: result.insertId, title, created_at: albumDate });
  } catch (err) {
    try {
      // Спроба вставити date, якщо колонка в БД називається date
      const [result] = await pool.query(
        'INSERT INTO albums (title, date) VALUES (?, ?)',
        [title, albumDate]
      );
      res.json({ id: result.insertId, title, date: albumDate });
    } catch (dbErr) {
      res.status(500).json({ error: dbErr.message });
    }
  }
});

// Оновлення альбому
router.put('/:id', authenticateToken, requirePermission('gallery'), async (req, res) => {
  const { title, date, created_at } = req.body;
  const albumDate = getCleanDate(date || created_at);

  try {
    await pool.query(
      'UPDATE albums SET title = ?, created_at = ? WHERE id = ?',
      [title, albumDate, req.params.id]
    );
    res.json({ message: 'Альбом оновлено' });
  } catch (err) {
    try {
      await pool.query(
        'UPDATE albums SET title = ?, date = ? WHERE id = ?',
        [title, albumDate, req.params.id]
      );
      res.json({ message: 'Альбом оновлено' });
    } catch (dbErr) {
      res.status(500).json({ error: dbErr.message });
    }
  }
});

// Видалення альбому
router.delete('/:id', authenticateToken, requirePermission('gallery'), async (req, res) => {
  try {
    await pool.query('DELETE FROM albums WHERE id = ?', [req.params.id]);
    res.json({ message: 'Альбом видалено' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;