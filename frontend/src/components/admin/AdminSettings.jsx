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
      <h2 style={{ marginBottom: '20px', color: '#0f172a' }}>⚙️ Основні налаштування та брендинг</h2>

      <form onSubmit={handleSaveSettings}>
        {/* ЛОГОТИП */}
        <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '12px', marginBottom: '24px', border: '1px solid #e2e8f0' }}>
          <h3 style={{ fontSize: '15px', marginBottom: '12px', color: '#0f172a' }}>🖼️ Логотип школи в шапці (Header)</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{ width: '80px', height: '80px', borderRadius: '12px', background: '#ffffff', border: '1px solid #cbd5e1', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
              {settings.school_logo_url ? (
                <img src={getImageUrl(settings.school_logo_url)} alt="Logo Preview" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
              ) : (
                <span style={{ fontSize: '11px', color: '#94a3b8', textAlign: 'center' }}>Немає логотипа</span>
              )}
            </div>
            <div>
              <input key={fileInputKey} type="file" accept="image/*" onChange={e => handleFileUpload(e, url => setSettings({ ...settings, school_logo_url: url }))} />
              <p style={{ fontSize: '12px', color: '#64748b', margin: '4px 0 0 0' }}>Рекомендовано PNG з прозорим фоном.</p>
            </div>
          </div>
        </div>

        {/* ДАНІ ШКОЛИ */}
        <div className="form-group">
          <label className="form-label">Назва школи / ліцею:</label>
          <input type="text" className="form-control" value={settings.school_name || ''} onChange={e => setSettings({ ...settings, school_name: e.target.value })} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div className="form-group">
            <label className="form-label">Телефон школи:</label>
            <input type="text" className="form-control" value={settings.school_phone || ''} onChange={e => setSettings({ ...settings, school_phone: e.target.value })} />
          </div>
          <div className="form-group">
            <label className="form-label">Адреса школи:</label>
            <input type="text" className="form-control" value={settings.school_address || ''} onChange={e => setSettings({ ...settings, school_address: e.target.value })} />
          </div>
        </div>

        <hr style={{ margin: '24px 0', border: 'none', borderTop: '1px solid #e2e8f0' }} />

        {/* БАНЕР */}
        <h3 style={{ fontSize: '16px', marginBottom: '16px', color: '#0f172a' }}>🎨 Привітальний банер (Hero Banner)</h3>
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
          <input key={`banner-${fileInputKey}`} type="file" accept="image/*" onChange={e => handleFileUpload(e, url => setSettings({ ...settings, hero_banner_url: url }))} style={{ display: 'block', marginBottom: '10px' }} />
          {settings.hero_banner_url && (
            <div style={{ height: '120px', borderRadius: '8px', overflow: 'hidden' }}>
              <img src={getImageUrl(settings.hero_banner_url)} alt="Banner Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          )}
        </div>

        <button type="submit" className="btn btn-primary" style={{ marginTop: '20px', padding: '12px 28px' }}>
          💾 Зберегти всі налаштування
        </button>
      </form>
    </div>
  );
}

export default AdminSettings;