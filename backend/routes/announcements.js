const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { authenticateToken } = require('../middleware/auth');

// 1. Отримати оголошення (Публічно: тільки активні та не прострочені)
router.get('/', async (req, res) => {
  try {
    const showAll = req.query.all === 'true';
    let query = 'SELECT * FROM announcements';

    if (!showAll) {
      query += ' WHERE is_active = 1 AND (expires_at IS NULL OR expires_at >= NOW())';
    }
    query += ' ORDER BY id DESC';

    const [rows] = await pool.query(query);
    res.json(rows);
  } catch (err) {
    console.error('Помилка отримання оголошень:', err);
    res.status(500).json({ error: 'Помилка зчитування оголошень' });
  }
});

// 2. Створити оголошення (Адмін)
router.post('/', authenticateToken, async (req, res) => {
  const { title, content, expires_at, is_active } = req.body;

  if (!title || !content) {
    return res.status(400).json({ error: 'Заповніть заголовок та зміст оголошення' });
  }

  const expireValue = expires_at ? `${expires_at} 23:59:59` : null;
  const activeValue = is_active !== undefined ? (is_active ? 1 : 0) : 1;

  try {
    const [result] = await pool.query(
      'INSERT INTO announcements (title, content, expires_at, is_active) VALUES (?, ?, ?, ?)',
      [title, content, expireValue, activeValue]
    );

    res.json({ message: 'Оголошення успішно створено!', id: result.insertId });
  } catch (err) {
    console.error('Помилка створення оголошення:', err);
    res.status(500).json({ error: 'Помилка збереження оголошення' });
  }
});

// 3. Перемикач активності (Адмін)
router.patch('/:id/toggle-active', authenticateToken, async (req, res) => {
  const { is_active } = req.body;
  try {
    await pool.query('UPDATE announcements SET is_active = ? WHERE id = ?', [is_active ? 1 : 0, req.params.id]);
    res.json({ message: 'Статус оголошення оновлено' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. Видалити оголошення (Адмін)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    await pool.query('DELETE FROM announcements WHERE id = ?', [req.params.id]);
    res.json({ message: 'Оголошення видалено' });
  } catch (err) {
    res.status(500).json({ error: 'Помилка видалення оголошення' });
  }
});

module.exports = router;