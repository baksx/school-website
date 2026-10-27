import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';

const getImageUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  const baseUrl = window.location.hostname === 'localhost' ? 'http://localhost:5000' : '';
  return `${baseUrl}${url.startsWith('/') ? '' : '/'}${url}`;
};

// 💡 Безпечне витягування YYYY-MM-DD без UTC зсуву
const formatDateForInput = (dateString) => {
  if (!dateString) return '';
  if (typeof dateString === 'string' && dateString.length >= 10) {
    return dateString.substring(0, 10);
  }
  return '';
};

// 💡 Поточна дата у локальному форматі YYYY-MM-DD (без ISO та UTC shifts)
const getTodayString = () => {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

// 💡 Визначення року чисто з рядка YYYY, уникаючи new Date() зсувів
const getAlbumYear = (album) => {
  if (!album) return '2026';
  const rawDate = album.created_at || album.date;
  if (rawDate && typeof rawDate === 'string' && rawDate.length >= 4) {
    return rawDate.substring(0, 4);
  }
  const match = album.title && album.title.match(/\b(20\d{2})\b/);
  if (match) return match[1];
  return '2026';
};

function AdminGallery({ token, setMessage }) {
  const [albums, setAlbums] = useState([]);
  const [gallery, setGallery] = useState([]);
  
  const [albumTitle, setAlbumTitle] = useState('');
  const [albumDate, setAlbumDate] = useState('');

  const [selectedAdminYear, setSelectedAdminYear] = useState('all');
  const [editingAlbum, setEditingAlbum] = useState({ id: null, title: '', created_at: '' });
  const [selectedViewAlbumId, setSelectedViewAlbumId] = useState(null);

  const [selectedAlbumId, setSelectedAlbumId] = useState('');
  const [photoTitle, setPhotoTitle] = useState('');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [progressText, setProgressText] = useState('');

  const [fileInputKey, setFileInputKey] = useState(Date.now());

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    axios.get('/api/albums').then(res => setAlbums(res.data)).catch(console.error);
    axios.get('/api/gallery').then(res => setGallery(res.data)).catch(console.error);
  };

  const availableYears = useMemo(() => {
    const yearsSet = new Set(albums.map(getAlbumYear));
    return Array.from(yearsSet).sort((a, b) => b.localeCompare(a));
  }, [albums]);

  const filteredAlbums = useMemo(() => {
    if (selectedAdminYear === 'all') return albums;
    return albums.filter(album => getAlbumYear(album) === selectedAdminYear);
  }, [albums, selectedAdminYear]);

  // 💡 Створення альбому (з передачею чистого рядка YYYY-MM-DD)
  const handleCreateAlbum = async (e) => {
    e.preventDefault();
    const targetDate = albumDate || getTodayString();

    try {
      await axios.post(
        '/api/albums',
        { 
          title: albumTitle, 
          created_at: targetDate,
          date: targetDate
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAlbumTitle('');
      setAlbumDate('');
      if (setMessage) setMessage('🎉 Альбом успішно створено!');
      loadData();
    } catch (err) {
      if (setMessage) setMessage('❌ Помилка створення альбому');
    }
  };

  // 💡 Оновлення альбому
  const handleUpdateAlbum = async (e) => {
    e.preventDefault();
    if (!editingAlbum.title.trim()) return;

    const targetDate = editingAlbum.created_at || getTodayString();

    try {
      await axios.put(
        `/api/albums/${editingAlbum.id}`,
        { 
          title: editingAlbum.title,
          created_at: targetDate,
          date: targetDate
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (setMessage) setMessage('🎉 Альбом успішно оновлено!');
      setEditingAlbum({ id: null, title: '', created_at: '' });
      loadData();
    } catch (err) {
      if (setMessage) setMessage('❌ Помилка оновлення альбому');
    }
  };

  const handleDeleteAlbum = async (id) => {
    if (!window.confirm('Видалити альбом та всі його фото?')) return;
    try {
      await axios.delete(`/api/albums/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      if (setMessage) setMessage('Альбом видалено!');
      if (selectedViewAlbumId === id) setSelectedViewAlbumId(null);
      loadData();
    } catch (err) {
      if (setMessage) setMessage('Помилка видалення альбому');
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files) {
      setSelectedFiles(Array.from(e.target.files));
    }
  };

  const handleAddPhotos = async (e) => {
    e.preventDefault();

    if (!selectedAlbumId) {
      if (setMessage) setMessage('Будь ласка, оберіть альбом!');
      return;
    }

    if (!selectedFiles.length) {
      if (setMessage) setMessage('Оберіть хоча б одну фотографію!');
      return;
    }

    setUploading(true);
    let successCount = 0;

    for (let i = 0; i < selectedFiles.length; i++) {
      const file = selectedFiles[i];
      setProgressText(`Завантаження: ${i + 1} з ${selectedFiles.length}...`);

      try {
        const formData = new FormData();
        formData.append('image', file);

        const uploadRes = await axios.post('/api/upload', formData, {
          headers: { Authorization: `Bearer ${token}` }
        });

        const imageUrl = uploadRes.data.imageUrl;

        await axios.post(
          '/api/gallery',
          {
            title: photoTitle || file.name.replace(/\.[^/.]+$/, ''),
            image_url: imageUrl,
            album_id: selectedAlbumId
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        successCount++;
      } catch (err) {
        console.error(`Помилка завантаження файлу ${file.name}:`, err);
      }
    }

    setUploading(false);
    setProgressText('');
    setSelectedFiles([]);
    setPhotoTitle('');
    setSelectedAlbumId('');
    setFileInputKey(Date.now());

    if (setMessage) setMessage(`🎉 Успішно завантажено ${successCount} з ${selectedFiles.length} фото!`);
    loadData();
  };

  const handleDeletePhoto = async (id) => {
    if (!window.confirm('Видалити це фото?')) return;
    try {
      await axios.delete(`/api/gallery/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      if (setMessage) setMessage('Фото видалено!');
      loadData();
    } catch (err) {
      if (setMessage) setMessage('Помилка видалення фото');
    }
  };

  const openAlbumObj = albums.find(a => String(a.id) === String(selectedViewAlbumId));
  const openAlbumPhotos = gallery.filter(photo => String(photo.album_id) === String(selectedViewAlbumId));

  return (
    <div>
      {/* 1. СТВОРЕННЯ АЛЬБОМУ */}
      <div className="admin-card">
        <h2>📁 Створити новий альбом</h2>
        <form onSubmit={handleCreateAlbum} className="form-group">
          <div className="album-create-grid">
            <div>
              <label className="admin-filter-label">Назва альбому:</label>
              <input
                type="text"
                className="form-control"
                placeholder="Назва альбому (напр. Перший дзвоник)"
                value={albumTitle}
                onChange={e => setAlbumTitle(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="admin-filter-label">Дата створення:</label>
              <input
                type="date"
                className="form-control"
                value={albumDate}
                onChange={e => setAlbumDate(e.target.value)}
              />
            </div>
          </div>
          <div style={{ marginTop: '14px' }}>
            <button type="submit" className="btn btn-primary">
              ➕ Створити альбом
            </button>
          </div>
        </form>
      </div>

      {/* 2. МАСОВЕ ДОДАВАННЯ ФОТО */}
      <div className="admin-card">
        <h2>📸 Додати фотографії у галерею</h2>
        <form onSubmit={handleAddPhotos}>
          <div className="form-group">
            <label className="form-label">Оберіть альбом для завантаження:</label>
            <select
              className="form-control"
              value={selectedAlbumId}
              onChange={e => setSelectedAlbumId(e.target.value)}
              required
            >
              <option value="">-- Оберіть альбом --</option>
              {albums.map(album => (
                <option key={album.id} value={album.id}>
                  {album.title} ({gallery.filter(p => String(p.album_id) === String(album.id)).length} фото)
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Загальний опис / підпис (необов'язково):</label>
            <input
              type="text"
              className="form-control"
              placeholder="Якщо залишити порожнім — підставиться назва файлу"
              value={photoTitle}
              onChange={e => setPhotoTitle(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Оберіть файли зображень:</label>
            <input
              key={`photo-file-${fileInputKey}`}
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileSelect}
              required
              disabled={uploading}
            />
            {selectedFiles.length > 0 && (
              <div className="admin-news-date">
                📎 Обрано файлів: {selectedFiles.length} шт.
              </div>
            )}
          </div>

          {uploading && (
            <div className="admin-alert-message">
              ⏳ {progressText}
            </div>
          )}

          <button type="submit" className="btn btn-primary" disabled={uploading}>
            {uploading ? 'Завантаження...' : `🚀 Завантажити фото (${selectedFiles.length || 0} шт.)`}
          </button>
        </form>
      </div>

      {/* 3. СПИСОК АЛЬБОМІВ */}
      <div className="admin-card">
        <div className="chart-header">
          <h3>📁 Наявні альбоми ({filteredAlbums.length})</h3>

          {availableYears.length > 0 && (
            <div className="chart-tab-group">
              <button
                type="button"
                className={`chart-tab-btn ${selectedAdminYear === 'all' ? 'active' : ''}`}
                onClick={() => setSelectedAdminYear('all')}
              >
                Усі роки
              </button>
              {availableYears.map(year => (
                <button
                  type="button"
                  key={year}
                  className={`chart-tab-btn ${selectedAdminYear === year ? 'active' : ''}`}
                  onClick={() => setSelectedAdminYear(year)}
                >
                  {year}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="admin-albums-list">
          {filteredAlbums.length > 0 ? (
            filteredAlbums.map(album => {
              const albumPhotoCount = gallery.filter(p => String(p.album_id) === String(album.id)).length;
              const isSelected = String(selectedViewAlbumId) === String(album.id);

              return (
                <div
                  key={album.id}
                  className={`admin-album-item ${isSelected ? 'selected' : ''}`}
                >
                  {editingAlbum.id === album.id ? (
                    <form onSubmit={handleUpdateAlbum} className="admin-album-edit-form">
                      <input
                        type="text"
                        className="form-control"
                        style={{ flexGrow: 1 }}
                        value={editingAlbum.title}
                        onChange={e => setEditingAlbum({ ...editingAlbum, title: e.target.value })}
                        required
                      />
                      <input
                        type="date"
                        className="form-control"
                        style={{ width: 'auto' }}
                        value={editingAlbum.created_at}
                        onChange={e => setEditingAlbum({ ...editingAlbum, created_at: e.target.value })}
                      />
                      <button type="submit" className="btn btn-primary">Зберегти</button>
                      <button type="button" className="btn btn-secondary" onClick={() => setEditingAlbum({ id: null, title: '', created_at: '' })}>Скасувати</button>
                    </form>
                  ) : (
                    <>
                      <div className="admin-album-info">
                        <span style={{ fontSize: '18px' }}>📁</span>
                        <div>
                          <strong className="admin-album-title">{album.title}</strong>
                          <small className="admin-album-date">
                            📅 {formatDateForInput(album.created_at || album.date) || getTodayString()}
                          </small>
                        </div>
                        <span className="admin-album-badge">{albumPhotoCount} фото</span>
                      </div>

                      <div className="admin-album-actions">
                        <button
                          className="btn btn-primary"
                          onClick={() => {
                            setSelectedViewAlbumId(album.id);
                            setTimeout(() => {
                              document.getElementById('album-photos-view')?.scrollIntoView({ behavior: 'smooth' });
                            }, 50);
                          }}
                        >
                          {isSelected ? '✓ Відкрито' : '👁️ Зайти в альбом'}
                        </button>

                        <button
                          className="btn btn-warning"
                          onClick={() => setEditingAlbum({ 
                            id: album.id, 
                            title: album.title, 
                            created_at: formatDateForInput(album.created_at || album.date) 
                          })}
                        >
                          ✏️ Редагувати
                        </button>

                        <button
                          className="btn btn-danger"
                          onClick={() => handleDeleteAlbum(album.id)}
                        >
                          🗑️ Видалити
                        </button>
                      </div>
                    </>
                  )}
                </div>
              );
            })
          ) : (
            <div className="admin-news-empty">
              За обраним роком альбомів не знайдено.
            </div>
          )}
        </div>
      </div>

      {/* 4. КЕРУВАННЯ ФОТОГРАФІЯМИ ОБРАНОГО АЛЬБОМУ */}
      <div className="admin-card" id="album-photos-view">
        {selectedViewAlbumId === null ? (
          <div className="gallery-empty-hint">
            <span className="gallery-empty-icon">👈</span>
            <strong>Оберіть альбом зі списку вище</strong>
            <p style={{ fontSize: '13px', marginTop: '4px', margin: 0 }}>
              Натисніть кнопку <b>«👁️ Зайти в альбом»</b> біля потрібного альбому, щоб переглянути та видалити його фотографії.
            </p>
          </div>
        ) : (
          <div>
            <div className="gallery-view-header">
              <h3>
                🖼️ Фотографії альбому «{openAlbumObj?.title}»
                <span className="admin-news-date" style={{ marginLeft: '10px' }}>
                  ({openAlbumPhotos.length} шт.)
                </span>
              </h3>

              <button
                className="btn btn-secondary"
                onClick={() => setSelectedViewAlbumId(null)}
              >
                ✕ Закрити перегляд
              </button>
            </div>

            {openAlbumPhotos.length === 0 ? (
              <div className="admin-news-empty">
                У цьому альбомі поки немає жодної фотографії.
              </div>
            ) : (
              <div className="gallery-photos-grid">
                {openAlbumPhotos.map(photo => (
                  <div key={photo.id} className="gallery-photo-card">
                    <div className="gallery-photo-thumb">
                      <img
                        src={getImageUrl(photo.image_url)}
                        alt={photo.title || 'Фото'}
                        className="gallery-photo-img"
                      />
                    </div>

                    <div className="gallery-photo-footer">
                      <span className="gallery-photo-title" title={photo.title || 'Фото'}>
                        {photo.title || 'Фото'}
                      </span>
                      <button
                        onClick={() => handleDeletePhoto(photo.id)}
                        className="btn btn-danger"
                        style={{ padding: '4px 8px', fontSize: '12px' }}
                        title="Видалити фото"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminGallery;