const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { authenticateToken, requirePermission } = require('../middleware/auth');

// Отримання всього меню (доступно всім)
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM menu_items ORDER BY parent_id, order_index');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Помилка завантаження меню: ' + err.message });
  }
});

// Збереження меню (захищено авторизацією та перевіркою прав)
router.post('/', authenticateToken, requirePermission('settings'), async (req, res) => {
  const items = req.body; // Масив об'єктів { title, link, subItems: [...] }
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // Очищаємо стару структуру меню
    await connection.query('DELETE FROM menu_items');

    let order = 0;
    for (const item of items) {
      const [result] = await connection.query(
        'INSERT INTO menu_items (title, link, parent_id, order_index) VALUES (?, ?, NULL, ?)',
        [item.title, item.link, order++]
      );
      
      const parentId = result.insertId;

      // Якщо є підменю, зберігаємо його із прив'язкою до parentId
      if (item.subItems && Array.isArray(item.subItems) && item.subItems.length > 0) {
        let subOrder = 0;
        for (const sub of item.subItems) {
          await connection.query(
            'INSERT INTO menu_items (title, link, parent_id, order_index) VALUES (?, ?, ?, ?)',
            [sub.title, sub.link, parentId, subOrder++]
          );
        }
      }
    }

    await connection.commit();
    res.json({ message: 'Структуру меню успішно оновлено!' });
  } catch (err) {
    await connection.rollback();
    res.status(500).json({ error: 'Помилка збереження меню: ' + err.message });
  } finally {
    connection.release();
  }
});

module.exports = router;