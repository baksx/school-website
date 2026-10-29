import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

function AdminAnnouncements({ token, setMessage }) {
  const [items, setItems] = useState([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [isActive, setIsActive] = useState(true);

  // Отримання списку оголошень із токеном авторизації
  const loadItems = useCallback(async () => {
    try {
      const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
      const res = await axios.get('/api/announcements?all=true', config);
      setItems(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Помилка завантаження оголошень:', err);
      if (setMessage) setMessage('❌ Помилка завантаження оголошень');
    }
  }, [token, setMessage]);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        '/api/announcements',
        { title, content, expires_at: expiresAt || null, is_active: isActive },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTitle('');
      setContent('');
      setExpiresAt('');
      setIsActive(true);
      if (setMessage) setMessage(res.data.message || '📢 Оголошення опубліковано!');
      loadItems();
    } catch (err) {
      if (setMessage) setMessage('❌ Помилка створення оголошення');
    }
  };

  const handleToggleActive = async (id, currentStatus) => {
    try {
      await axios.patch(
        `/api/announcements/${id}/toggle-active`,
        { is_active: !currentStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      loadItems();
    } catch (err) {
      if (setMessage) setMessage('Помилка зміни статусу');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Видалити це оголошення?')) return;
    try {
      await axios.delete(`/api/announcements/${id}`, { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      if (setMessage) setMessage('Оголошення видалено!');
      loadItems();
    } catch (err) {
      if (setMessage) setMessage('Помилка видалення');
    }
  };

  return (
    <div>
      <div className="admin-card">
        <h2>📢 Створити нове оголошення</h2>
        <form onSubmit={handleCreate}>
          <div className="form-group">
            <label className="form-label">Заголовок оголошення:</label>
            <input
              type="text"
              className="form-control"
              placeholder="Наприклад: Шановні батьки! Батьківські збори..."
              value={title}
              onChange={e => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Текст оголошення:</label>
            <textarea
              className="form-control"
              rows="4"
              placeholder="Введіть текст оголошення..."
              value={content}
              onChange={e => setContent(e.target.value)}
              required
            />
          </div>

          <div className="form-group" style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
            <div style={{ flex: 1 }}>
              <label className="form-label">Дійсне до (необов’язково):</label>
              <input
                type="date"
                className="form-control"
                value={expiresAt}
                onChange={e => setExpiresAt(e.target.value)}
              />
            </div>
            
            <div style={{ marginTop: '22px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={e => setIsActive(e.target.checked)}
                />
                Оголошення активне
              </label>
            </div>
          </div>

          <button type="submit" className="btn btn-primary" style={{ marginTop: '12px' }}>
            🚀 Опублікувати оголошення
          </button>
        </form>
      </div>

      <div className="admin-card">
        <h3>📢 Усі оголошення ({items.length})</h3>
        <div className="admin-albums-list">
          {items.length > 0 ? (
            items.map(item => {
              const formattedExp = item.expires_at ? new Date(item.expires_at).toLocaleDateString('uk-UA') : 'Безстроково';
              const isExpired = item.expires_at && new Date() > new Date(item.expires_at);

              return (
                <div key={item.id} className="admin-album-item" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <strong className="admin-album-title" style={{ fontSize: '16px', marginRight: '10px' }}>{item.title}</strong>
                      <span style={{ 
                        padding: '2px 8px', 
                        borderRadius: '4px', 
                        fontSize: '12px', 
                        backgroundColor: item.is_active && !isExpired ? '#dcfce7' : '#fee2e2',
                        color: item.is_active && !isExpired ? '#166534' : '#991b1b'
                      }}>
                        {!item.is_active ? '🔴 Вимкнено' : (isExpired ? '⏳ Завершено' : '🟢 Активне')}
                      </span>
                    </div>

                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button 
                        className="btn btn-secondary" 
                        style={{ fontSize: '12px' }}
                        onClick={() => handleToggleActive(item.id, item.is_active)}
                      >
                        {item.is_active ? 'Вимкнути' : 'Увімкнути'}
                      </button>
                      <button className="btn btn-danger" onClick={() => handleDelete(item.id)}>
                        🗑️ Видалити
                      </button>
                    </div>
                  </div>
                  <p style={{ margin: '8px 0', fontSize: '14px', color: '#334155', whiteSpace: 'pre-wrap' }}>{item.content}</p>
                  <div style={{ fontSize: '12px', color: '#64748b' }}>
                    Дійсне до: <b>{formattedExp}</b>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="admin-news-empty">Оголошень поки немає.</div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminAnnouncements;