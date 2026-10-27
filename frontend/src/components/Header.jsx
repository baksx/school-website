import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/Header.css';

if (window.location.hostname === 'localhost') {
  axios.defaults.baseURL = 'http://localhost:5000';
}

const getImageUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  const baseUrl = window.location.hostname === 'localhost' ? 'http://localhost:5000' : '';
  return `${baseUrl}${url.startsWith('/') ? '' : '/'}${url}`;
};

// Перевірка наявності авторизації за всіма можливими ключами
const checkAuthToken = () => {
  return (
    localStorage.getItem('token') ||
    localStorage.getItem('adminToken') ||
    localStorage.getItem('user')
  );
};

function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  
  const [authToken, setAuthToken] = useState(checkAuthToken());
  const [settings, setSettings] = useState({
    school_name: 'Оженинський ліцей ім. Т.Г. Шевченка',
    school_logo_url: ''
  });
  const [menuItems, setMenuItems] = useState([]);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [isScrolled, setIsScrolled] = useState(false);

  // Оновлюємо стан авторизації при кожному переході між сторінками
  useEffect(() => {
    setAuthToken(checkAuthToken());
  }, [location]);

  // Слухаємо глобальні зміни в localStorage
  useEffect(() => {
    const handleStorageChange = () => {
      setAuthToken(checkAuthToken());
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('authChange', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('authChange', handleStorageChange);
    };
  }, []);

  // Відстежуємо скрол для прозорості шапки
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Завантаження налаштувань ліцею та меню
  useEffect(() => {
    axios.get('/api/settings')
      .then(res => setSettings(prev => ({ ...prev, ...res.data })))
      .catch(err => console.error(err));

    axios.get('/api/menu')
      .then(res => {
        const items = res.data || [];
        const parents = items
          .filter(i => i.parent_id === null || i.parent_id === undefined)
          .sort((a, b) => a.order_index - b.order_index);
        
        const tree = parents.map(parent => ({
          ...parent,
          subItems: items
            .filter(i => i.parent_id === parent.id)
            .sort((a, b) => a.order_index - b.order_index)
        }));

        setMenuItems(tree);
      })
      .catch(err => console.error(err));
  }, []);

  const isActive = (path) => {
    if (!path || path === '#') return false;
    if (path === '/' && location.pathname !== '/') return false;
    return location.pathname === path;
  };

  const handleAuthAction = () => {
    if (authToken) {
      // Очищаємо всі можливі ключі авторизації
      localStorage.removeItem('token');
      localStorage.removeItem('adminToken');
      localStorage.removeItem('user');
      setAuthToken(null);
      
      // Сповіщаємо додаток про вихід
      window.dispatchEvent(new Event('authChange'));
      navigate('/');
    } else {
      navigate('/admin');
    }
  };

  const schoolName = settings.school_name || 'Оженинський ліцей ім. Т.Г. Шевченка';
  const isHomePage = location.pathname === '/';

  const headerClass = `site-header ${
    isHomePage && !isScrolled ? 'header-transparent' : 'header-scrolled'
  }`;

  return (
    <header className={headerClass}>
      <div className="header-container">
        <Link to="/" className="header-logo-group">
          {settings.school_logo_url ? (
            <img
              src={getImageUrl(settings.school_logo_url)}
              alt="Логотип ліцею"
              className="header-custom-logo"
            />
          ) : (
            <div className="logo-icon-shield">
              <svg viewBox="0 0 36 40" width="38" height="42" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 2L4 8V18C4 26.5 10 34.3 18 37C26 34.3 32 26.5 32 18V8L18 2Z" fill="#0284c7" />
                <path d="M18 5L7 10V18C7 24.8 11.7 31 18 33.2C24.3 31 29 24.8 29 18V10L18 5Z" fill="#16a34a" />
                <path d="M18 9C13.6 9 10 12.6 10 17C10 22.5 18 28 18 28C18 28 26 22.5 26 17C26 12.6 22.4 9 18 9Z" fill="#ffffff" />
              </svg>
            </div>
          )}

          <div className="logo-text-box">
            <span className="logo-school-name">{schoolName}</span>
            <span className="logo-school-sub">СУЧАСНА ОСВІТА</span>
          </div>
        </Link>

        <nav className="header-nav">
          {menuItems.map((item) => {
            const hasSubs = item.subItems && item.subItems.length > 0;
            const active = isActive(item.link);

            return (
              <div 
                key={item.id || item.title} 
                className="nav-item-wrapper"
                onMouseEnter={() => hasSubs && setActiveDropdown(item.id)}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <Link 
                  to={item.link || '#'} 
                  className={`nav-link ${active ? 'active' : ''}`}
                >
                  {item.title}
                  {hasSubs && <span className="dropdown-arrow"> ▾</span>}
                </Link>

                {hasSubs && activeDropdown === item.id && (
                  <div className="header-dropdown-menu">
                    {item.subItems.map((sub) => (
                      <Link 
                        key={sub.id || sub.title} 
                        to={sub.link || '#'} 
                        className="header-dropdown-item"
                      >
                        {sub.title}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* КНОПКА ВХІД / ВИХІД */}
        <div className="header-actions">
          {authToken && (
            <Link to="/admin" className="btn-header-admin">
              ⚙️ АДМІНКА
            </Link>
          )}

          <button 
            onClick={handleAuthAction} 
            className={authToken ? 'btn-header-logout' : 'btn-header-login'}
          >
            {authToken ? 'ВИХІД' : 'ВХІД'}
          </button>
        </div>
      </div>
    </header>
  );
}

export default Header;