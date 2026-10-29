const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Використовуємо наш стандартний middleware з перевіркою права 'settings' у БД
const { authenticateToken, requirePermission } = require('../middleware/auth');

const UPLOADS_DIR = path.resolve(__dirname, '../uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOADS_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const safeName = `${Date.now()}-${Math.round(Math.random() * 1E9)}${ext}`;
    cb(null, safeName);
  }
});

// 🛡️ Фільтр дозволених розширень зображень
const fileFilter = (req, file, cb) => {
  const allowedExtensions = ['.png', '.jpg', '.jpeg', '.webp', '.gif', '.svg'];
  const ext = path.extname(file.originalname).toLowerCase();

  if (allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Неприпустимий тип файлу! Дозволено лише зображення (png, jpg, jpeg, webp, gif, svg).'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 } // Обмеження 10 МБ
});

// 🔒 Захищено: вимагає токен та право 'settings'
router.post('/', authenticateToken, requirePermission('settings'), (req, res) => {
  upload.single('image')(req, res, (err) => {
    if (err) {
      return res.status(400).json({ error: err.message || 'Помилка завантаження файлу' });
    }
    if (!req.file) {
      return res.status(400).json({ error: 'Файл не завантажено' });
    }

    res.json({ imageUrl: `/uploads/${req.file.filename}` });
  });
});

module.exports = router;