import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

import '../styles/Home.css';

import WhyUs from '../components/WhyUs';
import LifeGallery from '../components/LifeGallery';
import LatestNews from '../components/LatestNews';
import QuickAccess from '../components/QuickAccess';
import HeroBanner from '../components/HeroBanner';
import PollWidget from '../components/PollWidget';
import AnnouncementsWidget from '../components/AnnouncementWidget';

if (window.location.hostname === 'localhost') {
  axios.defaults.baseURL = '';
}

const getImageUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  const baseUrl = window.location.hostname === 'localhost' ? 'http://localhost:5000' : '';
  return `${baseUrl}${url.startsWith('/') ? '' : '/'}${url}`;
};

function Home() {
  const [latestNews, setLatestNews] = useState([]);
  const [randomPhotos, setRandomPhotos] = useState([]);
  const [settings, setSettings] = useState({
    hero_title: 'СУЧАСНА ОСВІТА ДЛЯ ВАШОЇ ДИТИНИ',
    hero_subtitle: 'Розкриваємо таланти, готуємо до успішного майбутнього',
    hero_banner_url: ''
  });

  const navigate = useNavigate();

  useEffect(() => {
    axios.get('/api/settings')
      .then(res => setSettings(prev => ({ ...prev, ...res.data })))
      .catch(err => console.error(err));

    axios.get('/api/news')
      .then(res => setLatestNews(res.data.slice(0, 3)))
      .catch(err => console.error(err));

    axios.get('/api/gallery/random')
      .then(res => setRandomPhotos(res.data.slice(0, 5)))
      .catch(err => console.error(err));
  }, []);

  const defaultHeroBg = "https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=1600&q=80";

  // 💡 Розкоментували об'єкт з фоном
  const heroBgStyle = {
    backgroundImage: `linear-gradient(rgba(15, 23, 42, 0.15), rgba(15, 23, 42, 0.25)), url(${settings.hero_banner_url ? getImageUrl(settings.hero_banner_url) : defaultHeroBg
      })`,
  };
  return (
    <div className="home-page">
      {/* 1. БАНЕР (Один виклик із пропсами) */}
      <HeroBanner settings={settings} heroBgStyle={heroBgStyle} defaultHeroBg={defaultHeroBg} />


      {/* 2. 4 ПЛАВАЮЧІ КАРТКИ ШВИДКОГО ДОСТУПУ */}
      <QuickAccess />
      <AnnouncementsWidget />
      <PollWidget />
      {/* 3. ЧОМУ ОБИРАЮТЬ НАС? */}
      <WhyUs />

      {/* 4. 5 ПЛИТОК ГАЛЕРЕЇ НА ГОЛОВНІЙ */}
      <LifeGallery />

      {/* 5. 3 ОСТАННІ НОВИНИ НА ГОЛОВНІЙ */}
      <LatestNews />
    </div>
  );
}

export default Home;