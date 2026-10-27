import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import '../styles/News.css';

const getImageUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  const baseUrl = window.location.hostname === 'localhost' ? 'http://localhost:5000' : '';
  return `${baseUrl}${url.startsWith('/') ? '' : '/'}${url}`;
};

function NewsDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const backTarget = location.state?.from || '/';
  const backText = backTarget === '/news' ? '← Назад до новин' : '← Назад на головну';

  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);

    const fetchArticle = async () => {
      try {
        setLoading(true);
        let foundArticle = null;
        try {
          const res = await axios.get(`/api/news/${id}`);
          foundArticle = res.data;
        } catch (singleErr) {
          const resAll = await axios.get('/api/news');
          const allNews = resAll.data || [];
          foundArticle = allNews.find((item) => String(item.id) === String(id));
        }

        if (foundArticle) {
          setArticle(foundArticle);
        } else {
          setError('Новину не знайдено');
        }
      } catch (err) {
        console.error('Помилка завантаження новини:', err);
        setError('Виникла помилка завантаження новини.');
      } finally {
        setLoading(false);
      }
    };

    fetchArticle();
  }, [id]);

  if (loading) {
    return <div className="news-loading" style={{ padding: '80px 20px' }}>⏳ Завантаження новини...</div>;
  }

  if (error || !article) {
    return (
      <div className="news-page-container" style={{ textAlign: 'center', padding: '60px 20px' }}>
        <h2 style={{ fontSize: '24px', color: '#ef4444', marginBottom: '16px' }}>⚠️ {error || 'Новину не знайдено'}</h2>
        <button className="btn-read-more-orange" onClick={() => navigate(backTarget)}>
          {backText}
        </button>
      </div>
    );
  }

  const fullImageUrl = getImageUrl(article.image_url);
  const formattedDate = article.created_at
    ? new Date(article.created_at).toLocaleDateString('uk-UA', { day: 'numeric', month: 'long', year: 'numeric' })
    : '';

  return (
    <article className="news-detail-wrapper">
      <div className="news-detail-card">
        <Link to={backTarget} className="btn-back-link">
          {backText}
        </Link>

        {formattedDate && (
          <div className="news-detail-date">
            📅 {formattedDate}
          </div>
        )}

        <h1 className="news-detail-title">
          {article.title}
        </h1>

        {fullImageUrl && (
          <div className="news-detail-img-box">
            <img
              src={fullImageUrl}
              alt={article.title}
              onError={(e) => { e.target.style.display = 'none'; }}
            />
          </div>
        )}

        <div
          className="news-modal-html"
          dangerouslySetInnerHTML={{
            __html: article.content
              ? article.content.replace(/&nbsp;/g, ' ')
              : ''
          }}
        />
      </div>
    </article>
  );
}

export default NewsDetail;