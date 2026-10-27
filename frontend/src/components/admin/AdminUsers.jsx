import React, { useState, useEffect } from 'react';
import axios from 'axios';

function AdminUsers({ token, setMessage }) {
  const [users, setUsers] = useState([]);
  const [customRoles, setCustomRoles] = useState([]);
  const [allPermissions, setAllPermissions] = useState([]);
  
  // Форма користувача
  const [editingUserId, setEditingUserId] = useState(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState('custom');
  const [userPermissions, setUserPermissions] = useState(['stats', 'news']);

  // Форма ролі
  const [editingRoleId, setEditingRoleId] = useState(null);
  const [roleName, setRoleName] = useState('');
  const [rolePermissions, setRolePermissions] = useState(['news']);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const config = { headers: { Authorization: `Bearer ${token}` } };
    
    // Завантажуємо список усіх прав із бекенду
    axios.get('/api/users/permissions/list', config)
      .then(res => setAllPermissions(res.data || []))
      .catch(() => {});

    axios.get('/api/users', config)
      .then(res => setUsers(res.data))
      .catch(err => setMessage(err.response?.data?.message || 'Помилка завантаження користувачів'));

    axios.get('/api/users/roles', config)
      .then(res => setCustomRoles(res.data))
      .catch(() => {});
  };

  const toggleUserPerm = (permId) => {
    if (userPermissions.includes(permId)) {
      setUserPermissions(userPermissions.filter(id => id !== permId));
    } else {
      setUserPermissions([...userPermissions, permId]);
    }
  };

  const toggleRolePerm = (permId) => {
    if (rolePermissions.includes(permId)) {
      setRolePermissions(rolePermissions.filter(id => id !== permId));
    } else {
      setRolePermissions([...rolePermissions, permId]);
    }
  };

  const handleRoleSelect = (roleKey) => {
    setSelectedRole(roleKey);
    if (roleKey === 'admin') {
      setUserPermissions(allPermissions.map(p => p.id));
    } else if (roleKey === 'editor_news') {
      setUserPermissions(['stats', 'news']);
    } else if (roleKey === 'editor_gallery') {
      setUserPermissions(['stats', 'gallery']);
    } else {
      const found = customRoles.find(r => r.name === roleKey);
      if (found) {
        setUserPermissions(found.permissions || []);
      }
    }
  };

  const handleSaveUser = async (e) => {
    e.preventDefault();
    if (userPermissions.length === 0) {
      return setMessage('❌ Оберіть хоча б один дозвіл для користувача!');
    }

    const config = { headers: { Authorization: `Bearer ${token}` } };
    const payload = {
      username,
      password,
      role: selectedRole === 'admin' ? 'admin' : 'editor',
      permissions: userPermissions
    };

    try {
      if (editingUserId) {
        await axios.put(`/api/users/${editingUserId}`, payload, config);
        setMessage(`🎉 Дані користувача "${username}" оновлено!`);
      } else {
        await axios.post('/api/users', payload, config);
        setMessage('🎉 Нового користувача створено!');
      }

      handleCancelEditUser();
      loadData();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Помилка збереження користувача');
    }
  };

  const handleEditUserClick = (u) => {
    setEditingUserId(u.id);
    setUsername(u.username);
    setPassword('');
    setSelectedRole(u.role === 'admin' ? 'admin' : 'custom');
    setUserPermissions(u.permissions || []);
  };

  const handleCancelEditUser = () => {
    setEditingUserId(null);
    setUsername('');
    setPassword('');
    setSelectedRole('custom');
    setUserPermissions(['stats', 'news']);
  };

  const handleSaveRole = async (e) => {
    e.preventDefault();
    if (!roleName.trim()) return setMessage('❌ Введіть назву ролі');
    if (rolePermissions.length === 0) return setMessage('❌ Оберіть хоча б один дозвіл');

    const config = { headers: { Authorization: `Bearer ${token}` } };

    try {
      if (editingRoleId) {
        await axios.put(`/api/users/roles/${editingRoleId}`, {
          name: roleName.trim(),
          permissions: rolePermissions
        }, config);
        setMessage(`🎉 Роль "${roleName}" оновлено!`);
      } else {
        await axios.post('/api/users/roles', {
          name: roleName.trim(),
          permissions: rolePermissions
        }, config);
        setMessage(`🎉 Роль "${roleName}" створено!`);
      }

      handleCancelEditRole();
      loadData();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Помилка збереження ролі');
    }
  };

  const handleEditRoleClick = (role) => {
    setEditingRoleId(role.id);
    setRoleName(role.name);
    setRolePermissions(role.permissions || []);
  };

  const handleCancelEditRole = () => {
    setEditingRoleId(null);
    setRoleName('');
    setRolePermissions(['news']);
  };

  const handleDeleteUser = async (id, name) => {
    if (!window.confirm(`Видалити користувача "${name}"?`)) return;
    try {
      await axios.delete(`/api/users/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      setMessage('Користувача видалено');
      if (editingUserId === id) handleCancelEditUser();
      loadData();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Помилка видалення');
    }
  };

  const handleDeleteRole = async (id, name) => {
    if (!window.confirm(`Видалити роль "${name}"?`)) return;
    try {
      await axios.delete(`/api/users/roles/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      setMessage('Роль видалено');
      if (editingRoleId === id) handleCancelEditRole();
      loadData();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Помилка видалення ролі');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* 1. СТВОРЕННЯ / РЕДАГУВАННЯ КОРИСТУВАЧА */}
      <div style={{ background: '#fff', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 style={{ margin: 0, color: '#0f172a', fontSize: '20px' }}>
            {editingUserId ? '✏️ Редагувати користувача' : '👤 Створити нового користувача'}
          </h2>
          {editingUserId && (
            <button
              type="button"
              onClick={handleCancelEditUser}
              style={{ padding: '6px 12px', background: '#f1f5f9', color: '#64748b', border: '1px solid #cbd5e1', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold' }}
            >
              ✕ Скасувати
            </button>
          )}
        </div>

        <form onSubmit={handleSaveUser}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '20px' }}>
            <div>
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '6px', fontSize: '14px', color: '#334155' }}>Логін:</label>
              <input
                type="text"
                placeholder="Введіть логін"
                value={username}
                onChange={e => setUsername(e.target.value)}
                required
                style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '6px', fontSize: '14px', color: '#334155' }}>
                {editingUserId ? 'Новий пароль (необов\'язково):' : 'Пароль:'}
              </label>
              <input
                type="password"
                placeholder={editingUserId ? 'Залиште порожнім, щоб не змінювати' : 'Введіть пароль'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                required={!editingUserId}
                style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '6px', fontSize: '14px', color: '#334155' }}>Шаблон ролі:</label>
              <select
                value={selectedRole}
                onChange={e => handleRoleSelect(e.target.value)}
                style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box', background: '#fff' }}
              >
                <option value="custom">⚙️ Власне налаштування (Custom)</option>
                <option value="admin">⭐ Головний Адмін (Повний доступ)</option>
                <option value="editor_news">📰 Редактор новин</option>
                <option value="editor_gallery">📸 Редактор галереї</option>
                {customRoles.map(r => (
                  <option key={r.id} value={r.name}>✨ {r.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '10px', fontSize: '14px', color: '#334155' }}>
              Права доступу:
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
              {allPermissions.map(p => {
                const active = userPermissions.includes(p.id);
                return (
                  <label
                    key={p.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '10px 14px',
                      background: active ? '#eff6ff' : '#f8fafc',
                      border: active ? '1px solid #3b82f6' : '1px solid #e2e8f0',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontWeight: active ? 'bold' : 'normal',
                      color: active ? '#1d4ed8' : '#475569'
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={active}
                      onChange={() => {
                        setSelectedRole('custom');
                        toggleUserPerm(p.id);
                      }}
                      style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                    />
                    <span>{p.label}</span>
                  </label>
                );
              })}
            </div>
          </div>

          <button
            type="submit"
            style={{ padding: '12px 24px', background: editingUserId ? '#0284c7' : '#2563eb', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px' }}
          >
            {editingUserId ? '💾 Зберегти зміни користувача' : '➕ Створити користувача'}
          </button>
        </form>
      </div>

      {/* 2. КОНСТРУКТОР ТА СПИСОК РОЛЕЙ */}
      <div style={{ background: '#fff', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
          <h2 style={{ margin: 0, color: '#0f172a', fontSize: '20px' }}>
            {editingRoleId ? '✏️ Редагувати роль' : '⭐ Конструктор нових ролей'}
          </h2>
          {editingRoleId && (
            <button
              type="button"
              onClick={handleCancelEditRole}
              style={{ padding: '6px 12px', background: '#f1f5f9', color: '#64748b', border: '1px solid #cbd5e1', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold' }}
            >
              ✕ Скасувати
            </button>
          )}
        </div>

        <form onSubmit={handleSaveRole}>
          <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' }}>
            <input
              type="text"
              placeholder="Назва ролі (напр. 'Журналіст')"
              value={roleName}
              onChange={e => setRoleName(e.target.value)}
              required
              style={{ flex: '1', minWidth: '240px', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
            />
            <button
              type="submit"
              style={{ padding: '10px 22px', background: editingRoleId ? '#0284c7' : '#16a34a', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px' }}
            >
              {editingRoleId ? '💾 Зберегти зміни ролі' : '✨ Зберегти нову роль'}
            </button>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
              {allPermissions.map(p => {
                const active = rolePermissions.includes(p.id);
                return (
                  <label
                    key={p.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '10px 14px',
                      background: active ? '#f0fdf4' : '#f8fafc',
                      border: active ? '1px solid #22c55e' : '1px solid #e2e8f0',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontWeight: active ? 'bold' : 'normal',
                      color: active ? '#15803d' : '#475569'
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={active}
                      onChange={() => toggleRolePerm(p.id)}
                      style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                    />
                    <span>{p.label}</span>
                  </label>
                );
              })}
            </div>
          </div>
        </form>

        {customRoles.length > 0 && (
          <div style={{ marginTop: '24px', borderTop: '1px solid #f1f5f9', paddingTop: '16px' }}>
            <h4 style={{ margin: '0 0 12px 0', color: '#334155', fontSize: '15px' }}>Збережені кастомні ролі:</h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px' }}>
              {customRoles.map(r => (
                <div key={r.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: editingRoleId === r.id ? '#e0f2fe' : '#f8fafc', border: editingRoleId === r.id ? '1px solid #0284c7' : '1px solid #e2e8f0', padding: '12px 16px', borderRadius: '10px' }}>
                  <div>
                    <div style={{ fontWeight: 'bold', fontSize: '15px', color: '#0f172a' }}>✨ {r.name}</div>
                    <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
                      {Array.isArray(r.permissions) ? r.permissions.join(', ') : 'Немає'}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button type="button" onClick={() => handleEditRoleClick(r)} style={{ padding: '6px 10px', background: '#fff', border: '1px solid #cbd5e1', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' }}>✏️</button>
                    <button type="button" onClick={() => handleDeleteRole(r.id, r.name)} style={{ padding: '6px 10px', background: '#fee2e2', color: '#dc2626', border: '1px solid #fca5a5', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' }}>🗑️</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 3. СПИСОК КОРИСТУВАЧІВ */}
      <div style={{ background: '#fff', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
        <h2 style={{ marginTop: 0, color: '#0f172a', fontSize: '20px' }}>👥 Зареєстровані користувачі ({users.length})</h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
          {users.map(u => (
            <div key={u.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 18px', background: editingUserId === u.id ? '#e0f2fe' : '#f8fafc', border: editingUserId === u.id ? '1px solid #0284c7' : '1px solid #e2e8f0', borderRadius: '10px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <strong style={{ fontSize: '16px', color: '#0f172a' }}>{u.username}</strong>
                  {u.role === 'admin' ? (
                    <span style={{ background: '#ef4444', color: '#fff', padding: '2px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 'bold' }}>Суперадмін</span>
                  ) : (
                    <span style={{ background: '#0284c7', color: '#fff', padding: '2px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 'bold' }}>Редактор</span>
                  )}
                </div>

                <div style={{ fontSize: '13px', color: '#64748b', marginTop: '6px' }}>
                  <strong>Доступи:</strong> {u.role === 'admin' ? 'Повний доступ (Усі права)' : (Array.isArray(u.permissions) && u.permissions.length > 0 ? u.permissions.join(', ') : 'Немає прав')}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button type="button" onClick={() => handleEditUserClick(u)} style={{ padding: '8px 12px', background: '#fff', border: '1px solid #cbd5e1', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' }}>✏️ Редагувати</button>
                <button type="button" onClick={() => handleDeleteUser(u.id, u.username)} style={{ padding: '8px 12px', background: '#fee2e2', color: '#dc2626', border: '1px solid #fca5a5', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' }}>🗑️ Видалити</button>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}

export default AdminUsers;