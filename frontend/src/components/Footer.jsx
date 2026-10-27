import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/Footer.css';

function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-container">
        
        <div className="footer-grid">
          <div>
            <div className="footer-brand">
              <span style={{ fontSize: '28px' }}>🎓</span>
              <div>
                <h3 className="footer-brand-title">
                  Оженинський ліцей
                </h3>
                <span className="footer-brand-sub">ім. Т.Г. Шевченка</span>
              </div>
            </div>
            <p className="footer-desc">
              Сучасна освіта для вашої дитини. Розкриваємо таланти та готуємо до успішного майбутнього.
            </p>
            <div className="footer-socials">
              <a href="#" title="Facebook">🌐</a>
              <a href="#" title="Instagram">📷</a>
              <a href="#" title="YouTube">▶️</a>
              <a href="#" title="Telegram">✈️</a>
            </div>
          </div>

          <div>
            <h4 className="footer-col-title">
              Навігація
            </h4>
            <ul className="footer-links-list">
              <li><Link to="/news">Новини</Link></li>
              <li><Link to="/gallery">Галерея</Link></li>
              <li><Link to="/activity">Діяльність</Link></li>
              <li><Link to="/docs">Документація</Link></li>
              <li><Link to="/about">Про нас</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="footer-col-title">
              Важливі посилання
            </h4>
            <ul className="footer-links-list">
              <li><a href="#">📅 Розклад уроків</a></li>
              <li><a href="#">🍲 Меню їдальні</a></li>
              <li><a href="#">🎨 Гуртки та секції</a></li>
              <li><a href="#">💻 Електронний щоденник</a></li>
              <li><a href="#">📚 Дистанційне навчання</a></li>
            </ul>
          </div>

          <div>
            <h4 className="footer-col-title">
              Контакти
            </h4>
            <ul className="footer-contacts-list">
              <li className="footer-contact-item">
                <span>📍</span>
                <span>с. Оженин, Рівненська область</span>
              </li>
              <li className="footer-contact-item">
                <span>📞</span>
                <span>+380 (XX) XXX-XX-XX</span>
              </li>
              <li className="footer-contact-item">
                <span>✉️</span>
                <span>ozhenyn.lyceum@gmail.com</span>
              </li>
              <li className="footer-contact-item">
                <span>🕒</span>
                <span>Пн-Пт: 08:00 — 17:00</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom-bar">
          <div>
            © {new Date().getFullYear()} Оженинський ліцей ім. Т.Г. Шевченка. Всі права захищено.
          </div>
          <div>
            <Link to="/admin" className="footer-admin-link">⚙️ Вхід для адміністрації</Link>
          </div>
        </div>

      </div>
    </footer>
  );
}

export default Footer;