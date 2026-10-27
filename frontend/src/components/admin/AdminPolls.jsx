import React, { useState, useEffect } from 'react';
import axios from 'axios';

function AdminPolls({ token, setMessage }) {
  const [polls, setPolls] = useState([]);
  const [title, setTitle] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [expiresAt, setExpiresAt] = useState('');
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    loadPolls();
  }, []);

  const loadPolls = () => {
    // Передаємо ?all=true щоб бачити і неактивні опитування у адмінці
    axios.get('/api/polls?all=true')
      .then(res => setPolls(Array.isArray(res.data) ? res.data : []))
      .catch(console.error);
  };

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

          <div className="form-group" style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
            <div style={{ flex: 1 }}>
              <label className="form-label">Голосування діє до (необов’язково):</label>
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
                className="form-control"
                style={{ marginBottom: '8px' }}
                placeholder={`Варіант ${idx + 1}`}
                value={opt}
                onChange={e => handleOptionChange(idx, e.target.value)}
                required={idx < 2}
              />
            ))}
            <button
              type="button"
              className="btn btn-secondary"
              style={{ marginTop: '6px', fontSize: '12px' }}
              onClick={handleAddOptionField}
            >
              ➕ Додати варіант
            </button>
          </div>

          <button type="submit" className="btn btn-primary" style={{ marginTop: '12px' }}>
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
                <div key={poll.id} className="admin-album-item" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <strong className="admin-album-title" style={{ fontSize: '16px', marginRight: '10px' }}>{poll.title}</strong>
                      <span style={{ 
                        padding: '2px 8px', 
                        borderRadius: '4px', 
                        fontSize: '12px', 
                        backgroundColor: poll.is_active && !isExpired ? '#dcfce7' : '#fee2e2',
                        color: poll.is_active && !isExpired ? '#166534' : '#991b1b'
                      }}>
                        {!poll.is_active ? '🔴 Вимкнено' : (isExpired ? '⏳ Завершено' : '🟢 Активне')}
                      </span>
                    </div>

                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button 
                        className="btn btn-secondary" 
                        style={{ fontSize: '12px' }}
                        onClick={() => handleToggleActive(poll.id, poll.is_active)}
                      >
                        {poll.is_active ? 'Вимкнути' : 'Увімкнути'}
                      </button>
                      <button className="btn btn-danger" onClick={() => handleDeletePoll(poll.id)}>
                        🗑️ Видалити
                      </button>
                    </div>
                  </div>
                  <div style={{ marginTop: '8px', fontSize: '13px', color: '#64748b', display: 'flex', gap: '15px' }}>
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