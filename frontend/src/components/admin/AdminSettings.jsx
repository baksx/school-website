import React, { useState, useEffect } from 'react';
import axios from 'axios';

const getImageUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  const baseUrl = window.location.hostname === 'localhost' ? 'http://localhost:5000' : '';
  return `${baseUrl}${url.startsWith('/') ? '' : '/'}${url}`;
};

function AdminSettings({ token, setMessage }) {
  const [settings, setSettings] = useState({
    school_name: '',
    school_phone: '',
    school_address: '',
    hero_title: '',
    hero_subtitle: '',
    hero_banner_url: '',
    school_logo_url: ''
  });
  const [fileInputKey, setFileInputKey] = useState(Date.now());

  useEffect(() => {
    axios.get('/api/settings')
      .then(res => setSettings(prev => ({ ...prev, ...res.data })))
      .catch(console.error);
  }, []);

  const handleFileUpload = async (e, callback) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    try {
      const res = await axios.post('/api/upload', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      callback(res.data.imageUrl);
      setMessage('Файл успішно завантажено!');
    } catch (err) {
      setMessage('Помилка завантаження файла');
    }
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/settings', settings, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessage('Налаштування успішно збережено!');
      setTimeout(() => window.location.reload(), 800);
    } catch (err) {
      setMessage('Помилка збереження налаштувань');
    }
  };

  return (
    <div className="admin-card">
      <h2 className="margin-bottom-20">⚙️ Основні налаштування та брендинг</h2>

      <form onSubmit={handleSaveSettings}>
        <div className="settings-logo-box">
          <h3 className="settings-section-title">🖼️ Логотип школи в шапці (Header)</h3>
          <div className="admin-flex-row-gap-20">
            <div className="settings-logo-preview-wrapper">
              {settings.school_logo_url ? (
                <img src={getImageUrl(settings.school_logo_url)} alt="Logo Preview" className="settings-logo-img" />
              ) : (
                <span className="admin-text-subtle font-size-11 text-center">Немає логотипа</span>
              )}
            </div>
            <div>
              <input key={fileInputKey} type="file" accept="image/*" onChange={e => handleFileUpload(e, url => setSettings({ ...settings, school_logo_url: url }))} />
              <p className="admin-text-subtle font-size-12 margin-top-4 margin-0">Рекомендовано PNG з прозорим фоном.</p>
            </div>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Назва школи / ліцею:</label>
          <input type="text" className="form-control" value={settings.school_name || ''} onChange={e => setSettings({ ...settings, school_name: e.target.value })} />
        </div>

        <div className="form-group-grid-2">
          <div className="form-group">
            <label className="form-label">Телефон школи:</label>
            <input type="text" className="form-control" value={settings.school_phone || ''} onChange={e => setSettings({ ...settings, school_phone: e.target.value })} />
          </div>
          <div className="form-group">
            <label className="form-label">Адреса школи:</label>
            <input type="text" className="form-control" value={settings.school_address || ''} onChange={e => setSettings({ ...settings, school_address: e.target.value })} />
          </div>
        </div>

        <hr className="divider-hr" />

        <h3 className="settings-section-title font-size-16">🎨 Привітальний банер (Hero Banner)</h3>
        <div className="form-group">
          <label className="form-label">Заголовок банера:</label>
          <input type="text" className="form-control" value={settings.hero_title || ''} onChange={e => setSettings({ ...settings, hero_title: e.target.value })} />
        </div>
        <div className="form-group">
          <label className="form-label">Підзаголовок банера:</label>
          <input type="text" className="form-control" value={settings.hero_subtitle || ''} onChange={e => setSettings({ ...settings, hero_subtitle: e.target.value })} />
        </div>
        <div className="form-group">
          <label className="form-label">Фонове зображення банера:</label>
          <input key={`banner-${fileInputKey}`} type="file" accept="image/*" onChange={e => handleFileUpload(e, url => setSettings({ ...settings, hero_banner_url: url }))} className="display-block margin-bottom-10" />
          {settings.hero_banner_url && (
            <div className="settings-banner-preview">
              <img src={getImageUrl(settings.hero_banner_url)} alt="Banner Preview" className="settings-banner-img" />
            </div>
          )}
        </div>

        <button type="submit" className="btn btn-primary margin-top-20 padding-12-28">
          💾 Зберегти всі налаштування
        </button>
      </form>
    </div>
  );
}

export default AdminSettings;