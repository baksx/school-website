require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const helmet = require('helmet');

// 1. ІНІЦІАЛІЗАЦІЯ ДОДАТКУ
const app = express();

// 2. БЕЗПЕКА ТА MIDDLEWARE (Підключаємо строго до маршрутів)
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 3. ІМПОРТ МАРШРУТІВ
const authRoutes = require('./routes/auth');
const newsRoutes = require('./routes/news');
const albumsRoutes = require('./routes/albums');
const galleryRoutes = require('./routes/gallery');
const settingsRoutes = require('./routes/settings');
const usersRoutes = require('./routes/users');
const uploadRoutes = require('./routes/upload');
const menuRoutes = require('./routes/menu');
const pagesRoutes = require('./routes/pages');
const filesRouter = require('./routes/files');
const pollsRouter = require('./routes/polls');
const announceRouter = require('./routes/announcements');
const statsRoutes = require('./routes/stats');
const { authenticateToken, getMe } = require('./middleware/auth');

// 4. СТАТИЧНІ ФАЙЛИ
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/uploads/documents', express.static(path.join(__dirname, 'uploads/documents')));

// 5. МОНТУВАННЯ API МАРШРУТІВ
app.use('/api', authRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/albums', albumsRoutes);
app.use('/api/gallery', galleryRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/pages', pagesRoutes);
app.use('/api/files', filesRouter);
app.use('/api/polls', pollsRouter);
app.use('/api/announcements', announceRouter);
app.use('/api/stats', statsRoutes);
app.get('/api/me', authenticateToken, getMe);


// 6. РОЗДАЧА REACT-ФРОНТЕНДУ (Для продакшену)
// const distPath = path.resolve(__dirname, '../frontend/dist');
// app.use(express.static(distPath));
// app.get('*', (req, res) => {
//   res.sendFile(path.join(distPath, 'index.html'));
// });

// 7. ЗАПУСК СЕРВЕРА
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Сервер захищено та запущено на порту ${PORT}`));