import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const getImageUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  const baseUrl = window.location.hostname === 'localhost' ? 'http://localhost:5000' : '';
  return `${baseUrl}${url.startsWith('/') ? '' : '/'}${url}`;
};

function LatestNews() {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const res = await axios.get('/api/news');
        setNews((res.data || []).slice(0, 3));
      } catch (err) {
        console.error('Помилка завантаження новин:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  return (
    <section className="home-news-section">
      <div className="home-news-container">
        <div className="home-news-header">
          <div>
            <h2>📰 Останні новини</h2>
            <p>Будьте в курсі найголовніших подій та оголошень нашого ліцею</p>
          </div>

          <Link to="/news" className="btn-all-news">
            Усі новини →
          </Link>
        </div>

        {loading ? (
          <div className="news-loading">⏳ Завантаження новин...</div>
        ) : news.length === 0 ? (
          <div className="news-empty">
            Новин поки немає. Додайте першу новину в адмінпанелі!
          </div>
        ) : (
          <div className="home-news-grid">
            {news.map((item) => {
              const fullImageUrl = getImageUrl(item.image_url);
              const formattedDate = item.created_at
                ? new Date(item.created_at).toLocaleDateString('uk-UA', { day: 'numeric', month: 'long', year: 'numeric' })
                : '';

              return (
                <div key={item.id} className="news-card">
                  <Link 
                    to={`/news/${item.id}`} 
                    state={{ from: '/' }}
                    className="news-card-img-link"
                  >
                    <img
                      src={fullImageUrl || 'https://via.placeholder.com/600x400?text=Новина+Ліцею'}
                      alt={item.title}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://via.placeholder.com/600x400?text=Новина+Ліцею';
                      }}
                    />
                    {formattedDate && (
                      <span className="news-card-badge">
                        📅 {formattedDate}
                      </span>
                    )}
                  </Link>

                  <div className="news-card-body">
                    <h3 className="news-card-title">
                      <Link to={`/news/${item.id}`} state={{ from: '/' }}>
                        {item.title}
                      </Link>
                    </h3>

                    <p className="news-card-excerpt">
                      {item.content 
                        ? item.content
                            .replace(/<[^>]+>/g, '')
                            .replace(/&nbsp;/g, ' ')
                            .substring(0, 130) + '...'
                        : ''
                      }
                    </p>

                    <Link
                      to={`/news/${item.id}`}
                      state={{ from: '/' }}
                      className="news-card-link"
                    >
                      Читати далі →
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

export default LatestNews;