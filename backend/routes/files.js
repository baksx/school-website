const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const multer = require('multer');

// 💡 1. ВИПРАВЛЕНО ШЛЯХ: Беремо авторизацію точно так само, як у gallery.js
const { authenticateToken, requirePermission } = require('../middleware/auth');

// Папка для зберігання завантажених документів
const UPLOADS_DIR = path.join(__dirname, '../uploads/documents');

if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Налаштування Multer для документів
const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    // 💡 Нормалізуємо шлях до папки
    const folderPath = req.body.folderPath || '';
    const targetFolder = path.join(UPLOADS_DIR, folderPath);

    // Захист від виходу за межі директорії uploads/documents
    if (!targetFolder.startsWith(UPLOADS_DIR)) {
      return cb(new Error('Некоректний шлях папки'), UPLOADS_DIR);
    }

    if (!fs.existsSync(targetFolder)) {
      fs.mkdirSync(targetFolder, { recursive: true });
    }
    
    cb(null, targetFolder);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const baseName = path.basename(file.originalname, ext);
    const safeName = `${baseName}-${Date.now()}${ext}`;
    cb(null, safeName);
  }
});
const uploadDocument = multer({ storage: fileStorage });

// 1. Отримати вміст директорії (доступно без авторизації або з нею)
router.get('/', (req, res) => {
  try {
    const relativePath = req.query.path || '';
    const currentDir = path.join(UPLOADS_DIR, relativePath);

    if (!currentDir.startsWith(UPLOADS_DIR)) {
      return res.status(400).json({ error: 'Некоректний шлях' });
    }

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
        url: isDirectory ? null : `/uploads/documents/${relativePath ? relativePath + '/' : ''}${itemName}`
      };
    });

    res.json({ currentPath: relativePath, items });
  } catch (err) {
    res.status(500).json({ error: 'Помилка зчитування файлів' });
  }
});

// 💡 2. ВИПРАВЛЕНО АВТОРИЗАЦІЮ: Додано authenticateToken
router.post('/create-folder', authenticateToken, (req, res) => {
  try {
    const { folderName, currentPath = '' } = req.body;
    if (!folderName) return res.status(400).json({ error: 'Назва папки обов’язкова' });

    const newFolderPath = path.join(UPLOADS_DIR, currentPath, folderName);

    if (fs.existsSync(newFolderPath)) {
      return res.status(400).json({ error: 'Папка з такою назвою вже існує' });
    }

    fs.mkdirSync(newFolderPath, { recursive: true });
    res.json({ message: 'Папку успішно створено!' });
  } catch (err) {
    res.status(500).json({ error: 'Помилка створення папки' });
  }
});

// 💡 3. ВИПРАВЛЕНО АВТОРИЗАЦІЮ НА ЗАВАНТАЖЕННЯ
router.post('/upload', authenticateToken, uploadDocument.single('file'), (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Файл не завантажено' });

    const relativePath = req.body.folderPath || '';
    const fileUrl = `/uploads/documents/${relativePath ? relativePath + '/' : ''}${req.file.filename}`;

    res.json({ 
      message: 'Файл успішно завантажено!', 
      fileUrl,
      fileName: req.file.filename
    });
  } catch (err) {
    res.status(500).json({ error: 'Помилка завантаження файла' });
  }
});

// 💡 4. ВИПРАВЛЕНО АВТОРИЗАЦІЮ НА ВИДАЛЕННЯ
router.delete('/', authenticateToken, (req, res) => {
  try {
    const { itemPath, isDirectory } = req.body;
    const fullPath = path.join(UPLOADS_DIR, itemPath);

    if (!fullPath.startsWith(UPLOADS_DIR)) {
      return res.status(400).json({ error: 'Некоректний шлях' });
    }

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
    res.status(500).json({ error: 'Помилка видалення' });
  }
});

module.exports = router;