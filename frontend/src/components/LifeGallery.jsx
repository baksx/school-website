import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const getImageUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  const baseUrl = window.location.hostname === 'localhost' ? 'http://localhost:5000' : '';
  return `${baseUrl}${url.startsWith('/') ? '' : '/'}${url}`;
};

function LifeGallery() {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPhoto, setSelectedPhoto] = useState(null);

  const fetchRandomPhotos = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/gallery/random');
      setPhotos(res.data || []);
    } catch (err) {
      console.error('Помилка завантаження фото:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRandomPhotos();
  }, []);

  const mainPhoto = photos[0];
  const subPhotos = photos.slice(1, 5);

  return (
    <section style={{ padding: '60px 20px', background: '#ffffff' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        
        {/* ЗАГОЛОВОК ТА КНОПКА ПЕРЕХОДУ В ГАЛЕРЕЮ */}
<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
  <div>
    <h2 style={{ fontSize: '28px', color: '#0f172a', fontWeight: '800', margin: '0 0 8px 0', textTransform: 'uppercase' }}>
      📷 Життя нашого ліцею
    </h2>
    <p style={{ color: '#64748b', fontSize: '15px', margin: 0 }}>
      Яскраві миті, події та повсякденність нашої ліцейської родини
    </p>
  </div>

  <Link
    to="/gallery"
    style={{
      padding: '10px 18px',
      background: '#2563eb',
      color: '#ffffff',
      borderRadius: '8px',
      fontWeight: '600',
      fontSize: '14px',
      textDecoration: 'none',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '8px',
      boxShadow: '0 2px 8px rgba(37, 99, 235, 0.25)',
      transition: 'background-color 0.2s ease'
    }}
  >
    Вся галерея →
  </Link>
</div>

        {/* НАДІЙНА КОНСТРУКЦІЯ ГАЛЕРЕЇ */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>⏳ Завантаження фотографій...</div>
        ) : photos.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8', background: '#f8fafc', borderRadius: '12px' }}>
            Галерея поки що порожня. Додайте фото через адмінпанель!
          </div>
        ) : (
          <div className="gallery-layout-container" style={{ display: 'flex', gap: '16px', height: '360px' }}>
            
            {/* 1. ВЕЛИКЕ ФОТО ЛІВОРУЧ (займає 45% ширини і 100% висоти) */}
            {mainPhoto && (
              <div
                onClick={() => setSelectedPhoto({ ...mainPhoto, fullImageUrl: getImageUrl(mainPhoto.image_url) })}
                className="gallery-item-wrapper"
                style={{ flex: '0 0 42%', height: '100%', borderRadius: '16px', overflow: 'hidden', position: 'relative', cursor: 'pointer', boxShadow: '0 4px 12px rgba(15, 23, 42, 0.08)', background: '#e2e8f0' }}
              >
                <img
                  src={getImageUrl(mainPhoto.image_url)}
                  alt={mainPhoto.title || 'Життя ліцею'}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                />
                <div className="photo-overlay">
                  <span>{mainPhoto.title || 'Переглянути фото'}</span>
                </div>
              </div>
            )}

            {/* 2. СІТКА 2х2 ПРАВОРУЧ (займає 58% ширини) */}
            <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gridTemplateRows: '1fr 1fr', gap: '16px', height: '100%' }}>
              {subPhotos.map((photo, index) => {
                const fullImageUrl = getImageUrl(photo.image_url);
                return (
                  <div
                    key={photo.id || index}
                    onClick={() => setSelectedPhoto({ ...photo, fullImageUrl })}
                    className="gallery-item-wrapper"
                    style={{ borderRadius: '16px', overflow: 'hidden', position: 'relative', cursor: 'pointer', boxShadow: '0 4px 12px rgba(15, 23, 42, 0.08)', background: '#e2e8f0' }}
                  >
                    <img
                      src={fullImageUrl}
                      alt={photo.title || 'Життя ліцею'}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                    />
                    <div className="photo-overlay">
                      <span>{photo.title || 'Переглянути'}</span>
                    </div>
                  </div>
                );
              })}
            </div>

          </div>
        )}

      </div>

      {/* LIGHTBOX */}
      {selectedPhoto && (
        <div
          onClick={() => setSelectedPhoto(null)}
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.9)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}
        >
          <div style={{ maxWidth: '900px', width: '100%', textAlign: 'center' }}>
            <img
              src={selectedPhoto.fullImageUrl}
              alt={selectedPhoto.title}
              style={{ maxHeight: '80vh', maxWidth: '100%', borderRadius: '12px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.5)' }}
            />
            {selectedPhoto.title && (
              <p style={{ color: '#fff', marginTop: '14px', fontSize: '16px', fontWeight: '500' }}>
                {selectedPhoto.title}
              </p>
            )}
          </div>
        </div>
      )}

      {/* CSS-СПОТИ ТА АНІМАЦІЯ */}
      <style>{`
        .gallery-item-wrapper img {
          transition: transform 0.4s ease;
        }
        .gallery-item-wrapper:hover img {
          transform: scale(1.06);
        }
        .photo-overlay {
          position: absolute;
          bottom: 0; left: 0; right: 0;
          background: linear-gradient(to top, rgba(15, 23, 42, 0.85), transparent);
          padding: 20px 14px 10px;
          color: #fff;
          opacity: 0;
          transition: opacity 0.3s ease;
          font-size: 13px;
          font-weight: 600;
        }
        .gallery-item-wrapper:hover .photo-overlay {
          opacity: 1;
        }

        @media (max-width: 768px) {
          .gallery-layout-container {
            flex-direction: column !important;
            height: auto !important;
          }
          .gallery-item-wrapper {
            height: 240px !important;
          }
        }
      `}</style>
    </section>
  );
}

export default LifeGallery;