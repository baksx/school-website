const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { authenticateToken, requirePermission } = require('../middleware/auth');

// 1. Отримати 5 випадкових фотографій (наприклад, для віджета на головній)
router.get('/random', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM gallery ORDER BY RAND() LIMIT 5');
    res.json(rows);
  } catch (err) {
    console.error('Помилка при отриманні випадкових фото:', err);
    res.status(500).json({ error: 'Помилка сервера при отриманні фотографій' });
  }
});

// 2. Отримати всі фото або фото конкретного альбому
router.get('/', async (req, res) => {
  const { albumId } = req.query;
  try {
    // Валідація albumId: перевіряємо, чи це число, якщо воно передане
    let query = 'SELECT * FROM gallery ORDER BY id DESC';
    let params = [];

    if (albumId) {
      const parsedAlbumId = parseInt(albumId, 10);
      if (isNaN(parsedAlbumId)) {
        return res.status(400).json({ error: 'Некоректний ідентифікатор альбому' });
      }
      query = 'SELECT * FROM gallery WHERE album_id = ? ORDER BY id DESC';
      params = [parsedAlbumId];
    }

    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error('Помилка при отриманні галереї:', err);
    res.status(500).json({ error: 'Помилка сервера при отриманні галереї' });
  }
});

// 3. Додати нове фото
router.post('/', authenticateToken, requirePermission('gallery'), async (req, res) => {
  const { title, image_url, album_id } = req.body;

  // 🛡️ Валідація обов'язкових полів
  if (!image_url || typeof image_url !== 'string' || !image_url.trim()) {
    return res.status(400).json({ error: 'Посилання на зображення є обов’язковим' });
  }

  const cleanTitle = title ? String(title).trim() : '';
  const parsedAlbumId = album_id ? parseInt(album_id, 10) : null;

  try {
    const [result] = await pool.query(
      'INSERT INTO gallery (title, image_url, album_id) VALUES (?, ?, ?)', 
      [cleanTitle, image_url.trim(), isNaN(parsedAlbumId) ? null : parsedAlbumId]
    );

    res.json({ 
      id: result.insertId, 
      title: cleanTitle, 
      image_url: image_url.trim(), 
      album_id: isNaN(parsedAlbumId) ? null : parsedAlbumId 
    });
  } catch (err) {
    console.error('Помилка при додаванні фото:', err);
    res.status(500).json({ error: 'Помилка сервера при додаванні фотографії' });
  }
});

// 4. Видалити фото
router.delete('/:id', authenticateToken, requirePermission('gallery'), async (req, res) => {
  const photoId = parseInt(req.params.id, 10);

  // 🛡️ Валідація ID
  if (isNaN(photoId)) {
    return res.status(400).json({ error: 'Некоректний ідентифікатор фотографії' });
  }

  try {
    const [result] = await pool.query('DELETE FROM gallery WHERE id = ?', [photoId]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Фотографію не знайдено' });
    }

    res.json({ message: 'Фото видалено' });
  } catch (err) {
    console.error('Помилка при видаленні фото:', err);
    res.status(500).json({ error: 'Помилка сервера при видаленні фотографії' });
  }
});

module.exports = router;