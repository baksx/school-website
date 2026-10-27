const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { authenticateToken } = require('../middleware/auth');

// 1. Отримати опитування (Публічно — тільки дійсні та активні)
router.get('/', async (req, res) => {
  try {
    // Якщо запит з адмінки (є query param ?all=true) — повертаємо всі
    const showAll = req.query.all === 'true';

    let query = 'SELECT * FROM polls';
    if (!showAll) {
      // Показуємо тільки is_active = 1 ТА (expires_at IS NULL АБО expires_at >= NOW())
      query += ' WHERE is_active = 1 AND (expires_at IS NULL OR expires_at >= NOW())';
    }
    query += ' ORDER BY id DESC';

    const [polls] = await pool.query(query);

    for (let poll of polls) {
      const [options] = await pool.query('SELECT * FROM poll_options WHERE poll_id = ?', [poll.id]);
      poll.options = options || [];
    }

    res.json(polls);
  } catch (err) {
    console.error('Помилка отримання опитувань:', err);
    res.status(500).json({ error: 'Помилка зчитування опитувань' });
  }
});

// 2. Проголосувати
router.post('/:id/vote', async (req, res) => {
  const pollId = req.params.id;
  const { optionId } = req.body;

  if (!optionId) {
    return res.status(400).json({ error: 'Оберіть варіант для голосування' });
  }

  try {
    const [polls] = await pool.query('SELECT is_active, expires_at FROM polls WHERE id = ?', [pollId]);
    if (polls.length === 0) {
      return res.status(404).json({ error: 'Опитування не знайдено' });
    }

    const poll = polls[0];
    const now = new Date();
    const isExpired = poll.expires_at && now > new Date(poll.expires_at);

    if (!poll.is_active || isExpired) {
      return res.status(400).json({ error: 'Це голосування вже неактивне або завершене!' });
    }

    await pool.query(
      'UPDATE poll_options SET votes = votes + 1 WHERE id = ? AND poll_id = ?',
      [optionId, pollId]
    );

    res.json({ message: 'Дякуємо! Ваш голос враховано.' });
  } catch (err) {
    console.error('Помилка при голосуванні:', err);
    res.status(500).json({ error: 'Помилка збереження голосу' });
  }
});

// 3. Створити нове опитування (Адмін)
router.post('/', authenticateToken, async (req, res) => {
  const { title, options, expires_at, is_active } = req.body;

  if (!title || !options || !Array.isArray(options) || options.length < 2) {
    return res.status(400).json({ error: 'Вкажіть тему та мінімум 2 варіанти відповідей' });
  }

  const expireValue = expires_at ? `${expires_at} 23:59:59` : null;
  const activeValue = is_active !== undefined ? (is_active ? 1 : 0) : 1;

  try {
    const [pollRes] = await pool.query(
      'INSERT INTO polls (title, expires_at, is_active) VALUES (?, ?, ?)',
      [title, expireValue, activeValue]
    );
    const pollId = pollRes.insertId;

    for (let opt of options) {
      if (typeof opt === 'string' && opt.trim() !== '') {
        await pool.query(
          'INSERT INTO poll_options (poll_id, option_text) VALUES (?, ?)',
          [pollId, opt.trim()]
        );
      }
    }

    res.json({ message: 'Опитування успішно створено!', id: pollId });
  } catch (err) {
    console.error('Помилка створення опитування в БД:', err);
    res.status(500).json({ error: 'Помилка створення опитування' });
  }
});

// 4. Оновити статус активності (Адмін - Перемикач)
router.patch('/:id/toggle-active', authenticateToken, async (req, res) => {
  const { is_active } = req.body;
  try {
    await pool.query('UPDATE polls SET is_active = ? WHERE id = ?', [is_active ? 1 : 0, req.params.id]);
    res.json({ message: 'Статус опитування оновлено' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 5. Видалити опитування (Адмін)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    await pool.query('DELETE FROM polls WHERE id = ?', [req.params.id]);
    res.json({ message: 'Опитування видалено успішно' });
  } catch (err) {
    console.error('Помилка видалення опитування:', err);
    res.status(500).json({ error: 'Помилка видалення опитування' });
  }
});

module.exports = router;