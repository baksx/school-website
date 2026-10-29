const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const multer = require('multer');

// Авторизація та динамічна перевірка прав у БД
const { authenticateToken, requirePermission } = require('../middleware/auth');

// Папка для зберігання завантажених документів
const UPLOADS_DIR = path.resolve(__dirname, '../uploads/documents');

if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// 🛡️ Функція безпечної нормалізації шляху для захисту від Path Traversal
function safePath(baseDir, targetPath = '') {
  const safeRelativePath = path.normalize(targetPath).replace(/^(\.\.[\/\\])+/, '');
  const resolvedPath = path.resolve(baseDir, safeRelativePath);

  if (!resolvedPath.startsWith(baseDir)) {
    throw new Error('Некоректний шлях');
  }
  return resolvedPath;
}

// Налаштування Multer для документів
const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    try {
      const folderPath = req.body.folderPath || '';
      const targetFolder = safePath(UPLOADS_DIR, folderPath);

      if (!fs.existsSync(targetFolder)) {
        fs.mkdirSync(targetFolder, { recursive: true });
      }

      cb(null, targetFolder);
    } catch (err) {
      cb(err, UPLOADS_DIR);
    }
  },
  filename: (req, file, cb) => {
    // 🔤 Виправлення ієрогліфів: конвертуємо з latin1 (ISO-8859-1) в UTF-8
    let originalNameUtf8 = file.originalname;
    try {
      originalNameUtf8 = Buffer.from(file.originalname, 'latin1').toString('utf8');
    } catch (e) {
      originalNameUtf8 = file.originalname;
    }

    const ext = path.extname(originalNameUtf8);
    const baseName = path.basename(originalNameUtf8, ext);
    
    // Очищаємо назву від символів, що ломають файлову систему, але зберігаємо кирилицю
    const cleanBaseName = baseName.replace(/[\\/:*?"<>|]/g, '_');
    const safeName = `${cleanBaseName}-${Date.now()}${ext}`;

    cb(null, safeName);
  }
});

// 🛡️ Фільтр для дозволених розширень файлів
const fileFilter = (req, file, cb) => {
  const allowedExtensions = ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.png', '.jpg', '.jpeg', '.zip', '.rar', '.txt', '.ppt', '.pptx'];
  
  let originalNameUtf8 = file.originalname;
  try {
    originalNameUtf8 = Buffer.from(file.originalname, 'latin1').toString('utf8');
  } catch (e) {}

  const ext = path.extname(originalNameUtf8).toLowerCase();

  if (allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Неприпустимий тип файлу!'), false);
  }
};

const uploadDocument = multer({
  storage: fileStorage,
  fileFilter,
  limits: { fileSize: 25 * 1024 * 1024 } // Обмеження розміру 25 МБ
});

// 1. Отримати вміст директорії
router.get('/', authenticateToken, requirePermission('files'), (req, res) => {
  try {
    const relativePath = req.query.path || '';
    const currentDir = safePath(UPLOADS_DIR, relativePath);

    if (!fs.existsSync(currentDir)) {
      return res.json({ currentPath: relativePath, items: [] });
    }

    const items = fs.readdirSync(currentDir).map(itemName => {
      const itemPath = path.join(currentDir, itemName);
      const stats = fs.statSync(itemPath);
      const isDirectory = stats.isDirectory();

      return {
        name: itemName,
        isDirectory,
        size: isDirectory ? null : stats.size,
        updatedAt: stats.mtime,
        url: isDirectory ? null : `/uploads/documents/${relativePath ? relativePath + '/' : ''}${encodeURIComponent(itemName)}`
      };
    });

    res.json({ currentPath: relativePath, items });
  } catch (err) {
    res.status(400).json({ error: err.message || 'Некоректний шлях' });
  }
});

// 2. Створення папки
router.post('/create-folder', authenticateToken, requirePermission('files'), (req, res) => {
  try {
    const { folderName, currentPath = '' } = req.body;
    if (!folderName || /[\\/:*?"<>|]/.test(folderName)) {
      return res.status(400).json({ error: 'Назва папки обов’язкова або містить недозволені символи' });
    }

    const parentDir = safePath(UPLOADS_DIR, currentPath);
    const newFolderPath = safePath(parentDir, folderName);

    if (fs.existsSync(newFolderPath)) {
      return res.status(400).json({ error: 'Папка з такою назвою вже існує' });
    }

    fs.mkdirSync(newFolderPath, { recursive: true });
    res.json({ message: 'Папку успішно створено!' });
  } catch (err) {
    res.status(400).json({ error: err.message || 'Помилка створення папки' });
  }
});

// 3. Завантаження файла
router.post('/upload', authenticateToken, requirePermission('files'), (req, res) => {
  uploadDocument.single('file')(req, res, (err) => {
    if (err) {
      return res.status(400).json({ error: err.message || 'Помилка завантаження файла' });
    }
    if (!req.file) {
      return res.status(400).json({ error: 'Файл не завантажено' });
    }

    const relativePath = req.body.folderPath || '';
    const fileUrl = `/uploads/documents/${relativePath ? relativePath + '/' : ''}${encodeURIComponent(req.file.filename)}`;

    res.json({
      message: 'Файл успішно завантажено!',
      fileUrl,
      fileName: req.file.filename
    });
  });
});

// 4. Видалення об'єкта
router.delete('/', authenticateToken, requirePermission('files'), (req, res) => {
  try {
    const itemPath = req.body.itemPath || req.query.itemPath;
    const isDirectory = req.body.isDirectory !== undefined ? req.body.isDirectory : (req.query.isDirectory === 'true');

    if (!itemPath) return res.status(400).json({ error: 'Шлях не вказано' });

    const fullPath = safePath(UPLOADS_DIR, itemPath);

    if (fs.existsSync(fullPath)) {
      if (isDirectory) {
        fs.rmSync(fullPath, { recursive: true, force: true });
      } else {
        fs.unlinkSync(fullPath);
      }
      return res.json({ message: 'Видалено успішно' });
    }

    res.status(404).json({ error: 'Об’єкт не знайдено' });
  } catch (err) {
    res.status(400).json({ error: err.message || 'Помилка видалення' });
  }
});

module.exports = router;