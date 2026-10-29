// const jwt = require('jsonwebtoken');
// require('dotenv').config();

// const JWT_SECRET = process.env.JWT_SECRET;

// // 🔌 Підключіть ваш пул/з'єднання MySQL (наприклад, mysql2/promise або mysql)
// const db = require('../config/db'); 

// // Функція зчитування СВІЖИХ даних користувача з MySQL
// async function getUserFromDB(userId) {
//   try {
//     if (!userId) return null;

//     // Якщо використовується mysql2 (з async/await)
//     const [rows] = await db.query(
//       'SELECT id, username, role, permissions FROM users WHERE id = ?', 
//       [userId]
//     );

//     if (rows && rows.length > 0) {
//       return rows[0];
//     }

//     return null;
//   } catch (err) {
//     console.error('Помилка зчитування юзера з MySQL:', err);
//     return null;
//   }
// }

// const authenticateToken = (req, res, next) => {
//   const authHeader = req.headers['authorization'];
//   const token = authHeader && authHeader.split(' ')[1];

//   if (!token) {
//     return res.status(401).json({ message: 'Авторизація відсутня' });
//   }

//   jwt.verify(token, JWT_SECRET, (err, user) => {
//     if (err) {
//       return res.status(403).json({ message: 'Сесія застаріла або токен недійсний' });
//     }
//     req.user = user;
//     next();
//   });
// };

// const requirePermission = (permission) => {
//   return async (req, res, next) => {
//     if (!req.user || !req.user.id) {
//       return res.status(403).json({ message: 'Доступ заборонено' });
//     }

//     try {
//       // 1. Отримуємо актуального юзера з MySQL
//       const dbUser = (await getUserFromDB(req.user.id)) || req.user;

//       if (!dbUser) {
//         return res.status(401).json({ message: 'Користувача не знайдено в БД' });
//       }

//       // 👑 2. СУПЕРАДМІН (role === 'admin') МАЄ ПОВНИЙ ДОСТУП ДО ВСЬОГО
//       if (dbUser.role === 'admin') {
//         return next();
//       }

//       // 3. Обробка прав для звичайних користувачів
//       let userPerms = dbUser.permissions;
//       if (typeof userPerms === 'string') {
//         try { 
//           userPerms = JSON.parse(userPerms); 
//         } catch (e) { 
//           userPerms = []; 
//         }
//       }
//       if (!Array.isArray(userPerms)) userPerms = [];

//       // 📁 Автоматичне право на файловий менеджер для 'pages' або 'news'
//       if ((userPerms.includes('pages') || userPerms.includes('news')) && !userPerms.includes('files')) {
//         userPerms.push('files');
//       }

//       // 4. Перевірка конкретного права
//       if (userPerms.includes(permission)) {
//         return next();
//       }

//       return res.status(403).json({ message: 'Недостатньо прав доступу' });
//     } catch (err) {
//       console.error('Помилка перевірки прав:', err);
//       return res.status(500).json({ message: 'Помилка сервера при перевірці прав' });
//     }
//   };
// };

// const getMe = async (req, res) => {
//   try {
//     const dbUser = (await getUserFromDB(req.user.id)) || req.user;

//     if (!dbUser) {
//       return res.status(404).json({ message: 'Користувача не знайдено' });
//     }

//     let perms = dbUser.permissions;
//     if (typeof perms === 'string') {
//       try { 
//         perms = JSON.parse(perms); 
//       } catch (e) { 
//         perms = []; 
//       }
//     }

//     res.json({
//       id: dbUser.id,
//       username: dbUser.username,
//       role: dbUser.role,
//       permissions: perms || []
//     });
//   } catch (err) {
//     res.status(500).json({ message: 'Помилка отримання профілю' });
//   }
// };

// module.exports = { authenticateToken, requirePermission, getMe, JWT_SECRET };
const jwt = require('jsonwebtoken');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'school_secret_jwt_key_2026';
const pool = require('../config/db');

// Запит актуального юзера безпосередньо з MySQL
async function getUserFromDB(userId) {
  try {
    if (!userId) return null;
    const [rows] = await pool.query(
      'SELECT id, username, role, permissions FROM users WHERE id = ?', 
      [userId]
    );
    return rows.length > 0 ? rows[0] : null;
  } catch (err) {
    console.error('Помилка зчитування юзера з MySQL:', err);
    return null;
  }
}

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Авторизація відсутня' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Сесія застаріла або токен недійсний' });
    }
    req.user = user;
    next();
  });
};

const requirePermission = (permission) => {
  return async (req, res, next) => {
    if (!req.user || !req.user.id) {
      return res.status(403).json({ message: 'Доступ заборонено' });
    }

    try {
      // 1. Зчитуємо СВІЖОГО юзера з MySQL при кожному запиті
      const dbUser = await getUserFromDB(req.user.id);

      if (!dbUser) {
        return res.status(401).json({ message: 'Користувача не знайдено або заблоковано' });
      }

      // 👑 2. СУПЕРАДМІН (role === 'admin') має повний доступ
      if (dbUser.role === 'admin') {
        return next();
      }

      // 3. Зчитуємо актуальні права з бази
      let userPerms = dbUser.permissions;
      if (typeof userPerms === 'string') {
        try { userPerms = JSON.parse(userPerms); } catch (e) { userPerms = []; }
      }
      if (!Array.isArray(userPerms)) userPerms = [];

      // 4. Перевірка наявності потрібного права
      if (userPerms.includes(permission)) {
        return next();
      }

      return res.status(403).json({ message: 'Доступ заборонено: право відкликане' });
    } catch (err) {
      console.error('Помилка перевірки прав:', err);
      return res.status(500).json({ message: 'Помилка сервера при перевірці прав' });
    }
  };
};

const getMe = async (req, res) => {
  try {
    const dbUser = await getUserFromDB(req.user.id);

    if (!dbUser) {
      return res.status(404).json({ message: 'Користувача не знайдено' });
    }

    let perms = dbUser.permissions;
    if (typeof perms === 'string') {
      try { perms = JSON.parse(perms); } catch (e) { perms = []; }
    }

    if (dbUser.role === 'admin') {
      perms = ['stats', 'news', 'gallery', 'pages', 'settings', 'users', 'menu', 'files', 'polls', 'announcements'];
    }

    res.json({
      id: dbUser.id,
      username: dbUser.username,
      role: dbUser.role,
      permissions: perms || []
    });
  } catch (err) {
    res.status(500).json({ message: 'Помилка отримання профілю' });
  }
};

module.exports = { authenticateToken, requirePermission, getMe, JWT_SECRET };