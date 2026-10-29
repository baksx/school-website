const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { authenticateToken, requirePermission } = require('../middleware/auth');

// Отримати всі сторінки
router.get('/', async (req, res) => {
  try {
    const [pages] = await pool.query('SELECT * FROM pages ORDER BY id DESC');
    res.json(pages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Отримати одну сторінку за її slug
router.get('/by-slug/:slug', async (req, res) => {
  try {
    const cleanSlug = String(req.params.slug).toLowerCase().trim();
    const [rows] = await pool.query('SELECT * FROM pages WHERE slug = ? AND is_published = 1', [cleanSlug]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Сторінку не знайдено' });
    }
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Помилка отримання сторінки: ' + err.message });
  }
});

// Створення нової сторінки (Вимагає право 'pages')
router.post('/', authenticateToken, requirePermission('pages'), async (req, res) => {
  const { title, slug, content, is_published } = req.body;
  
  if (!title || !slug) {
    return res.status(400).json({ message: 'Назва та посилання (slug) є обов’язковими' });
  }

  const formattedSlug = slug.toLowerCase().replace(/[^a-z0-9-/]/g, '-').replace(/-+/g, '-');

  try {
    await pool.query(
      'INSERT INTO pages (title, slug, content, is_published) VALUES (?, ?, ?, ?)',
      [title, formattedSlug, content || '', is_published ? 1 : 0]
    );
    res.json({ message: '🎉 Сторінку успішно створено!' });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ message: 'Сторінка з таким посиланням (slug) вже існує!' });
    }
    res.status(500).json({ error: 'Помилка збереження: ' + err.message });
  }
});

// Оновлення існуючої сторінки (Вимагає право 'pages')
router.put('/:id', authenticateToken, requirePermission('pages'), async (req, res) => {
  const { title, slug, content, is_published } = req.body;
  const formattedSlug = slug.toLowerCase().replace(/[^a-z0-9-/]/g, '-').replace(/-+/g, '-');

  try {
    await pool.query(
      'UPDATE pages SET title = ?, slug = ?, content = ?, is_published = ? WHERE id = ?',
      [title, formattedSlug, content, is_published ? 1 : 0, req.params.id]
    );
    res.json({ message: '💾 Зміни у сторінці збережено!' });
  } catch (err) {
    res.status(500).json({ error: 'Помилка оновлення: ' + err.message });
  }
});

// Видалення сторінки (Вимагає право 'pages')
router.delete('/:id', authenticateToken, requirePermission('pages'), async (req, res) => {
  try {
    await pool.query('DELETE FROM pages WHERE id = ?', [req.params.id]);
    res.json({ message: '🗑️ Сторінку видалено' });
  } catch (err) {
    res.status(500).json({ error: 'Помилка видалення: ' + err.message });
  }
});

module.exports = router;