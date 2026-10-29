const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { authenticateToken, requirePermission } = require('../middleware/auth');

// 1. Отримати оголошення (Публічно: тільки активні; прапор all=true потребує авторизації)
router.get('/', async (req, res) => {
  try {
    const showAll = req.query.all === 'true';

    // Для перегляду неактивних або застарілих оголошень вимагається авторизація
    if (showAll) {
      const authHeader = req.headers['authorization'];
      if (!authHeader) {
        return res.status(401).json({ error: 'Повний список оголошень вимагає авторизації' });
      }
    }

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

// 2. Створити оголошення (Вимагає право 'announcements' або 'news')
router.post('/', authenticateToken, requirePermission('announcements'), async (req, res) => {
  const { title, content, expires_at, is_active } = req.body;

  if (!title || !content) {
    return res.status(400).json({ error: 'Заповніть заголовок та зміст оголошення' });
  }

  const expireValue = (expires_at && String(expires_at).trim() !== '') ? `${expires_at} 23:59:59` : null;
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

// 3. Перемикач активності
router.patch('/:id/toggle-active', authenticateToken, requirePermission('announcements'), async (req, res) => {
  const { is_active } = req.body;
  try {
    await pool.query('UPDATE announcements SET is_active = ? WHERE id = ?', [is_active ? 1 : 0, req.params.id]);
    res.json({ message: 'Статус оголошення оновлено' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. Видалити оголошення
router.delete('/:id', authenticateToken, requirePermission('announcements'), async (req, res) => {
  try {
    await pool.query('DELETE FROM announcements WHERE id = ?', [req.params.id]);
    res.json({ message: 'Оголошення видалено' });
  } catch (err) {
    res.status(500).json({ error: 'Помилка видалення оголошення' });
  }
});

module.exports = router;