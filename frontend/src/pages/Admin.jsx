// import React, { useState, useEffect, useCallback } from 'react';
// import axios from 'axios';
// import '../styles/Admin.css';

// import AdminStats from '../components/admin/AdminStats';
// import AdminNews from '../components/admin/AdminNews';
// import AdminGallery from '../components/admin/AdminGallery';
// import AdminSettings from '../components/admin/AdminSettings';
// import AdminUsers from '../components/admin/AdminUsers';
// import AdminMenu from '../components/admin/AdminMenu';
// import AdminPages from '../components/admin/AdminPages';
// import AdminFileManager from '../components/admin/AdminFileManager';
// import AdminPolls from '../components/admin/AdminPolls';
// import AdminAnnouncements from '../components/admin/AdminAnnouncements';

// function LoginForm({ setToken, message, setMessage }) {
//   const [username, setUsername] = useState('');
//   const [password, setPassword] = useState('');
//   const [loading, setLoading] = useState(false);

//   const handleLogin = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     if (setMessage) setMessage('');

//     try {
//       const res = await axios.post('/api/login', { username, password });
//       if (res.data.token) {
//         localStorage.setItem('adminToken', res.data.token);
//         window.dispatchEvent(new Event('authChange'));
//         setToken(res.data.token);
//         if (setMessage) setMessage('🎉 Успішний вхід!');
//       }
//     } catch (err) {
//       const errorMsg = err.response?.data?.error || err.response?.data?.message || 'Невірний логін або пароль';
//       if (setMessage) setMessage(`❌ ${errorMsg}`);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="login-card-container">
//       <h2 className="login-card-title">🔑 Вхід в адмінпанель</h2>

//       {message && <div className="admin-alert-error">{message}</div>}

//       <form onSubmit={handleLogin}>
//         <div className="form-group">
//           <label className="form-label">Логін:</label>
//           <input
//             type="text"
//             className="form-control"
//             value={username}
//             onChange={(e) => {
//               setUsername(e.target.value);
//               if (message && setMessage) setMessage('');
//             }}
//             placeholder="Введіть логін"
//             required
//           />
//         </div>
//         <div className="form-group">
//           <label className="form-label">Пароль:</label>
//           <input
//             type="password"
//             className="form-control"
//             value={password}
//             onChange={(e) => {
//               setPassword(e.target.value);
//               if (message && setMessage) setMessage('');
//             }}
//             placeholder="Введіть пароль"
//             required
//           />
//         </div>
//         <button
//           type="submit"
//           disabled={loading}
//           className="btn btn-primary btn-login-submit"
//         >
//           {loading ? 'Завантаження...' : 'Увійти'}
//         </button>
//       </form>
//     </div>
//   );
// }

// function AdminDashboard() {
//   const [token, setToken] = useState(localStorage.getItem('adminToken') || '');
//   const [activeTab, setActiveTab] = useState('stats');
//   const [message, setMessage] = useState('');
//   const [permissions, setPermissions] = useState([]);
//   const [loadingPerms, setLoadingPerms] = useState(true);

//   // Отримання актуальних прав із сервера
//   const fetchCurrentPermissions = useCallback(async () => {
//     if (!token) {
//       setLoadingPerms(false);
//       return;
//     }

//     try {
//       const res = await axios.get('/api/me', {
//         headers: { Authorization: `Bearer ${token}` }
//       });

//       let updatedPerms = res.data.role === 'admin'
//         ? ['stats', 'news', 'gallery', 'pages', 'settings', 'users', 'menu', 'files', 'polls', 'announcements']
//         : (res.data.permissions || []);

//       if (!updatedPerms.includes('stats')) {
//         updatedPerms.unshift('stats');
//       }

//       setPermissions(updatedPerms);
//     } catch (err) {
//       if (err.response?.status === 401 || err.response?.status === 403 || err.response?.status === 404) {
//         localStorage.removeItem('adminToken');
//         setToken('');
//         window.dispatchEvent(new Event('authChange'));
//       }
//     } finally {
//       setLoadingPerms(false);
//     }
//   }, [token]);

//   useEffect(() => {
//     fetchCurrentPermissions();

//     const interval = setInterval(() => {
//       fetchCurrentPermissions();
//     }, 5000);

//     const handleFocus = () => fetchCurrentPermissions();
//     const handlePermsUpdated = () => fetchCurrentPermissions();

//     window.addEventListener('focus', handleFocus);
//     window.addEventListener('permissionsUpdated', handlePermsUpdated);

//     return () => {
//       clearInterval(interval);
//       window.removeEventListener('focus', handleFocus);
//       window.removeEventListener('permissionsUpdated', handlePermsUpdated);
//     };
//   }, [fetchCurrentPermissions]);

//   useEffect(() => {
//     if (permissions.length > 0 && !permissions.includes(activeTab)) {
//       setActiveTab(permissions.includes('stats') ? 'stats' : permissions[0]);
//     }
//   }, [permissions, activeTab]);

//   useEffect(() => {
//     if (message) {
//       const timer = setTimeout(() => {
//         setMessage('');
//       }, 3000);
//       return () => clearTimeout(timer);
//     }
//   }, [message]);

//   if (!token) {
//     return (
//       <div className="admin-page-wrapper">
//         <LoginForm setToken={setToken} message={message} setMessage={setMessage} />
//       </div>
//     );
//   }

//   if (loadingPerms) {
//     return (
//       <div className="admin-page-wrapper text-center">
//         <div className="admin-card">Синхронізація прав доступу...</div>
//       </div>
//     );
//   }

//   const hasPerm = (perm) => permissions.includes(perm);

//   return (
//     <div className="admin-page-wrapper">
//       <div className="admin-header-row">
//         <h1>⚙️ Панель управління</h1>
//       </div>

//       {message && <div className="admin-alert-message">{message}</div>}

//       <div className="admin-tabs-nav">
//         {hasPerm('stats') && (
//           <button
//             onClick={() => setActiveTab('stats')}
//             className={`admin-tab-btn ${activeTab === 'stats' ? 'active' : ''}`}
//           >
//             📊 Головна
//           </button>
//         )}
//         {hasPerm('news') && (
//           <button
//             onClick={() => setActiveTab('news')}
//             className={`admin-tab-btn ${activeTab === 'news' ? 'active' : ''}`}
//           >
//             📰 Новини
//           </button>
//         )}
//         {hasPerm('gallery') && (
//           <button
//             onClick={() => setActiveTab('gallery')}
//             className={`admin-tab-btn ${activeTab === 'gallery' ? 'active' : ''}`}
//           >
//             📸 Фотогалерея
//           </button>
//         )}
//         {hasPerm('pages') && (
//           <button
//             onClick={() => setActiveTab('pages')}
//             className={`admin-tab-btn ${activeTab === 'pages' ? 'active' : ''}`}
//           >
//             📄 Сторінки
//           </button>
//         )}
//         {hasPerm('settings') && (
//           <button
//             onClick={() => setActiveTab('settings')}
//             className={`admin-tab-btn ${activeTab === 'settings' ? 'active' : ''}`}
//           >
//             ⚙️ Налаштування
//           </button>
//         )}
//         {hasPerm('users') && (
//           <button
//             onClick={() => setActiveTab('users')}
//             className={`admin-tab-btn ${activeTab === 'users' ? 'active' : ''}`}
//           >
//             👥 Користувачі та Ролі
//           </button>
//         )}
//         {hasPerm('menu') && (
//           <button
//             onClick={() => setActiveTab('menu')}
//             className={`admin-tab-btn ${activeTab === 'menu' ? 'active' : ''}`}
//           >
//             🌐 Головне меню
//           </button>
//         )}
//         {hasPerm('files') && (
//           <button
//             onClick={() => setActiveTab('files')}
//             className={`admin-tab-btn ${activeTab === 'files' ? 'active' : ''}`}
//           >
//             📁 Файловий менеджер
//           </button>
//         )}
//         {hasPerm('polls') && (
//           <button
//             onClick={() => setActiveTab('polls')}
//             className={`admin-tab-btn ${activeTab === 'polls' ? 'active' : ''}`}
//           >
//             📊 Опитування
//           </button>
//         )}
//         {hasPerm('announcements') && (
//           <button
//             onClick={() => setActiveTab('announcements')}
//             className={`admin-tab-btn ${activeTab === 'announcements' ? 'active' : ''}`}
//           >
//             📢 Оголошення
//           </button>
//         )}
//       </div>  

//       {activeTab === 'stats' && hasPerm('stats') && <AdminStats token={token} setMessage={setMessage} setActiveTab={setActiveTab} />}
//       {activeTab === 'news' && hasPerm('news') && <AdminNews token={token} setMessage={setMessage} />}
//       {activeTab === 'gallery' && hasPerm('gallery') && <AdminGallery token={token} setMessage={setMessage} />}
//       {activeTab === 'pages' && hasPerm('pages') && <AdminPages token={token} setMessage={setMessage} />}
//       {activeTab === 'settings' && hasPerm('settings') && <AdminSettings token={token} setMessage={setMessage} />}
//       {activeTab === 'users' && hasPerm('users') && <AdminUsers token={token} setMessage={setMessage} />}
//       {activeTab === 'menu' && hasPerm('menu') && <AdminMenu token={token} setMessage={setMessage} />}
//       {activeTab === 'files' && hasPerm('files') && <AdminFileManager token={token} setMessage={setMessage} />}
//       {activeTab === 'polls' && hasPerm('polls') && <AdminPolls token={token} setMessage={setMessage} />}
//       {activeTab === 'announcements' && hasPerm('announcements') && <AdminAnnouncements token={token} setMessage={setMessage} />}
//     </div>
//   );
// }

// export default AdminDashboard;
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import '../styles/Admin.css';

import AdminStats from '../components/admin/AdminStats';
import AdminNews from '../components/admin/AdminNews';
import AdminGallery from '../components/admin/AdminGallery';
import AdminSettings from '../components/admin/AdminSettings';
import AdminUsers from '../components/admin/AdminUsers';
import AdminMenu from '../components/admin/AdminMenu';
import AdminPages from '../components/admin/AdminPages';
import AdminFileManager from '../components/admin/AdminFileManager';
import AdminPolls from '../components/admin/AdminPolls';
import AdminAnnouncements from '../components/admin/AdminAnnouncements';

function LoginForm({ setToken, message, setMessage }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    if (setMessage) setMessage('');

    try {
      const res = await axios.post('/api/login', { username, password });
      if (res.data.token) {
        localStorage.setItem('adminToken', res.data.token);
        window.dispatchEvent(new Event('authChange'));
        setToken(res.data.token);
        if (setMessage) setMessage('🎉 Успішний вхід!');
      }
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.response?.data?.message || 'Невірний логін або пароль';
      if (setMessage) setMessage(`❌ ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-card-container">
      <h2 className="login-card-title">🔑 Вхід в адмінпанель</h2>

      {message && <div className="admin-alert-error">{message}</div>}

      <form onSubmit={handleLogin}>
        <div className="form-group">
          <label className="form-label">Логін:</label>
          <input
            type="text"
            className="form-control"
            value={username}
            onChange={(e) => {
              setUsername(e.target.value);
              if (message && setMessage) setMessage('');
            }}
            placeholder="Введіть логін"
            required
          />
        </div>
        <div className="form-group">
          <label className="form-label">Пароль:</label>
          <input
            type="password"
            className="form-control"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (message && setMessage) setMessage('');
            }}
            placeholder="Введіть пароль"
            required
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="btn btn-primary btn-login-submit"
        >
          {loading ? 'Завантаження...' : 'Увійти'}
        </button>
      </form>
    </div>
  );
}

function AdminDashboard() {
  const [token, setToken] = useState(localStorage.getItem('adminToken') || '');
  const [activeTab, setActiveTab] = useState('stats');
  const [message, setMessage] = useState('');
  const [permissions, setPermissions] = useState([]);
  const [loadingPerms, setLoadingPerms] = useState(true);

  // Отримання актуальних прав із сервера
  const fetchCurrentPermissions = useCallback(async () => {
    if (!token) {
      setLoadingPerms(false);
      return;
    }

    try {
      const res = await axios.get('/api/me', {
        headers: { Authorization: `Bearer ${token}` }
      });

      let updatedPerms = res.data.role === 'admin'
        ? ['stats', 'news', 'gallery', 'pages', 'settings', 'users', 'menu', 'files', 'polls', 'announcements']
        : (res.data.permissions || []);

      if (!updatedPerms.includes('stats')) {
        updatedPerms.unshift('stats');
      }

      setPermissions(updatedPerms);
    } catch (err) {
      if (err.response?.status === 401 || err.response?.status === 403 || err.response?.status === 404) {
        localStorage.removeItem('adminToken');
        setToken('');
        window.dispatchEvent(new Event('authChange'));
      }
    } finally {
      setLoadingPerms(false);
    }
  }, [token]);

  useEffect(() => {
    fetchCurrentPermissions();

    const interval = setInterval(() => {
      fetchCurrentPermissions();
    }, 5000);

    const handleFocus = () => fetchCurrentPermissions();
    const handlePermsUpdated = () => fetchCurrentPermissions();

    window.addEventListener('focus', handleFocus);
    window.addEventListener('permissionsUpdated', handlePermsUpdated);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('permissionsUpdated', handlePermsUpdated);
    };
  }, [fetchCurrentPermissions]);

  useEffect(() => {
    if (permissions.length > 0 && !permissions.includes(activeTab)) {
      setActiveTab(permissions.includes('stats') ? 'stats' : permissions[0]);
    }
  }, [permissions, activeTab]);

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setMessage('');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  if (!token) {
    return (
      <div className="admin-page-wrapper">
        <LoginForm setToken={setToken} message={message} setMessage={setMessage} />
      </div>
    );
  }

  if (loadingPerms) {
    return (
      <div className="admin-page-wrapper text-center">
        <div className="admin-card">Синхронізація прав доступу...</div>
      </div>
    );
  }

  const hasPerm = (perm) => permissions.includes(perm);

  return (
    <div className="admin-page-wrapper">
      <div className="admin-header-row">
        <h1>⚙️ Панель управління</h1>
      </div>

      {message && <div className="admin-alert-message">{message}</div>}

      <div className="admin-tabs-nav">
        {hasPerm('stats') && (
          <button
            onClick={() => setActiveTab('stats')}
            className={`admin-tab-btn ${activeTab === 'stats' ? 'active' : ''}`}
          >
            📊 Головна
          </button>
        )}
        {hasPerm('news') && (
          <button
            onClick={() => setActiveTab('news')}
            className={`admin-tab-btn ${activeTab === 'news' ? 'active' : ''}`}
          >
            📰 Новини
          </button>
        )}
        {hasPerm('gallery') && (
          <button
            onClick={() => setActiveTab('gallery')}
            className={`admin-tab-btn ${activeTab === 'gallery' ? 'active' : ''}`}
          >
            📸 Фотогалерея
          </button>
        )}
        {hasPerm('pages') && (
          <button
            onClick={() => setActiveTab('pages')}
            className={`admin-tab-btn ${activeTab === 'pages' ? 'active' : ''}`}
          >
            📄 Сторінки
          </button>
        )}
        {hasPerm('settings') && (
          <button
            onClick={() => setActiveTab('settings')}
            className={`admin-tab-btn ${activeTab === 'settings' ? 'active' : ''}`}
          >
            ⚙️ Налаштування
          </button>
        )}
        {hasPerm('users') && (
          <button
            onClick={() => setActiveTab('users')}
            className={`admin-tab-btn ${activeTab === 'users' ? 'active' : ''}`}
          >
            👥 Користувачі та Ролі
          </button>
        )}
        {hasPerm('menu') && (
          <button
            onClick={() => setActiveTab('menu')}
            className={`admin-tab-btn ${activeTab === 'menu' ? 'active' : ''}`}
          >
            🌐 Головне меню
          </button>
        )}
        {hasPerm('files') && (
          <button
            onClick={() => setActiveTab('files')}
            className={`admin-tab-btn ${activeTab === 'files' ? 'active' : ''}`}
          >
            📁 Файловий менеджер
          </button>
        )}
        {hasPerm('polls') && (
          <button
            onClick={() => setActiveTab('polls')}
            className={`admin-tab-btn ${activeTab === 'polls' ? 'active' : ''}`}
          >
            📊 Опитування
          </button>
        )}
        {hasPerm('announcements') && (
          <button
            onClick={() => setActiveTab('announcements')}
            className={`admin-tab-btn ${activeTab === 'announcements' ? 'active' : ''}`}
          >
            📢 Оголошення
          </button>
        )}
      </div>  

      {activeTab === 'stats' && hasPerm('stats') && (
        <AdminStats 
          token={token} 
          userPermissions={permissions} 
          setMessage={setMessage} 
          setActiveTab={setActiveTab} 
        />
      )}
      {activeTab === 'news' && hasPerm('news') && <AdminNews token={token} setMessage={setMessage} />}
      {activeTab === 'gallery' && hasPerm('gallery') && <AdminGallery token={token} setMessage={setMessage} />}
      {activeTab === 'pages' && hasPerm('pages') && <AdminPages token={token} setMessage={setMessage} />}
      {activeTab === 'settings' && hasPerm('settings') && <AdminSettings token={token} setMessage={setMessage} />}
      {activeTab === 'users' && hasPerm('users') && <AdminUsers token={token} setMessage={setMessage} />}
      {activeTab === 'menu' && hasPerm('menu') && <AdminMenu token={token} setMessage={setMessage} />}
      {activeTab === 'files' && hasPerm('files') && <AdminFileManager token={token} setMessage={setMessage} />}
      {activeTab === 'polls' && hasPerm('polls') && <AdminPolls token={token} setMessage={setMessage} />}
      {activeTab === 'announcements' && hasPerm('announcements') && <AdminAnnouncements token={token} setMessage={setMessage} />}
    </div>
  );
}

export default AdminDashboard;