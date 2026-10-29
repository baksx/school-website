import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

function AdminPolls({ token, setMessage }) {
  const [polls, setPolls] = useState([]);
  const [title, setTitle] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [expiresAt, setExpiresAt] = useState('');
  const [isActive, setIsActive] = useState(true);

  // Отримання списку опитувань із токеном авторизації
  const loadPolls = useCallback(async () => {
    try {
      const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
      const res = await axios.get('/api/polls?all=true', config);
      setPolls(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Помилка завантаження опитувань:', err);
      if (setMessage) setMessage('❌ Помилка завантаження опитувань');
    }
  }, [token, setMessage]);

  useEffect(() => {
    loadPolls();
  }, [loadPolls]);

  const handleAddOptionField = () => setOptions([...options, '']);

  const handleOptionChange = (index, value) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleCreatePoll = async (e) => {
    e.preventDefault();
    const validOptions = options.filter(o => o.trim() !== '');
    if (validOptions.length < 2) {
      if (setMessage) setMessage('⚠️ Заповніть мінімум 2 варіанти відповіді!');
      return;
    }

    try {
      const res = await axios.post(
        '/api/polls',
        { title, options: validOptions, expires_at: expiresAt || null, is_active: isActive },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTitle('');
      setOptions(['', '']);
      setExpiresAt('');
      setIsActive(true);
      if (setMessage) setMessage(res.data.message || '🎉 Опитування створено!');
      loadPolls();
    } catch (err) {
      if (setMessage) setMessage('❌ Помилка створення опитування');
    }
  };

  const handleToggleActive = async (id, currentStatus) => {
    try {
      await axios.patch(
        `/api/polls/${id}/toggle-active`,
        { is_active: !currentStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      loadPolls();
    } catch (err) {
      if (setMessage) setMessage('Помилка зміни статусу');
    }
  };

  const handleDeletePoll = async (id) => {
    if (!window.confirm('Видалити це опитування?')) return;
    try {
      await axios.delete(`/api/polls/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      if (setMessage) setMessage('Опитування видалено!');
      loadPolls();
    } catch (err) {
      if (setMessage) setMessage('Помилка видалення');
    }
  };

  return (
    <div>
      <div className="admin-card">
        <h2>📊 Створити нове опитування</h2>
        <form onSubmit={handleCreatePoll}>
          <div className="form-group">
            <label className="form-label">Тема опитування:</label>
            <input
              type="text"
              className="form-control"
              placeholder="Введіть тему опитування..."
              value={title}
              onChange={e => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="form-group admin-flex-row-gap-20">
            <div className="admin-flex-1">
              <label className="form-label">Голосування діє до (необов’язково):</label>
              <input
                type="date"
                className="form-control"
                value={expiresAt}
                onChange={e => setExpiresAt(e.target.value)}
              />
            </div>
            
            <div className="admin-margin-top-22">
              <label className="admin-checkbox-label">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={e => setIsActive(e.target.checked)}
                />
                Опитування активне
              </label>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Варіанти відповідей:</label>
            {options.map((opt, idx) => (
              <input
                key={idx}
                type="text"
                className="form-control margin-bottom-8"
                placeholder={`Варіант ${idx + 1}`}
                value={opt}
                onChange={e => handleOptionChange(idx, e.target.value)}
                required={idx < 2}
              />
            ))}
            <button
              type="button"
              className="btn btn-secondary btn-sm-action margin-top-6"
              onClick={handleAddOptionField}
            >
              ➕ Додати варіант
            </button>
          </div>

          <button type="submit" className="btn btn-primary margin-top-12">
            🚀 Опублікувати опитування
          </button>
        </form>
      </div>

      <div className="admin-card">
        <h3>📊 Усі опитування ({polls.length})</h3>
        <div className="admin-albums-list">
          {polls.length > 0 ? (
            polls.map(poll => {
              const totalVotes = poll.options?.reduce((sum, o) => sum + o.votes, 0) || 0;
              const formattedExp = poll.expires_at ? new Date(poll.expires_at).toLocaleDateString('uk-UA') : 'Безстроково';
              const isExpired = poll.expires_at && new Date() > new Date(poll.expires_at);

              return (
                <div key={poll.id} className="admin-album-item announcement-item-card">
                  <div className="announcement-item-header">
                    <div>
                      <strong className="admin-album-title announcement-title">{poll.title}</strong>
                      <span className={`announcement-badge ${poll.is_active && !isExpired ? 'badge-active' : 'badge-inactive'}`}>
                        {!poll.is_active ? '🔴 Вимкнено' : (isExpired ? '⏳ Завершено' : '🟢 Активне')}
                      </span>
                    </div>

                    <div className="admin-flex-row-gap">
                      <button 
                        className="btn btn-secondary btn-sm-action" 
                        onClick={() => handleToggleActive(poll.id, poll.is_active)}
                      >
                        {poll.is_active ? 'Вимкнути' : 'Увімкнути'}
                      </button>
                      <button className="btn btn-danger" onClick={() => handleDeletePoll(poll.id)}>
                        🗑️ Видалити
                      </button>
                    </div>
                  </div>
                  <div className="admin-flex-row-gap margin-top-8 font-size-13 admin-text-subtle gap-15">
                    <span>Голосів: <b>{totalVotes}</b></span>
                    <span>Дійсне до: <b>{formattedExp}</b></span>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="admin-news-empty">Опитувань поки немає.</div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminPolls;