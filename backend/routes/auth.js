const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const pool = require('../config/db');
const { JWT_SECRET } = require('../middleware/auth');

router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const [rows] = await pool.query('SELECT * FROM users WHERE username = ?', [username]);

    if (rows.length > 0) {
      const user = rows[0];
      let isMatch = false;

      if (user.password.startsWith('$2a$') || user.password.startsWith('$2b$')) {
        isMatch = await bcrypt.compare(password, user.password);
      } else {
        isMatch = (password === user.password);
      }

      if (isMatch) {
        let permissions = [];
        try {
          permissions = typeof user.permissions === 'string' 
            ? JSON.parse(user.permissions) 
            : (user.permissions || []);
        } catch (e) {
          permissions = [];
        }

        // Головний адмін отримує повний доступ
        if (user.role === 'admin') {
          permissions = ['stats', 'news', 'gallery', 'settings', 'users'];
        }

        // Гарантуємо доступ до статистики для всіх користувачів
        if (!permissions.includes('stats')) {
          permissions.unshift('stats');
        }

        const token = jwt.sign(
          { id: user.id, username: user.username, role: user.role, permissions },
          JWT_SECRET,
          { expiresIn: '8h' }
        );
        return res.json({ token, role: user.role, permissions });
      }
    }
  } catch (err) {
    console.error('Помилка авторизації:', err);
    return res.status(500).json({ error: 'Помилка сервера під час входу' });
  }

//   // Резервний суперадмін
//   if (username === 'admin' && (password === 'S4df6gto125913' || password === 'admin123')) {
//     const permissions = ['stats', 'news', 'gallery', 'settings', 'users'];
//     const token = jwt.sign({ username: 'admin', role: 'admin', permissions }, JWT_SECRET, { expiresIn: '8h' });
//     return res.json({ token, role: 'admin', permissions });
//   }

  res.status(401).json({ error: 'Невірний логін або пароль' });
});

module.exports = router;