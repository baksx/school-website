const express = require('express');
const cors = require('cors');
const path = require('path');

// Імпортуємо підключені роутери
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
const announceRouter = require('./routes/announcements')
const helmet = require('helmet');

const app = express();

app.use(cors());
app.use(express.json());

// Роздача завантажених фотографій
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Роздача статичних документів
app.use('/uploads/documents', express.static(path.join(__dirname, 'uploads/documents')));

// Монтування API роутів
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
app.use(helmet());


// Роздача зібраного React-фронтенду та підтримка React Router
// const distPath = path.resolve(__dirname, '../frontend/dist');
// app.use(express.static(distPath));

// app.get(/^.*/, (req, res) => {
//   res.sendFile(path.join(distPath, 'index.html'));
// });

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Сервер запущено на порту ${PORT}`));