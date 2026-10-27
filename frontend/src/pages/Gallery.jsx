import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import '../styles/Gallery.css';

const getImageUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  const baseUrl = window.location.hostname === 'localhost' ? 'http://localhost:5000' : '';
  return `${baseUrl}${url.startsWith('/') ? '' : '/'}${url}`;
};

const getAlbumYear = (album) => {
  if (!album) return '2026';
  const match = album.title && album.title.match(/\b(20\d{2})\b/);
  if (match) return match[1];
  if (album.created_at) {
    const y = new Date(album.created_at).getFullYear();
    if (!isNaN(y)) return String(y);
  }
  return '2026';
};

function Gallery() {
  const [albums, setAlbums] = useState([]);
  const [gallery, setGallery] = useState([]);
  const [schoolName, setSchoolName] = useState('Оженинський ліцей ім. Т.Г. Шевченка');

  // Фільтри
  const [selectedYear, setSelectedYear] = useState('all');
  const [activeAlbumId, setActiveAlbumId] = useState('all');

  // Lightbox
  const [activePhotoIndex, setActivePhotoIndex] = useState(null);

  useEffect(() => {
    axios.get('/api/albums').then(res => setAlbums(res.data)).catch(console.error);
    axios.get('/api/gallery').then(res => setGallery(res.data)).catch(console.error);
    
    // Завантажуємо назву школи з налаштувань сайту
    axios.get('/api/settings').then(res => {
      if (res.data && res.data.school_name) {
        setSchoolName(res.data.school_name);
      }
    }).catch(console.error);
  }, []);

  const availableYears = useMemo(() => {
    const yearsSet = new Set(albums.map(getAlbumYear));
    return Array.from(yearsSet).sort((a, b) => b.localeCompare(a));
  }, [albums]);

  const filteredAlbums = useMemo(() => {
    if (selectedYear === 'all') return albums;
    return albums.filter(album => getAlbumYear(album) === selectedYear);
  }, [albums, selectedYear]);

  const filteredPhotos = useMemo(() => {
    return gallery.filter(photo => {
      const album = albums.find(a => String(a.id) === String(photo.album_id));
      const albumYear = getAlbumYear(album);

      const matchYear = selectedYear === 'all' || albumYear === selectedYear;
      const matchAlbum = activeAlbumId === 'all' || String(photo.album_id) === String(activeAlbumId);

      return matchYear && matchAlbum;
    });
  }, [gallery, albums, selectedYear, activeAlbumId]);

  const handleYearChange = (year) => {
    setSelectedYear(year);
    setActiveAlbumId('all');
  };

  const handlePrevPhoto = (e) => {
    e?.stopPropagation();
    setActivePhotoIndex(prev => (prev === 0 ? filteredPhotos.length - 1 : prev - 1));
  };

  const handleNextPhoto = (e) => {
    e?.stopPropagation();
    setActivePhotoIndex(prev => (prev === filteredPhotos.length - 1 ? 0 : prev + 1));
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (activePhotoIndex === null) return;
      if (e.key === 'ArrowLeft') handlePrevPhoto();
      if (e.key === 'ArrowRight') handleNextPhoto();
      if (e.key === 'Escape') setActivePhotoIndex(null);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activePhotoIndex, filteredPhotos.length]);

  // Заборона збереження та скачування
  const handlePreventSave = (e) => {
    e.preventDefault();
    return false;
  };

  return (
    <div className="gallery-page-wrapper" onContextMenu={handlePreventSave}>
      <h1 className="gallery-title">📸 Фотогалерея ліцею</h1>

      {/* 1. ФІЛЬТР ПО РОКАХ */}
      {availableYears.length > 0 && (
        <div className="filter-section">
          <div className="filter-label">📅 Навчальний рік:</div>
          <div className="gallery-tabs-row">
            <button
              className={`filter-chip year-chip ${selectedYear === 'all' ? 'active' : ''}`}
              onClick={() => handleYearChange('all')}
            >
              Усі роки ({gallery.length})
            </button>
            {availableYears.map(year => {
              const countForYear = gallery.filter(p => {
                const a = albums.find(alb => String(alb.id) === String(p.album_id));
                return getAlbumYear(a) === year;
              }).length;

              return (
                <button
                  key={year}
                  className={`filter-chip year-chip ${selectedYear === year ? 'active' : ''}`}
                  onClick={() => handleYearChange(year)}
                >
                  {year} рік ({countForYear})
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 2. ФІЛЬТР ПО АЛЬБОМАХ */}
      <div className="filter-section" style={{ marginBottom: '28px' }}>
        <div className="filter-label">📁 Альбоми:</div>
        <div className="gallery-tabs-row">
          <button
            className={`filter-chip album-chip ${activeAlbumId === 'all' ? 'active' : ''}`}
            onClick={() => setActiveAlbumId('all')}
          >
            Усі альбоми ({filteredPhotos.length})
          </button>

          {filteredAlbums.map(album => {
            const albumPhotoCount = gallery.filter(p => String(p.album_id) === String(album.id)).length;
            return (
              <button
                key={album.id}
                className={`filter-chip album-chip ${String(activeAlbumId) === String(album.id) ? 'active' : ''}`}
                onClick={() => setActiveAlbumId(album.id)}
              >
                {album.title} ({albumPhotoCount})
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. СІТКА ФОТОГРАФІЙ З ДИНАМІЧНИМ ВОДЯНИМ ЗНАКОМ */}
      {filteredPhotos.length === 0 ? (
        <div className="empty-gallery-msg">У цьому розділі поки немає фотографій</div>
      ) : (
        <div className="gallery-grid">
          {filteredPhotos.map((photo, index) => (
            <div
              key={photo.id}
              className="gallery-item protected-photo-wrapper"
              onClick={() => setActivePhotoIndex(index)}
              onContextMenu={handlePreventSave}
            >
              <img
                src={getImageUrl(photo.image_url)}
                alt={photo.title || 'Фото'}
                onDragStart={handlePreventSave}
              />
              {/* ДИНАМІЧНИЙ ВОДЯНИЙ ЗНАК */}
              <div className="photo-watermark">
                {schoolName}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 4. LIGHTBOX З ДИНАМІЧНИМ ВОДЯНИМ ЗНАКОМ */}
      {activePhotoIndex !== null && filteredPhotos[activePhotoIndex] && (
        <div
          className="gallery-modal-overlay"
          onClick={() => setActivePhotoIndex(null)}
          onContextMenu={handlePreventSave}
        >
          <div className="lightbox-content" onClick={e => e.stopPropagation()}>
            <button className="lightbox-close-btn" onClick={() => setActivePhotoIndex(null)}>✕</button>

            {filteredPhotos.length > 1 && (
              <button className="lightbox-nav-btn prev" onClick={handlePrevPhoto}>◀</button>
            )}

            <div className="protected-photo-wrapper lightbox-photo-container">
              <img
                src={getImageUrl(filteredPhotos[activePhotoIndex].image_url)}
                alt="Фото"
                className="lightbox-img"
                onDragStart={handlePreventSave}
                onContextMenu={handlePreventSave}
              />
              {/* ДИНАМІЧНИЙ ВОДЯНИЙ ЗНАК */}
              <div className="lightbox-watermark-center">
                {schoolName}
              </div>
            </div>

            {filteredPhotos.length > 1 && (
              <button className="lightbox-nav-btn next" onClick={handleNextPhoto}>▶</button>
            )}

            <div className="lightbox-caption">
              {filteredPhotos[activePhotoIndex].title && <span>{filteredPhotos[activePhotoIndex].title} • </span>}
              <span>{activePhotoIndex + 1} з {filteredPhotos.length}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Gallery;