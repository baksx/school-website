// const express = require('express');
// const router = express.Router();
// const bcrypt = require('bcryptjs');
// const pool = require('../config/db');
// const { authenticateToken, requirePermission } = require('../middleware/auth');

// // ==========================================================================
// // 🔑 СПИСОК УСІХ СИСТЕМНИХ ПРАВ (ДИНАМІЧНО ДЛЯ ФРОНТЕНДУ)
// // ==========================================================================

// router.get('/permissions/list', authenticateToken, requirePermission('users'), async (req, res) => {
//   try {
//     const permissions = [
//       { id: 'stats', label: '📊 Головна / Статистика' },
//       { id: 'news', label: '📰 Управління новинами' },
//       { id: 'gallery', label: '📸 Фотогалерея та альбоми' },
//       { id: 'pages', label: '📄 Управління сторінками' },
//       { id: 'settings', label: '⚙️ Налаштування сайту' },
//       { id: 'users', label: '👥 Користувачі та Ролі' },
//       { id: 'menu', label: '🌐 Головне меню' },
//       { id: 'files', label: '📁 Файловий менеджер' },
//       { id: 'polls', label: '📊 Опитування' },
//       { id: 'announcements', label: '📢 Оголошення' }
//     ];
//     res.json(permissions);
//   } catch (err) {
//     res.status(500).json({ message: 'Помилка отримання переліку прав' });
//   }
// });

// // ==========================================================================
// // 👥 УПРАВЛІННЯ КОРИСТУВАЧАМИ
// // ==========================================================================

// // Отримати список усіх користувачів
// router.get('/', authenticateToken, requirePermission('users'), async (req, res) => {
//   try {
//     const [users] = await pool.query('SELECT id, username, role, permissions, created_at FROM users');
//     const parsedUsers = users.map(u => ({
//       ...u,
//       permissions: typeof u.permissions === 'string' ? JSON.parse(u.permissions || '[]') : (u.permissions || [])
//     }));
//     res.json(parsedUsers);
//   } catch (err) {
//     res.status(500).json({ message: 'Помилка отримання користувачів' });
//   }
// });

// // Створити нового користувача
// router.post('/', authenticateToken, requirePermission('users'), async (req, res) => {
//   const { username, password, role, permissions } = req.body;
//   if (!username || !password) {
//     return res.status(400).json({ message: 'Вкажіть логін та пароль' });
//   }

//   try {
//     const hashedPassword = await bcrypt.hash(password, 10);
//     const permsJson = JSON.stringify(permissions || []);
//     await pool.query(
//       'INSERT INTO users (username, password, role, permissions) VALUES (?, ?, ?, ?)',
//       [username, hashedPassword, role || 'editor', permsJson]
//     );
//     res.json({ message: 'Користувача успішно створено!' });
//   } catch (err) {
//     res.status(400).json({ message: 'Користувач із таким логіном вже існує' });
//   }
// });

// // Оновити існуючого користувача (роль, доступи, пароль)
// router.put('/:id', authenticateToken, requirePermission('users'), async (req, res) => {
//   const { username, password, role, permissions } = req.body;
//   const userId = req.params.id;

//   try {
//     const permsJson = JSON.stringify(permissions || []);

//     if (password && password.trim() !== '') {
//       const hashedPassword = await bcrypt.hash(password, 10);
//       await pool.query(
//         'UPDATE users SET username = ?, password = ?, role = ?, permissions = ? WHERE id = ?',
//         [username, hashedPassword, role || 'editor', permsJson, userId]
//       );
//     } else {
//       await pool.query(
//         'UPDATE users SET username = ?, role = ?, permissions = ? WHERE id = ?',
//         [username, role || 'editor', permsJson, userId]
//       );
//     }

//     res.json({ message: 'Дані користувача оновлено!' });
//   } catch (err) {
//     res.status(500).json({ message: 'Помилка оновлення користувача' });
//   }
// });

// // Видалити користувача
// router.delete('/:id', authenticateToken, requirePermission('users'), async (req, res) => {
//   try {
//     if (parseInt(req.params.id) === req.user.id) {
//       return res.status(400).json({ message: 'Неможливо видалити власний акаунт' });
//     }
//     await pool.query('DELETE FROM users WHERE id = ?', [req.params.id]);
//     res.json({ message: 'Користувача видалено' });
//   } catch (err) {
//     res.status(500).json({ message: 'Помилка видалення користувача' });
//   }
// });

// // ==========================================================================
// // ⭐ УПРАВЛІННЯ ШАБЛОНАМИ РОЛЕЙ
// // ==========================================================================

// router.get('/roles', authenticateToken, requirePermission('users'), async (req, res) => {
//   try {
//     const [roles] = await pool.query('SELECT * FROM custom_roles ORDER BY id DESC');
//     const parsedRoles = roles.map(r => ({
//       ...r,
//       permissions: typeof r.permissions === 'string' ? JSON.parse(r.permissions || '[]') : r.permissions
//     }));
//     res.json(parsedRoles);
//   } catch (err) {
//     res.status(500).json({ message: 'Помилка завантаження ролей' });
//   }
// });

// router.post('/roles', authenticateToken, requirePermission('users'), async (req, res) => {
//   const { name, permissions } = req.body;
//   if (!name || !permissions || permissions.length === 0) {
//     return res.status(400).json({ message: 'Вкажіть назву ролі та хоча б один дозвіл' });
//   }

//   try {
//     await pool.query(
//       'INSERT INTO custom_roles (name, permissions) VALUES (?, ?)',
//       [name, JSON.stringify(permissions)]
//     );
//     res.json({ message: 'Нову роль успішно збережено!' });
//   } catch (err) {
//     res.status(400).json({ message: 'Роль з такою назвою вже існує' });
//   }
// });

// router.put('/roles/:id', authenticateToken, requirePermission('users'), async (req, res) => {
//   const { name, permissions } = req.body;
//   if (!name || !permissions || permissions.length === 0) {
//     return res.status(400).json({ message: 'Вкажіть назву ролі та хоча б один дозвіл' });
//   }

//   try {
//     await pool.query(
//       'UPDATE custom_roles SET name = ?, permissions = ? WHERE id = ?',
//       [name, JSON.stringify(permissions), req.params.id]
//     );
//     res.json({ message: 'Роль успішно оновлено!' });
//   } catch (err) {
//     res.status(500).json({ message: 'Помилка оновлення ролі' });
//   }
// });

// router.delete('/roles/:id', authenticateToken, requirePermission('users'), async (req, res) => {
//   try {
//     await pool.query('DELETE FROM custom_roles WHERE id = ?', [req.params.id]);
//     res.json({ message: 'Роль видалено' });
//   } catch (err) {
//     res.status(500).json({ message: 'Помилка видалення ролі' });
//   }
// });

// module.exports = router;

const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const pool = require('../config/db');
const { authenticateToken, requirePermission } = require('../middleware/auth');

// ==========================================================================
// 🔑 СПИСОК УСІХ СИСТЕМНИХ ПРАВ (ДИНАМІЧНО ДЛЯ ФРОНТЕНДУ)
// ==========================================================================

router.get('/permissions/list', authenticateToken, requirePermission('users'), async (req, res) => {
  try {
    const permissions = [
      { id: 'stats', label: '📊 Головна / Статистика' },
      { id: 'news', label: '📰 Управління новинами' },
      { id: 'gallery', label: '📸 Фотогалерея та альбоми' },
      { id: 'pages', label: '📄 Управління сторінками' },
      { id: 'settings', label: '⚙️ Налаштування сайту' },
      { id: 'users', label: '👥 Користувачі та Ролі' },
      { id: 'menu', label: '🌐 Головне меню' },
      { id: 'files', label: '📁 Файловий менеджер' },
      { id: 'polls', label: '📊 Опитування' },
      { id: 'announcements', label: '📢 Оголошення' }
    ];
    res.json(permissions);
  } catch (err) {
    res.status(500).json({ message: 'Помилка отримання переліку прав' });
  }
});

// ==========================================================================
// 👥 УПРАВЛІННЯ КОРИСТУВАЧАМИ
// ==========================================================================

// Отримати список усіх користувачів
router.get('/', authenticateToken, requirePermission('users'), async (req, res) => {
  try {
    const [users] = await pool.query('SELECT id, username, role, permissions, created_at FROM users');
    const parsedUsers = users.map(u => ({
      ...u,
      permissions: typeof u.permissions === 'string' ? JSON.parse(u.permissions || '[]') : (u.permissions || [])
    }));
    res.json(parsedUsers);
  } catch (err) {
    res.status(500).json({ message: 'Помилка отримання користувачів' });
  }
});

// Створити нового користувача
router.post('/', authenticateToken, requirePermission('users'), async (req, res) => {
  const { username, password, role, permissions } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: 'Вкажіть логін та пароль' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const permsJson = JSON.stringify(permissions || []);
    // Зберігаємо передану назву ролі
    const userRole = (role && String(role).trim() !== '') ? String(role).trim() : 'editor';

    await pool.query(
      'INSERT INTO users (username, password, role, permissions) VALUES (?, ?, ?, ?)',
      [username, hashedPassword, userRole, permsJson]
    );
    res.json({ message: 'Користувача успішно створено!' });
  } catch (err) {
    res.status(400).json({ message: 'Користувач із таким логіном вже існує' });
  }
});

// Оновити існуючого користувача (роль, доступи, пароль)
router.put('/:id', authenticateToken, requirePermission('users'), async (req, res) => {
  const { username, password, role, permissions } = req.body;
  const userId = req.params.id;

  try {
    const permsJson = JSON.stringify(permissions || []);
    const userRole = (role && String(role).trim() !== '') ? String(role).trim() : 'editor';

    if (password && password.trim() !== '') {
      const hashedPassword = await bcrypt.hash(password, 10);
      await pool.query(
        'UPDATE users SET username = ?, password = ?, role = ?, permissions = ? WHERE id = ?',
        [username, hashedPassword, userRole, permsJson, userId]
      );
    } else {
      await pool.query(
        'UPDATE users SET username = ?, role = ?, permissions = ? WHERE id = ?',
        [username, userRole, permsJson, userId]
      );
    }

    res.json({ message: 'Дані користувача оновлено!' });
  } catch (err) {
    res.status(500).json({ message: 'Помилка оновлення користувача' });
  }
});

// Видалити користувача
router.delete('/:id', authenticateToken, requirePermission('users'), async (req, res) => {
  try {
    if (parseInt(req.params.id) === req.user.id) {
      return res.status(400).json({ message: 'Неможливо видалити власний акаунт' });
    }
    await pool.query('DELETE FROM users WHERE id = ?', [req.params.id]);
    res.json({ message: 'Користувача видалено' });
  } catch (err) {
    res.status(500).json({ message: 'Помилка видалення користувача' });
  }
});

// ==========================================================================
// ⭐ УПРАВЛІННЯ ШАБЛОНАМИ РОЛЕЙ
// ==========================================================================

router.get('/roles', authenticateToken, requirePermission('users'), async (req, res) => {
  try {
    const [roles] = await pool.query('SELECT * FROM custom_roles ORDER BY id DESC');
    const parsedRoles = roles.map(r => ({
      ...r,
      permissions: typeof r.permissions === 'string' ? JSON.parse(r.permissions || '[]') : r.permissions
    }));
    res.json(parsedRoles);
  } catch (err) {
    res.status(500).json({ message: 'Помилка завантаження ролей' });
  }
});

router.post('/roles', authenticateToken, requirePermission('users'), async (req, res) => {
  const { name, permissions } = req.body;
  if (!name || !permissions || permissions.length === 0) {
    return res.status(400).json({ message: 'Вкажіть назву ролі та хоча б один дозвіл' });
  }

  try {
    await pool.query(
      'INSERT INTO custom_roles (name, permissions) VALUES (?, ?)',
      [name, JSON.stringify(permissions)]
    );
    res.json({ message: 'Нову роль успішно збережено!' });
  } catch (err) {
    res.status(400).json({ message: 'Роль з такою назвою вже існує' });
  }
});

router.put('/roles/:id', authenticateToken, requirePermission('users'), async (req, res) => {
  const { name, permissions } = req.body;
  if (!name || !permissions || permissions.length === 0) {
    return res.status(400).json({ message: 'Вкажіть назву ролі та хоча б один дозвіл' });
  }

  try {
    await pool.query(
      'UPDATE custom_roles SET name = ?, permissions = ? WHERE id = ?',
      [name, JSON.stringify(permissions), req.params.id]
    );
    res.json({ message: 'Роль успішно оновлено!' });
  } catch (err) {
    res.status(500).json({ message: 'Помилка оновлення ролі' });
  }
});

router.delete('/roles/:id', authenticateToken, requirePermission('users'), async (req, res) => {
  try {
    await pool.query('DELETE FROM custom_roles WHERE id = ?', [req.params.id]);
    res.json({ message: 'Роль видалено' });
  } catch (err) {
    res.status(500).json({ message: 'Помилка видалення ролі' });
  }
});

module.exports = router;