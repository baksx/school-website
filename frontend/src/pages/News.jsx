import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

import '../styles/News.css';

if (window.location.hostname === 'localhost') {
  axios.defaults.baseURL = 'http://localhost:5000';
}

const getImageUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  const baseUrl = window.location.hostname === 'localhost' ? 'http://localhost:5000' : '';
  return `${baseUrl}${url.startsWith('/') ? '' : '/'}${url}`;
};

const getPreviewText = (htmlContent, limit = 120) => {
  if (!htmlContent) return '';
  const doc = new DOMParser().parseFromString(htmlContent, 'text/html');
  const plainText = (doc.body.textContent || '')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  if (plainText.length <= limit) return plainText;
  return plainText.substring(0, limit) + '...';
};

const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('uk-UA', { day: 'numeric', month: 'long', year: 'numeric' });
};

const MONTHS = [
  { id: 'all', name: 'Усі місяці' },
  { id: '0', name: 'Січень' },
  { id: '1', name: 'Лютий' },
  { id: '2', name: 'Березень' },
  { id: '3', name: 'Квітень' },
  { id: '4', name: 'Травень' },
  { id: '5', name: 'Червень' },
  { id: '6', name: 'Липень' },
  { id: '7', name: 'Серпень' },
  { id: '8', name: 'Вересень' },
  { id: '9', name: 'Жовтень' },
  { id: '10', name: 'Листопад' },
  { id: '11', name: 'Грудень' }
];

const ITEMS_PER_PAGE = 6; // Кількість новин на одній сторінці

function News() {
  const [newsList, setNewsList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Стан фільтрів та пагінації
  const [selectedYear, setSelectedYear] = useState('all');
  const [selectedMonth, setSelectedMonth] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    axios.get('/api/news')
      .then(res => {
        setNewsList(res.data || []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Помилка завантаження новин:', err);
        setLoading(false);
      });
  }, []);

  // 1. Автоматичний розрахунок наявних років з новин
  const availableYears = useMemo(() => {
    const years = new Set();
    newsList.forEach(item => {
      const d = new Date(item.date || item.created_at);
      if (!isNaN(d.getFullYear())) {
        years.add(String(d.getFullYear()));
      }
    });
    return Array.from(years).sort((a, b) => b.localeCompare(a));
  }, [newsList]);

  // 2. Фільтрація новин за датою
  const filteredNews = useMemo(() => {
    return newsList.filter(item => {
      const d = new Date(item.date || item.created_at);
      if (isNaN(d.getTime())) return true;

      const yearMatches = selectedYear === 'all' || String(d.getFullYear()) === selectedYear;
      const monthMatches = selectedMonth === 'all' || String(d.getMonth()) === selectedMonth;

      return yearMatches && monthMatches;
    });
  }, [newsList, selectedYear, selectedMonth]);

  // Скидання на першу сторінку при зміні фільтрів
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedYear, selectedMonth]);

  // 3. Розрахунок новин для поточної сторінки
  const totalPages = Math.ceil(filteredNews.length / ITEMS_PER_PAGE);
  const paginatedNews = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredNews.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredNews, currentPage]);

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="news-page-wrapper">
      <div className="news-page-container">
        
        {/* ЗАГОЛОВОК СТОРІНКИ */}
        <div className="news-page-header">
          <h1>📰 Новини та події ліцею</h1>
          <p>Дізнавайтеся першими про всі важливі події, досягнення та шкільні заходи</p>
        </div>

        {/* ПАНЕЛЬ ФІЛЬТРІВ (РІК ТА МІСЯЦЬ) */}
        <div className="news-filters-bar">
          <div className="news-filter-group">
            <label>📅 Навчальний рік:</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="news-filter-select"
            >
              <option value="all">Усі роки</option>
              {availableYears.map(year => (
                <option key={year} value={year}>{year} рік</option>
              ))}
            </select>
          </div>

          <div className="news-filter-group">
            <label>🗓️ Місяць:</label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="news-filter-select"
            >
              {MONTHS.map(m => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
          </div>

          {(selectedYear !== 'all' || selectedMonth !== 'all') && (
            <button
              className="btn-reset-filters"
              onClick={() => {
                setSelectedYear('all');
                setSelectedMonth('all');
              }}
            >
              ✕ Скинути фільтри
            </button>
          )}
        </div>

        {/* СІТКА НОВИН */}
        {loading ? (
          <div className="news-loading">⏳ Завантаження новин...</div>
        ) : paginatedNews.length === 0 ? (
          <div className="news-empty">
            {newsList.length === 0
              ? 'Наразі немає опублікованих новин.'
              : 'За обраний період новин не знайдено.'}
          </div>
        ) : (
          <>
            <div className="news-page-grid">
              {paginatedNews.map(item => {
                const dateFormatted = formatDate(item.date || item.created_at);
                const previewText = getPreviewText(item.content, 120);

                return (
                  <article key={item.id} className="news-page-card">
                    {item.image_url && (
                      <Link to={`/news/${item.id}`} state={{ from: '/news' }} className="news-card-img-box">
                        <img src={getImageUrl(item.image_url)} alt={item.title} />
                      </Link>
                    )}
                    <div className="news-card-content">
                      {dateFormatted && (
                        <div className="news-card-date-badge">
                          📅 {dateFormatted}
                        </div>
                      )}
                      <h2 className="news-card-title-text">
                        <Link to={`/news/${item.id}`} state={{ from: '/news' }} style={{ textDecoration: 'none', color: 'inherit' }}>
                          {item.title}
                        </Link>
                      </h2>
                      <p className="news-card-excerpt">{previewText}</p>

                      <Link
                        to={`/news/${item.id}`}
                        state={{ from: '/news' }}
                        className="btn-read-more-orange"
                        style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                      >
                        Читати далі ➔
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>

            {/* БЛОК ПАГІНАЦІЇ */}
            {totalPages > 1 && (
              <div className="pagination-container">
                <button
                  className="pagination-btn"
                  disabled={currentPage === 1}
                  onClick={() => handlePageChange(currentPage - 1)}
                >
                  ◀ Назад
                </button>

                {Array.from({ length: totalPages }, (_, index) => index + 1).map(page => (
                  <button
                    key={page}
                    className={`pagination-number ${currentPage === page ? 'active' : ''}`}
                    onClick={() => handlePageChange(page)}
                  >
                    {page}
                  </button>
                ))}

                <button
                  className="pagination-btn"
                  disabled={currentPage === totalPages}
                  onClick={() => handlePageChange(currentPage + 1)}
                >
                  Вперед ▶
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default News;