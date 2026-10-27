// import React from 'react';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ScrollToTop from './components/ScrollToTop';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import News from './pages/News';
import Gallery from './pages/Gallery';
import Admin from './pages/Admin';
import PageView from './pages/PageView';
import NewsDetail from './pages/NewsDetail'; 

function App() {
  const [siteSettings, setSiteSettings] = useState(null);

  useEffect(() => {
    // Отримуємо налаштування сайту з вашого API
    axios.get('/api/settings')
      .then(res => {
        if (res.data) {
          setSiteSettings(res.data);
          // 💡 Встановлюємо назву вкладки з бази даних або значення за замовчуванням
          const schoolName = res.data.school_name || 'Оженинський ліцей ім. Т.Г. Шевченка';
          document.title = schoolName;
        }
      })
      .catch(() => {
        document.title = 'Оженинський ліцей ім. Т.Г. Шевченка';
      });
  }, []);
 
  return (
    <Router>
      <ScrollToTop />
      <div className="app-wrapper">
        <Header />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/news" element={<News />} />
            <Route path="/gallery" element={<Gallery />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/page/:slug" element={<PageView />} />
            <Route path="/news/:id" element={<NewsDetail />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;