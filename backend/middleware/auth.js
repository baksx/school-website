const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'school_secret_jwt_key_2026';

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ message: 'Авторизація відсутня' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: 'Сесія застаріла' });
    req.user = user;
    next();
  });
};

// Перевірка конкретного права (або чи є користувач суперадміном)
const requirePermission = (permission) => {
  return (req, res, next) => {
    if (!req.user) return res.status(403).json({ message: 'Доступ заборонено' });

    const userPerms = Array.isArray(req.user.permissions) ? req.user.permissions : [];
    
    if (req.user.role === 'admin' || userPerms.includes(permission)) {
      return next();
    }
    return res.status(403).json({ message: 'Недостатньо прав доступу' });
  };
};

module.exports = { authenticateToken, requirePermission, JWT_SECRET };