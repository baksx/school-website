// import React, { useState, useEffect } from 'react';
// import axios from 'axios';

// const formatDate = (dateString) => {
//   if (!dateString) return 'Немає даних';
//   const date = new Date(dateString);
//   if (isNaN(date.getTime())) return 'Немає даних';
//   return date.toLocaleDateString('uk-UA', { day: 'numeric', month: 'long', year: 'numeric' });
// };

// const visitData7Days = [
//   { label: 'Пн', visits: 240, pageViews: 580 },
//   { label: 'Вт', visits: 310, pageViews: 720 },
//   { label: 'Ср', visits: 450, pageViews: 980 },
//   { label: 'Чт', visits: 390, pageViews: 840 },
//   { label: 'Пт', visits: 520, pageViews: 1150 },
//   { label: 'Сб', visits: 210, pageViews: 410 },
//   { label: 'Нд', visits: 180, pageViews: 390 }
// ];

// const visitData30Days = [
//   { label: 'Тиждень 1', visits: 1850, pageViews: 4200 },
//   { label: 'Тиждень 2', visits: 2300, pageViews: 5100 },
//   { label: 'Тиждень 3', visits: 2900, pageViews: 6400 },
//   { label: 'Тиждень 4', visits: 2600, pageViews: 5800 }
// ];

// function AdminStats({ token, userPermissions = [], setActiveTab, setMessage }) {
//   const [stats, setStats] = useState({
//     newsCount: 0,
//     photosCount: 0,
//     albumsCount: 0,
//     usersCount: 1,
//     lastNewsDate: null,
//     settingsStatus: {
//       hasLogo: false,
//       hasBanner: false,
//       hasPhone: false,
//       hasAddress: false
//     }
//   });
//   const [loading, setLoading] = useState(true);
//   const [timeRange, setTimeRange] = useState('7days');

//   const hasPerm = (perm) => userPermissions.includes(perm);

//   useEffect(() => {
//     const authConfig = token ? { headers: { Authorization: `Bearer ${token}` } } : {};

//     Promise.all([
//       axios.get('/api/news').catch(() => ({ data: [] })),
//       axios.get('/api/albums').catch(() => ({ data: [] })),
//       axios.get('/api/gallery').catch(() => ({ data: [] })),
//       axios.get('/api/settings').catch(() => ({ data: {} })),
//       axios.get('/api/users', authConfig).catch(() => ({ data: [] }))
//     ])
//       .then(([newsRes, albumsRes, galleryRes, settingsRes, usersRes]) => {
//         const news = newsRes.data || [];
//         const albums = albumsRes.data || [];
//         const gallery = galleryRes.data || [];
//         const settings = settingsRes.data || {};
//         const users = usersRes.data || [];

//         const latestNewsDate = news.length > 0 
//           ? news[0].date || news[0].created_at 
//           : null;

//         setStats({
//           newsCount: news.length,
//           albumsCount: albums.length,
//           photosCount: gallery.length,
//           usersCount: users.length > 0 ? users.length : 1,
//           lastNewsDate: latestNewsDate,
//           settingsStatus: {
//             hasLogo: Boolean(settings.school_logo_url),
//             hasBanner: Boolean(settings.hero_banner_url),
//             hasPhone: Boolean(settings.school_phone),
//             hasAddress: Boolean(settings.school_address)
//           }
//         });
//         setLoading(false);
//       })
//       .catch(err => {
//         console.error(err);
//         setLoading(false);
//       });
//   }, [token]);

//   const activeData = timeRange === '7days' ? visitData7Days : visitData30Days;
//   const maxVisits = Math.max(...activeData.map(d => d.visits), 100);
  
//   const chartWidth = 700;
//   const chartHeight = 160;
//   const padding = 30;
//   const viewBoxStr = `0 0 ${chartWidth} ${chartHeight}`;

//   const points = activeData.map((d, index) => {
//     const x = padding + (index * (chartWidth - padding * 2)) / (activeData.length - 1);
//     const y = chartHeight - padding - (d.visits / maxVisits) * (chartHeight - padding * 2);
//     return { x, y, label: d.label, visits: d.visits, pageViews: d.pageViews };
//   });

//   const pathD = points.reduce((acc, point, i) => {
//     return i === 0 ? `M ${point.x} ${point.y}` : `${acc} L ${point.x} ${point.y}`;
//   }, '');

//   const areaD = `${pathD} L ${points[points.length - 1].x} ${chartHeight - padding} L ${points[0].x} ${chartHeight - padding} Z`;

//   const totalVisits = activeData.reduce((acc, curr) => acc + curr.visits, 0);
//   const totalViews = activeData.reduce((acc, curr) => acc + curr.pageViews, 0);

//   if (loading) {
//     return <div className="admin-text-subtle padding-30">⏳ Завантаження статистики...</div>;
//   }

//   return (
//     <div className="admin-stats-wrapper">
//       <div className="stats-cards-grid">
//         <div className="stat-card card-blue">
//           <div className="stat-icon">📰</div>
//           <div className="stat-info">
//             <span className="stat-value">{stats.newsCount}</span>
//             <span className="stat-label">Опубліковано новин</span>
//           </div>
//         </div>

//         <div className="stat-card card-orange">
//           <div className="stat-icon">📸</div>
//           <div className="stat-info">
//             <span className="stat-value">{stats.photosCount}</span>
//             <span className="stat-label">Фотографій у галереї</span>
//           </div>
//         </div>

//         <div className="stat-card card-green">
//           <div className="stat-icon">📁</div>
//           <div className="stat-info">
//             <span className="stat-value">{stats.albumsCount}</span>
//             <span className="stat-label">Фотоальбомів</span>
//           </div>
//         </div>

//         <div className="stat-card card-purple">
//           <div className="stat-icon">👤</div>
//           <div className="stat-info">
//             <span className="stat-value">{stats.usersCount}</span>
//             <span className="stat-label">Адміністраторів системи</span>
//           </div>
//         </div>
//       </div>

//       <div className="stats-details-grid margin-bottom-24">
//         <div className="admin-card">
//           <h3 className="settings-section-title font-size-18">
//             ⚙️ Заповненість налаштувань сайту
//           </h3>
//           <div className="status-checklist">
//             <div className={`status-item ${stats.settingsStatus.hasLogo ? 'done' : 'pending'}`}>
//               <span>{stats.settingsStatus.hasLogo ? '✅' : '⚠️'} Логотип у шапці</span>
//               <small>{stats.settingsStatus.hasLogo ? 'Завантажено' : 'Не встановлено'}</small>
//             </div>
//             <div className={`status-item ${stats.settingsStatus.hasBanner ? 'done' : 'pending'}`}>
//               <span>{stats.settingsStatus.hasBanner ? '✅' : '⚠️'} Привітальний банер</span>
//               <small>{stats.settingsStatus.hasBanner ? 'Завантажено' : 'Використовується стандартний'}</small>
//             </div>
//             <div className={`status-item ${stats.settingsStatus.hasPhone ? 'done' : 'pending'}`}>
//               <span>{stats.settingsStatus.hasPhone ? '✅' : '⚠️'} Контактний телефон</span>
//               <small>{stats.settingsStatus.hasPhone ? 'Вказано' : 'Не вказано'}</small>
//             </div>
//             <div className={`status-item ${stats.settingsStatus.hasAddress ? 'done' : 'pending'}`}>
//               <span>{stats.settingsStatus.hasAddress ? '✅' : '⚠️'} Адреса ліцею</span>
//               <small>{stats.settingsStatus.hasAddress ? 'Вказано' : 'Не вказано'}</small>
//             </div>
//           </div>
//         </div>

//         <div className="admin-card">
//           <h3 className="settings-section-title font-size-18">
//             📈 Активність та швидкі дії
//           </h3>
//           <ul className="stats-info-list">
//             <li>
//               <span>Остання новина:</span>
//               <strong>{formatDate(stats.lastNewsDate)}</strong>
//             </li>
//             <li>
//               <span>Версія системи:</span>
//               <strong>React 19 / Node.js API v1.0</strong>
//             </li>
//           </ul>

//           <hr className="divider-hr" />

//           <h4 className="settings-section-title font-size-14 text-slate-600">⚡ Швидкі дії:</h4>
//           <div className="admin-flex-row-gap flex-wrap">
//             {hasPerm('news') && (
//               <button className="btn btn-primary" onClick={() => setActiveTab('news')}>
//                 ➕ Додати новину
//               </button>
//             )}
//             {hasPerm('gallery') && (
//               <button className="btn btn-secondary" onClick={() => setActiveTab('gallery')}>
//                 📸 Завантажити фото
//               </button>
//             )}
//             {hasPerm('settings') && (
//               <button className="btn btn-warning" onClick={() => setActiveTab('settings')}>
//                 ⚙️ Налаштування
//               </button>
//             )}
//             {hasPerm('users') && (
//               <button className="btn btn-info btn-info-custom" onClick={() => setActiveTab('users')}>
//                 👥 Користувачі та Ролі
//               </button>
//             )}
//           </div>
//         </div>
//       </div>

//       <div className="admin-card chart-card">
//         <div className="chart-header">
//           <div>
//             <h3 className="settings-section-title font-size-18 margin-0">📊 Статистика відвідуваності сайту</h3>
//             <span className="admin-text-subtle font-size-13">Аналітика переглядів сторінок та унікальних візитів</span>
//           </div>

//           <div className="chart-tab-group">
//             <button
//               className={`chart-tab-btn ${timeRange === '7days' ? 'active' : ''}`}
//               onClick={() => setTimeRange('7days')}
//             >
//               За 7 днів
//             </button>
//             <button
//               className={`chart-tab-btn ${timeRange === '30days' ? 'active' : ''}`}
//               onClick={() => setTimeRange('30days')}
//             >
//               За місяць
//             </button>
//           </div>
//         </div>

//         <div className="chart-metrics-row">
//           <div className="chart-metric-item">
//             <span className="metric-label">👥 Всього візитів</span>
//             <span className="metric-value">{totalVisits.toLocaleString()}</span>
//           </div>
//           <div className="chart-metric-item">
//             <span className="metric-label">👁️ Переглядів сторінок</span>
//             <span className="metric-value">{totalViews.toLocaleString()}</span>
//           </div>
//           <div className="chart-metric-item">
//             <span className="metric-label">⏱️ Середній час</span>
//             <span className="metric-value">2хв 45с</span>
//           </div>
//         </div>

//         <div className="chart-svg-container">
//           <svg viewBox={viewBoxStr} className="chart-svg">
//             <defs>
//               <linearGradient id="visitGradient" x1="0" y1="0" x2="0" y2="1">
//                 <stop offset="0%" stopColor="#0284c7" stopOpacity="0.4" />
//                 <stop offset="100%" stopColor="#0284c7" stopOpacity="0.0" />
//               </linearGradient>
//             </defs>

//             <line x1={padding} y1={padding} x2={chartWidth - padding} y2={padding} stroke="#f1f5f9" strokeDasharray="4" />
//             <line x1={padding} y1={chartHeight / 2} x2={chartWidth - padding} y2={chartHeight / 2} stroke="#f1f5f9" strokeDasharray="4" />
//             <line x1={padding} y1={chartHeight - padding} x2={chartWidth - padding} y2={chartHeight - padding} stroke="#cbd5e1" />

//             <path d={areaD} fill="url(#visitGradient)" />

//             <path d={pathD} fill="none" stroke="#0284c7" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />

//             {points.map((pt, i) => (
//               <g key={i} className="chart-point-group">
//                 <circle cx={pt.x} cy={pt.y} r="5" fill="#ffffff" stroke="#0284c7" strokeWidth="3" />
//                 <text x={pt.x} y={pt.y - 12} textAnchor="middle" fill="#0f172a" fontSize="11" fontWeight="700">
//                   {pt.visits}
//                 </text>
//                 <text x={pt.x} y={chartHeight - 8} textAnchor="middle" fill="#64748b" fontSize="12" fontWeight="600">
//                   {pt.label}
//                 </text>
//               </g>
//             ))}
//           </svg>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default AdminStats;

import React, { useState, useEffect } from 'react';
import axios from 'axios';

const formatDate = (dateString) => {
  if (!dateString) return 'Немає даних';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return 'Немає даних';
  return date.toLocaleDateString('uk-UA', { day: 'numeric', month: 'long', year: 'numeric' });
};

const visitData7Days = [
  { label: 'Пн', visits: 240, pageViews: 580 },
  { label: 'Вт', visits: 310, pageViews: 720 },
  { label: 'Ср', visits: 450, pageViews: 980 },
  { label: 'Чт', visits: 390, pageViews: 840 },
  { label: 'Пт', visits: 520, pageViews: 1150 },
  { label: 'Сб', visits: 210, pageViews: 410 },
  { label: 'Нд', visits: 180, pageViews: 390 }
];

const visitData30Days = [
  { label: 'Тиждень 1', visits: 1850, pageViews: 4200 },
  { label: 'Тиждень 2', visits: 2300, pageViews: 5100 },
  { label: 'Тиждень 3', visits: 2900, pageViews: 6400 },
  { label: 'Тиждень 4', visits: 2600, pageViews: 5800 }
];

function AdminStats({ token, userPermissions = [], setActiveTab, setMessage }) {
  const [stats, setStats] = useState({
    newsCount: 0,
    photosCount: 0,
    albumsCount: 0,
    usersCount: 1,
    lastNewsDate: null,
    settingsStatus: {
      hasLogo: false,
      hasBanner: false,
      hasPhone: false,
      hasAddress: false
    }
  });
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7days');

  const hasPerm = (perm) => userPermissions.includes(perm);

  useEffect(() => {
    const authConfig = token ? { headers: { Authorization: `Bearer ${token}` } } : {};

    // 🛡️ Викликаємо /api/users тільки якщо у користувача є дозвіл 'users'
    const getUsersPromise = hasPerm('users')
      ? axios.get('/api/users', authConfig).catch(() => ({ data: [] }))
      : Promise.resolve({ data: [] });

    Promise.all([
      axios.get('/api/news').catch(() => ({ data: [] })),
      axios.get('/api/albums').catch(() => ({ data: [] })),
      axios.get('/api/gallery').catch(() => ({ data: [] })),
      axios.get('/api/settings').catch(() => ({ data: {} })),
      getUsersPromise
    ])
      .then(([newsRes, albumsRes, galleryRes, settingsRes, usersRes]) => {
        const news = newsRes.data || [];
        const albums = albumsRes.data || [];
        const gallery = galleryRes.data || [];
        const settings = settingsRes.data || {};
        const users = usersRes.data || [];

        const latestNewsDate = news.length > 0 
          ? news[0].date || news[0].created_at 
          : null;

        setStats({
          newsCount: news.length,
          albumsCount: albums.length,
          photosCount: gallery.length,
          usersCount: users.length > 0 ? users.length : 1,
          lastNewsDate: latestNewsDate,
          settingsStatus: {
            hasLogo: Boolean(settings.school_logo_url),
            hasBanner: Boolean(settings.hero_banner_url),
            hasPhone: Boolean(settings.school_phone),
            hasAddress: Boolean(settings.school_address)
          }
        });
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [token, userPermissions]);

  const activeData = timeRange === '7days' ? visitData7Days : visitData30Days;
  const maxVisits = Math.max(...activeData.map(d => d.visits), 100);
  
  const chartWidth = 700;
  const chartHeight = 160;
  const padding = 30;
  const viewBoxStr = `0 0 ${chartWidth} ${chartHeight}`;

  const points = activeData.map((d, index) => {
    const x = padding + (index * (chartWidth - padding * 2)) / (activeData.length - 1);
    const y = chartHeight - padding - (d.visits / maxVisits) * (chartHeight - padding * 2);
    return { x, y, label: d.label, visits: d.visits, pageViews: d.pageViews };
  });

  const pathD = points.reduce((acc, point, i) => {
    return i === 0 ? `M ${point.x} ${point.y}` : `${acc} L ${point.x} ${point.y}`;
  }, '');

  const areaD = `${pathD} L ${points[points.length - 1].x} ${chartHeight - padding} L ${points[0].x} ${chartHeight - padding} Z`;

  const totalVisits = activeData.reduce((acc, curr) => acc + curr.visits, 0);
  const totalViews = activeData.reduce((acc, curr) => acc + curr.pageViews, 0);

  if (loading) {
    return <div className="admin-text-subtle padding-30">⏳ Завантаження статистики...</div>;
  }

  return (
    <div className="admin-stats-wrapper">
      <div className="stats-cards-grid">
        <div className="stat-card card-blue">
          <div className="stat-icon">📰</div>
          <div className="stat-info">
            <span className="stat-value">{stats.newsCount}</span>
            <span className="stat-label">Опубліковано новин</span>
          </div>
        </div>

        <div className="stat-card card-orange">
          <div className="stat-icon">📸</div>
          <div className="stat-info">
            <span className="stat-value">{stats.photosCount}</span>
            <span className="stat-label">Фотографій у галереї</span>
          </div>
        </div>

        <div className="stat-card card-green">
          <div className="stat-icon">📁</div>
          <div className="stat-info">
            <span className="stat-value">{stats.albumsCount}</span>
            <span className="stat-label">Фотоальбомів</span>
          </div>
        </div>

        {hasPerm('users') && (
          <div className="stat-card card-purple">
            <div className="stat-icon">👤</div>
            <div className="stat-info">
              <span className="stat-value">{stats.usersCount}</span>
              <span className="stat-label">Адміністраторів системи</span>
            </div>
          </div>
        )}
      </div>

      <div className="stats-details-grid margin-bottom-24">
        <div className="admin-card">
          <h3 className="settings-section-title font-size-18">
            ⚙️ Заповненість налаштувань сайту
          </h3>
          <div className="status-checklist">
            <div className={`status-item ${stats.settingsStatus.hasLogo ? 'done' : 'pending'}`}>
              <span>{stats.settingsStatus.hasLogo ? '✅' : '⚠️'} Логотип у шапці</span>
              <small>{stats.settingsStatus.hasLogo ? 'Завантажено' : 'Не встановлено'}</small>
            </div>
            <div className={`status-item ${stats.settingsStatus.hasBanner ? 'done' : 'pending'}`}>
              <span>{stats.settingsStatus.hasBanner ? '✅' : '⚠️'} Привітальний банер</span>
              <small>{stats.settingsStatus.hasBanner ? 'Завантажено' : 'Використовується стандартний'}</small>
            </div>
            <div className={`status-item ${stats.settingsStatus.hasPhone ? 'done' : 'pending'}`}>
              <span>{stats.settingsStatus.hasPhone ? '✅' : '⚠️'} Контактний телефон</span>
              <small>{stats.settingsStatus.hasPhone ? 'Вказано' : 'Не вказано'}</small>
            </div>
            <div className={`status-item ${stats.settingsStatus.hasAddress ? 'done' : 'pending'}`}>
              <span>{stats.settingsStatus.hasAddress ? '✅' : '⚠️'} Адреса ліцею</span>
              <small>{stats.settingsStatus.hasAddress ? 'Вказано' : 'Не вказано'}</small>
            </div>
          </div>
        </div>

        <div className="admin-card">
          <h3 className="settings-section-title font-size-18">
            📈 Активність та швидкі дії
          </h3>
          <ul className="stats-info-list">
            <li>
              <span>Остання новина:</span>
              <strong>{formatDate(stats.lastNewsDate)}</strong>
            </li>
            <li>
              <span>Версія системи:</span>
              <strong>React 19 / Node.js API v1.0</strong>
            </li>
          </ul>

          <hr className="divider-hr" />

          <h4 className="settings-section-title font-size-14 text-slate-600">⚡ Швидкі дії:</h4>
          <div className="admin-flex-row-gap flex-wrap">
            {hasPerm('news') && (
              <button className="btn btn-primary" onClick={() => setActiveTab('news')}>
                ➕ Додати новину
              </button>
            )}
            {hasPerm('gallery') && (
              <button className="btn btn-secondary" onClick={() => setActiveTab('gallery')}>
                📸 Завантажити фото
              </button>
            )}
            {hasPerm('settings') && (
              <button className="btn btn-warning" onClick={() => setActiveTab('settings')}>
                ⚙️ Налаштування
              </button>
            )}
            {hasPerm('users') && (
              <button className="btn btn-info btn-info-custom" onClick={() => setActiveTab('users')}>
                👥 Користувачі та Ролі
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="admin-card chart-card">
        <div className="chart-header">
          <div>
            <h3 className="settings-section-title font-size-18 margin-0">📊 Статистика відвідуваності сайту</h3>
            <span className="admin-text-subtle font-size-13">Аналітика переглядів сторінок та унікальних візитів</span>
          </div>

          <div className="chart-tab-group">
            <button
              className={`chart-tab-btn ${timeRange === '7days' ? 'active' : ''}`}
              onClick={() => setTimeRange('7days')}
            >
              За 7 днів
            </button>
            <button
              className={`chart-tab-btn ${timeRange === '30days' ? 'active' : ''}`}
              onClick={() => setTimeRange('30days')}
            >
              За місяць
            </button>
          </div>
        </div>

        <div className="chart-metrics-row">
          <div className="chart-metric-item">
            <span className="metric-label">👥 Всього візитів</span>
            <span className="metric-value">{totalVisits.toLocaleString()}</span>
          </div>
          <div className="chart-metric-item">
            <span className="metric-label">👁️ Переглядів сторінок</span>
            <span className="metric-value">{totalViews.toLocaleString()}</span>
          </div>
          <div className="chart-metric-item">
            <span className="metric-label">⏱️ Середній час</span>
            <span className="metric-value">2хв 45с</span>
          </div>
        </div>

        <div className="chart-svg-container">
          <svg viewBox={viewBoxStr} className="chart-svg">
            <defs>
              <linearGradient id="visitGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0284c7" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#0284c7" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            <line x1={padding} y1={padding} x2={chartWidth - padding} y2={padding} stroke="#f1f5f9" strokeDasharray="4" />
            <line x1={padding} y1={chartHeight / 2} x2={chartWidth - padding} y2={chartHeight / 2} stroke="#f1f5f9" strokeDasharray="4" />
            <line x1={padding} y1={chartHeight - padding} x2={chartWidth - padding} y2={chartHeight - padding} stroke="#cbd5e1" />

            <path d={areaD} fill="url(#visitGradient)" />

            <path d={pathD} fill="none" stroke="#0284c7" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />

            {points.map((pt, i) => (
              <g key={i} className="chart-point-group">
                <circle cx={pt.x} cy={pt.y} r="5" fill="#ffffff" stroke="#0284c7" strokeWidth="3" />
                <text x={pt.x} y={pt.y - 12} textAnchor="middle" fill="#0f172a" fontSize="11" fontWeight="700">
                  {pt.visits}
                </text>
                <text x={pt.x} y={chartHeight - 8} textAnchor="middle" fill="#64748b" fontSize="12" fontWeight="600">
                  {pt.label}
                </text>
              </g>
            ))}
          </svg>
        </div>
      </div>
    </div>
  );
}

export default AdminStats;