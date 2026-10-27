import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../../styles/Admin.css';

function AdminMenu({ token, setMessage }) {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMenu();
  }, []);

  const fetchMenu = () => {
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
        setLoading(false);
      })
      .catch(() => {
        if (setMessage) setMessage('❌ Помилка завантаження меню');
        setLoading(false);
      });
  };

  const handleSave = async () => {
    try {
      const res = await axios.post('/api/menu', menuItems, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (setMessage) setMessage(res.data.message || '🎉 Порядок та структуру меню оновлено!');
      fetchMenu();
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.response?.data?.message || 'Помилка збереження';
      if (setMessage) setMessage(`❌ ${errorMsg}`);
    }
  };

  const addMainItem = () => {
    setMenuItems([...menuItems, { title: 'Новий пункт', link: '/', subItems: [] }]);
  };

  const addSubItem = (parentIndex) => {
    const updated = [...menuItems];
    if (!updated[parentIndex].subItems) updated[parentIndex].subItems = [];
    updated[parentIndex].subItems.push({ title: 'Підпункт', link: '/' });
    setMenuItems(updated);
  };

  const updateItem = (index, field, value) => {
    const updated = [...menuItems];
    updated[index][field] = value;
    setMenuItems(updated);
  };

  const updateSubItem = (pIndex, sIndex, field, value) => {
    const updated = [...menuItems];
    updated[pIndex].subItems[sIndex][field] = value;
    setMenuItems(updated);
  };

  const removeItem = (index) => {
    const updated = [...menuItems];
    updated.splice(index, 1);
    setMenuItems(updated);
  };

  const removeSubItem = (pIndex, sIndex) => {
    const updated = [...menuItems];
    updated[pIndex].subItems.splice(sIndex, 1);
    setMenuItems(updated);
  };

  const moveItemUp = (index) => {
    if (index === 0) return;
    const updated = [...menuItems];
    const temp = updated[index];
    updated[index] = updated[index - 1];
    updated[index - 1] = temp;
    setMenuItems(updated);
  };

  const moveItemDown = (index) => {
    if (index === menuItems.length - 1) return;
    const updated = [...menuItems];
    const temp = updated[index];
    updated[index] = updated[index + 1];
    updated[index + 1] = temp;
    setMenuItems(updated);
  };

  const moveSubItemUp = (pIndex, sIndex) => {
    if (sIndex === 0) return;
    const updated = [...menuItems];
    const subs = updated[pIndex].subItems;
    const temp = subs[sIndex];
    subs[sIndex] = subs[sIndex - 1];
    subs[sIndex - 1] = temp;
    setMenuItems(updated);
  };

  const moveSubItemDown = (pIndex, sIndex) => {
    const updated = [...menuItems];
    const subs = updated[pIndex].subItems;
    if (sIndex === subs.length - 1) return;
    const temp = subs[sIndex];
    subs[sIndex] = subs[sIndex + 1];
    subs[sIndex + 1] = temp;
    setMenuItems(updated);
  };

  if (loading) return <div style={{ padding: '20px', color: '#64748b' }}>⏳ Завантаження меню...</div>;

  return (
    <div className="admin-card">
      <h2>🌐 Редактор Головного Меню</h2>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {menuItems.map((item, pIndex) => (
          <div key={pIndex} style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #cbd5e1' }}>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <button
                  type="button"
                  onClick={() => moveItemUp(pIndex)}
                  disabled={pIndex === 0}
                  className="btn btn-secondary"
                  style={{ padding: '2px 6px', fontSize: '10px' }}
                >
                  ▲
                </button>
                <button
                  type="button"
                  onClick={() => moveItemDown(pIndex)}
                  disabled={pIndex === menuItems.length - 1}
                  className="btn btn-secondary"
                  style={{ padding: '2px 6px', fontSize: '10px' }}
                >
                  ▼
                </button>
              </div>

              <input
                type="text"
                className="form-control"
                value={item.title}
                onChange={e => updateItem(pIndex, 'title', e.target.value)}
                placeholder="Назва (напр. Про школу)"
                style={{ flex: 1, minWidth: '160px' }}
              />
              <input
                type="text"
                className="form-control"
                value={item.link}
                onChange={e => updateItem(pIndex, 'link', e.target.value)}
                placeholder="Посилання (напр. /about)"
                style={{ flex: 1, minWidth: '160px' }}
              />
              <button
                type="button"
                onClick={() => addSubItem(pIndex)}
                className="btn btn-primary"
              >
                + Підменю
              </button>
              <button
                type="button"
                onClick={() => removeItem(pIndex)}
                className="btn btn-danger"
              >
                🗑️
              </button>
            </div>

            {item.subItems && item.subItems.length > 0 && (
              <div style={{ marginLeft: '36px', marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px', borderLeft: '3px solid #cbd5e1', paddingLeft: '16px' }}>
                {item.subItems.map((sub, sIndex) => (
                  <div key={sIndex} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      <button
                        type="button"
                        onClick={() => moveSubItemUp(pIndex, sIndex)}
                        disabled={sIndex === 0}
                        className="btn btn-secondary"
                        style={{ padding: '1px 5px', fontSize: '9px' }}
                      >
                        ▲
                      </button>
                      <button
                        type="button"
                        onClick={() => moveSubItemDown(pIndex, sIndex)}
                        disabled={sIndex === item.subItems.length - 1}
                        className="btn btn-secondary"
                        style={{ padding: '1px 5px', fontSize: '9px' }}
                      >
                        ▼
                      </button>
                    </div>

                    <span style={{ color: '#94a3b8', fontWeight: 'bold' }}>↳</span>
                    <input
                      type="text"
                      className="form-control"
                      value={sub.title}
                      onChange={e => updateSubItem(pIndex, sIndex, 'title', e.target.value)}
                      placeholder="Назва підпункту"
                      style={{ flex: 1 }}
                    />
                    <input
                      type="text"
                      className="form-control"
                      value={sub.link}
                      onChange={e => updateSubItem(pIndex, sIndex, 'link', e.target.value)}
                      placeholder="Посилання"
                      style={{ flex: 1 }}
                    />
                    <button
                      type="button"
                      onClick={() => removeSubItem(pIndex, sIndex)}
                      className="btn btn-danger"
                      style={{ padding: '6px 10px' }}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <div style={{ marginTop: '20px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
        <button
          type="button"
          onClick={addMainItem}
          className="btn btn-secondary"
        >
          ➕ Додати пункт меню
        </button>
        <button
          type="button"
          onClick={handleSave}
          className="btn btn-success"
        >
          💾 Зберегти структуру меню
        </button>
      </div>
    </div>
  );
}

export default AdminMenu;