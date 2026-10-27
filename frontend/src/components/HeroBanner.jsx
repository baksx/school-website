import React from 'react';
import { useNavigate } from 'react-router-dom';

function HeroBanner({ settings = {}, heroBgStyle, defaultHeroBg }) {
  const navigate = useNavigate();

  const getImageUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    const baseUrl = window.location.hostname === 'localhost' ? 'http://localhost:5000' : '';
    return `${baseUrl}${url.startsWith('/') ? '' : '/'}${url}`;
  };

  const computedBgStyle = heroBgStyle || {
    backgroundImage: `linear-gradient(rgba(15, 23, 42, 0.35), rgba(15, 23, 42, 0.45)), url(${
      settings.hero_banner_url ? getImageUrl(settings.hero_banner_url) : defaultHeroBg
    })`
  };

  return (
    <section className="hero-full-section">
      <div className="hero-full-card" style={computedBgStyle}>
        <div className="hero-dark-overlay" />

        <div className="hero-inner-container">
          <div className="hero-content">
            {settings.hero_badge && (
              <span className="hero-badge-pill">
                {settings.hero_badge}
              </span>
            )}

            <h1 className="hero-title">
              {settings.hero_title || 'СУЧАСНА ОСВІТА ДЛЯ ВАШОЇ ДИТИНИ'}
            </h1>

            <p className="hero-subtitle">
              {settings.hero_subtitle || 'Розкриваємо таланти, мотивуємо до знань та готуємо до успішного майбутнього.'}
            </p>

            <div className="hero-buttons">
              <button
                className="btn-hero-orange"
                onClick={() => navigate('/contacts')}
              >
                ПОДАТИ ЗАЯВКУ
              </button>

              <button
                className="btn-hero-glass"
                onClick={() => navigate('/about')}
              >
                ДІЗНАТИСЯ БІЛЬШЕ
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default HeroBanner;