// import React, { useState, useEffect } from 'react';
// import axios from 'axios';

// function AdminUsers({ token, setMessage }) {
//   const [users, setUsers] = useState([]);
//   const [customRoles, setCustomRoles] = useState([]);
//   const [allPermissions, setAllPermissions] = useState([]);
  
//   const [editingUserId, setEditingUserId] = useState(null);
//   const [username, setUsername] = useState('');
//   const [password, setPassword] = useState('');
//   const [selectedRole, setSelectedRole] = useState('custom');
//   const [userPermissions, setUserPermissions] = useState(['stats', 'news']);

//   const [editingRoleId, setEditingRoleId] = useState(null);
//   const [roleName, setRoleName] = useState('');
//   const [rolePermissions, setRolePermissions] = useState(['news']);

//   useEffect(() => {
//     loadData();
//   }, []);

//   const loadData = () => {
//     const config = { headers: { Authorization: `Bearer ${token}` } };
    
//     axios.get('/api/users/permissions/list', config)
//       .then(res => setAllPermissions(res.data || []))
//       .catch(() => {});

//     axios.get('/api/users', config)
//       .then(res => setUsers(res.data))
//       .catch(err => setMessage(err.response?.data?.message || 'Помилка завантаження користувачів'));

//     axios.get('/api/users/roles', config)
//       .then(res => setCustomRoles(res.data))
//       .catch(() => {});
//   };

//   const toggleUserPerm = (permId) => {
//     if (userPermissions.includes(permId)) {
//       setUserPermissions(userPermissions.filter(id => id !== permId));
//     } else {
//       setUserPermissions([...userPermissions, permId]);
//     }
//   };

//   const toggleRolePerm = (permId) => {
//     if (rolePermissions.includes(permId)) {
//       setRolePermissions(rolePermissions.filter(id => id !== permId));
//     } else {
//       setRolePermissions([...rolePermissions, permId]);
//     }
//   };

//   const handleRoleSelect = (roleKey) => {
//     setSelectedRole(roleKey);
//     if (roleKey === 'admin') {
//       setUserPermissions(allPermissions.map(p => p.id));
//     } else if (roleKey === 'editor_news') {
//       setUserPermissions(['stats', 'news']);
//     } else if (roleKey === 'editor_gallery') {
//       setUserPermissions(['stats', 'gallery']);
//     } else {
//       const found = customRoles.find(r => r.name === roleKey);
//       if (found) {
//         setUserPermissions(found.permissions || []);
//       }
//     }
//   };

//   const handleSaveUser = async (e) => {
//     e.preventDefault();
//     if (userPermissions.length === 0) {
//       return setMessage('❌ Оберіть хоча б один дозвіл для користувача!');
//     }

//     const config = { headers: { Authorization: `Bearer ${token}` } };
//     const payload = {
//       username,
//       password,
//       role: selectedRole === 'admin' ? 'admin' : 'editor',
//       permissions: userPermissions
//     };

//     try {
//       if (editingUserId) {
//         await axios.put(`/api/users/${editingUserId}`, payload, config);
//         setMessage(`🎉 Дані користувача "${username}" оновлено!`);
//       } else {
//         await axios.post('/api/users', payload, config);
//         setMessage('🎉 Нового користувача створено!');
//       }

//       // 🔔 Сповіщаємо всі компоненти про оновлення прав у БД
//       window.dispatchEvent(new Event('permissionsUpdated'));

//       handleCancelEditUser();
//       loadData();
//     } catch (err) {
//       setMessage(err.response?.data?.message || 'Помилка збереження користувача');
//     }
//   };

//   const handleEditUserClick = (u) => {
//     setEditingUserId(u.id);
//     setUsername(u.username);
//     setPassword('');
//     setSelectedRole(u.role === 'admin' ? 'admin' : 'custom');
//     setUserPermissions(u.permissions || []);
//   };

//   const handleCancelEditUser = () => {
//     setEditingUserId(null);
//     setUsername('');
//     setPassword('');
//     setSelectedRole('custom');
//     setUserPermissions(['stats', 'news']);
//   };

//   const handleSaveRole = async (e) => {
//     e.preventDefault();
//     if (!roleName.trim()) return setMessage('❌ Введіть назву ролі');
//     if (rolePermissions.length === 0) return setMessage('❌ Оберіть хоча б один дозвіл');

//     const config = { headers: { Authorization: `Bearer ${token}` } };

//     try {
//       if (editingRoleId) {
//         await axios.put(`/api/users/roles/${editingRoleId}`, {
//           name: roleName.trim(),
//           permissions: rolePermissions
//         }, config);
//         setMessage(`🎉 Роль "${roleName}" оновлено!`);
//       } else {
//         await axios.post('/api/users/roles', {
//           name: roleName.trim(),
//           permissions: rolePermissions
//         }, config);
//         setMessage(`🎉 Роль "${roleName}" створено!`);
//       }

//       window.dispatchEvent(new Event('permissionsUpdated'));

//       handleCancelEditRole();
//       loadData();
//     } catch (err) {
//       setMessage(err.response?.data?.message || 'Помилка збереження ролі');
//     }
//   };

//   const handleEditRoleClick = (role) => {
//     setEditingRoleId(role.id);
//     setRoleName(role.name);
//     setRolePermissions(role.permissions || []);
//   };

//   const handleCancelEditRole = () => {
//     setEditingRoleId(null);
//     setRoleName('');
//     setRolePermissions(['news']);
//   };

//   const handleDeleteUser = async (id, name) => {
//     if (!window.confirm(`Видалити користувача "${name}"?`)) return;
//     try {
//       await axios.delete(`/api/users/${id}`, { headers: { Authorization: `Bearer ${token}` } });
//       setMessage('Користувача видалено');
//       window.dispatchEvent(new Event('permissionsUpdated'));
//       if (editingUserId === id) handleCancelEditUser();
//       loadData();
//     } catch (err) {
//       setMessage(err.response?.data?.message || 'Помилка видалення');
//     }
//   };

//   const handleDeleteRole = async (id, name) => {
//     if (!window.confirm(`Видалити роль "${name}"?`)) return;
//     try {
//       await axios.delete(`/api/users/roles/${id}`, { headers: { Authorization: `Bearer ${token}` } });
//       setMessage('Роль видалено');
//       window.dispatchEvent(new Event('permissionsUpdated'));
//       if (editingRoleId === id) handleCancelEditRole();
//       loadData();
//     } catch (err) {
//       setMessage(err.response?.data?.message || 'Помилка видалення ролі');
//     }
//   };

//   return (
//     <div className="admin-flex-col gap-24">
//       <div className="users-section-card">
//         <div className="admin-card-header-flex">
//           <h2>
//             {editingUserId ? '✏️ Редагувати користувача' : '👤 Створити нового користувача'}
//           </h2>
//           {editingUserId && (
//             <button
//               type="button"
//               onClick={handleCancelEditUser}
//               className="btn btn-secondary btn-sm-action"
//             >
//               ✕ Скасувати
//             </button>
//           )}
//         </div>

//         <form onSubmit={handleSaveUser}>
//           <div className="users-grid-form">
//             <div>
//               <label className="form-label">Логін:</label>
//               <input
//                 type="text"
//                 placeholder="Введіть логін"
//                 value={username}
//                 onChange={e => setUsername(e.target.value)}
//                 required
//                 className="form-control"
//               />
//             </div>

//             <div>
//               <label className="form-label">
//                 {editingUserId ? 'Новий пароль (необов\'язково):' : 'Пароль:'}
//               </label>
//               <input
//                 type="password"
//                 placeholder={editingUserId ? 'Залиште порожнім, щоб не змінювати' : 'Введіть пароль'}
//                 value={password}
//                 onChange={e => setPassword(e.target.value)}
//                 required={!editingUserId}
//                 className="form-control"
//               />
//             </div>

//             <div>
//               <label className="form-label">Шаблон ролі:</label>
//               <select
//                 value={selectedRole}
//                 onChange={e => handleRoleSelect(e.target.value)}
//                 className="form-control"
//               >
//                 <option value="custom">⚙️ Власне налаштування (Custom)</option>
//                 <option value="admin">⭐ Головний Адмін (Повний доступ)</option>
//                 <option value="editor_news">📰 Редактор новин</option>
//                 <option value="editor_gallery">📸 Редактор галереї</option>
//                 {customRoles.map(r => (
//                   <option key={r.id} value={r.name}>✨ {r.name}</option>
//                 ))}
//               </select>
//             </div>
//           </div>

//           <div className="margin-bottom-20">
//             <label className="form-label margin-bottom-10">
//               Права доступу:
//             </label>
//             <div className="users-permissions-grid">
//               {allPermissions.map(p => {
//                 const active = userPermissions.includes(p.id);
//                 return (
//                   <label
//                     key={p.id}
//                     className={`perm-checkbox-card ${active ? 'active-user' : ''}`}
//                   >
//                     <input
//                       type="checkbox"
//                       checked={active}
//                       onChange={() => {
//                         setSelectedRole('custom');
//                         toggleUserPerm(p.id);
//                       }}
//                       className="checkbox-custom"
//                     />
//                     <span>{p.label}</span>
//                   </label>
//                 );
//               })}
//             </div>
//           </div>

//           <button
//             type="submit"
//             className={`btn ${editingUserId ? 'btn-info-custom' : 'btn-primary'} padding-12-24`}
//           >
//             {editingUserId ? '💾 Зберегти зміни користувача' : '➕ Створити користувача'}
//           </button>
//         </form>
//       </div>

//       <div className="users-section-card">
//         <div className="admin-card-header-flex margin-bottom-6">
//           <h2>
//             {editingRoleId ? '✏️ Редагувати роль' : '⭐ Конструктор нових ролей'}
//           </h2>
//           {editingRoleId && (
//             <button
//               type="button"
//               onClick={handleCancelEditRole}
//               className="btn btn-secondary btn-sm-action"
//             >
//               ✕ Скасувати
//             </button>
//           )}
//         </div>

//         <form onSubmit={handleSaveRole}>
//           <div className="admin-flex-row-gap margin-bottom-16 flex-wrap">
//             <input
//               type="text"
//               placeholder="Назва ролі (напр. 'Журналіст')"
//               value={roleName}
//               onChange={e => setRoleName(e.target.value)}
//               required
//               className="form-control admin-flex-1 min-width-240"
//             />
//             <button
//               type="submit"
//               className={`btn ${editingRoleId ? 'btn-info-custom' : 'btn-success'} padding-10-22`}
//             >
//               {editingRoleId ? '💾 Зберегти зміни ролі' : '✨ Зберегти нову роль'}
//             </button>
//           </div>

//           <div className="margin-bottom-20">
//             <div className="users-permissions-grid">
//               {allPermissions.map(p => {
//                 const active = rolePermissions.includes(p.id);
//                 return (
//                   <label
//                     key={p.id}
//                     className={`perm-checkbox-card ${active ? 'active-role' : ''}`}
//                   >
//                     <input
//                       type="checkbox"
//                       checked={active}
//                       onChange={() => toggleRolePerm(p.id)}
//                       className="checkbox-custom"
//                     />
//                     <span>{p.label}</span>
//                   </label>
//                 );
//               })}
//             </div>
//           </div>
//         </form>

//         {customRoles.length > 0 && (
//           <div className="margin-top-24 border-top-slate padding-top-16">
//             <h4 className="settings-section-title font-size-15 margin-bottom-12">Збережені кастомні ролі:</h4>
//             <div className="users-permissions-grid">
//               {customRoles.map(r => (
//                 <div key={r.id} className={`role-item-box ${editingRoleId === r.id ? 'editing' : ''}`}>
//                   <div>
//                     <div className="pages-item-title">✨ {r.name}</div>
//                     <div className="admin-text-subtle font-size-12 margin-top-4">
//                       {Array.isArray(r.permissions) ? r.permissions.join(', ') : 'Немає'}
//                     </div>
//                   </div>
//                   <div className="admin-flex-row-gap gap-6">
//                     <button type="button" onClick={() => handleEditRoleClick(r)} className="btn btn-secondary btn-sm-action">✏️</button>
//                     <button type="button" onClick={() => handleDeleteRole(r.id, r.name)} className="btn btn-danger btn-sm-action">🗑️</button>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>
//         )}
//       </div>

//       <div className="users-section-card">
//         <h2>👥 Зареєстровані користувачі ({users.length})</h2>

//         <div className="admin-flex-col gap-12 margin-top-16">
//           {users.map(u => (
//             <div key={u.id} className={`user-item-box ${editingUserId === u.id ? 'editing' : ''}`}>
//               <div>
//                 <div className="admin-flex-row-gap align-center gap-10">
//                   <strong className="pages-item-title font-size-16">{u.username}</strong>
//                   {u.role === 'admin' ? (
//                     <span className="badge-role-admin">Суперадмін</span>
//                   ) : (
//                     <span className="badge-role-editor">Редактор</span>
//                   )}
//                 </div>

//                 <div className="admin-text-subtle font-size-13 margin-top-6">
//                   <strong>Доступи:</strong> {u.role === 'admin' ? 'Повний доступ (Усі права)' : (Array.isArray(u.permissions) && u.permissions.length > 0 ? u.permissions.join(', ') : 'Немає прав')}
//                 </div>
//               </div>

//               <div className="admin-flex-row-gap gap-8">
//                 <button type="button" onClick={() => handleEditUserClick(u)} className="btn btn-secondary btn-sm-action font-weight-bold">✏️ Редагувати</button>
//                 <button type="button" onClick={() => handleDeleteUser(u.id, u.username)} className="btn btn-danger btn-sm-action font-weight-bold">🗑️ Видалити</button>
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// }

// export default AdminUsers;
import React, { useState, useEffect } from 'react';
import axios from 'axios';

function AdminUsers({ token, setMessage }) {
  const [users, setUsers] = useState([]);
  const [customRoles, setCustomRoles] = useState([]);
  const [allPermissions, setAllPermissions] = useState([]);
  
  const [editingUserId, setEditingUserId] = useState(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState('custom');
  const [userPermissions, setUserPermissions] = useState(['stats', 'news']);

  const [editingRoleId, setEditingRoleId] = useState(null);
  const [roleName, setRoleName] = useState('');
  const [rolePermissions, setRolePermissions] = useState(['news']);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const config = { headers: { Authorization: `Bearer ${token}` } };
    
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
      role: selectedRole, // Передаємо обрану роль
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

      window.dispatchEvent(new Event('permissionsUpdated'));

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
    setSelectedRole(u.role || 'custom');
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

      window.dispatchEvent(new Event('permissionsUpdated'));

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
      window.dispatchEvent(new Event('permissionsUpdated'));
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
      window.dispatchEvent(new Event('permissionsUpdated'));
      if (editingRoleId === id) handleCancelEditRole();
      loadData();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Помилка видалення ролі');
    }
  };

  return (
    <div className="admin-flex-col gap-24">
      <div className="users-section-card">
        <div className="admin-card-header-flex">
          <h2>
            {editingUserId ? '✏️ Редагувати користувача' : '👤 Створити нового користувача'}
          </h2>
          {editingUserId && (
            <button
              type="button"
              onClick={handleCancelEditUser}
              className="btn btn-secondary btn-sm-action"
            >
              ✕ Скасувати
            </button>
          )}
        </div>

        <form onSubmit={handleSaveUser}>
          <div className="users-grid-form">
            <div>
              <label className="form-label">Логін:</label>
              <input
                type="text"
                placeholder="Введіть логін"
                value={username}
                onChange={e => setUsername(e.target.value)}
                required
                className="form-control"
              />
            </div>

            <div>
              <label className="form-label">
                {editingUserId ? 'Новий пароль (необов\'язково):' : 'Пароль:'}
              </label>
              <input
                type="password"
                placeholder={editingUserId ? 'Залиште порожнім, щоб не змінювати' : 'Введіть пароль'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                required={!editingUserId}
                className="form-control"
              />
            </div>

            <div>
              <label className="form-label">Шаблон ролі:</label>
              <select
                value={selectedRole}
                onChange={e => handleRoleSelect(e.target.value)}
                className="form-control"
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

          <div className="margin-bottom-20">
            <label className="form-label margin-bottom-10">
              Права доступу:
            </label>
            <div className="users-permissions-grid">
              {allPermissions.map(p => {
                const active = userPermissions.includes(p.id);
                return (
                  <label
                    key={p.id}
                    className={`perm-checkbox-card ${active ? 'active-user' : ''}`}
                  >
                    <input
                      type="checkbox"
                      checked={active}
                      onChange={() => {
                        setSelectedRole('custom');
                        toggleUserPerm(p.id);
                      }}
                      className="checkbox-custom"
                    />
                    <span>{p.label}</span>
                  </label>
                );
              })}
            </div>
          </div>

          <button
            type="submit"
            className={`btn ${editingUserId ? 'btn-info-custom' : 'btn-primary'} padding-12-24`}
          >
            {editingUserId ? '💾 Зберегти зміни користувача' : '➕ Створити користувача'}
          </button>
        </form>
      </div>

      <div className="users-section-card">
        <div className="admin-card-header-flex margin-bottom-6">
          <h2>
            {editingRoleId ? '✏️ Редагувати роль' : '⭐ Конструктор нових ролей'}
          </h2>
          {editingRoleId && (
            <button
              type="button"
              onClick={handleCancelEditRole}
              className="btn btn-secondary btn-sm-action"
            >
              ✕ Скасувати
            </button>
          )}
        </div>

        <form onSubmit={handleSaveRole}>
          <div className="admin-flex-row-gap margin-bottom-16 flex-wrap">
            <input
              type="text"
              placeholder="Назва ролі (напр. 'Вчитель')"
              value={roleName}
              onChange={e => setRoleName(e.target.value)}
              required
              className="form-control admin-flex-1 min-width-240"
            />
            <button
              type="submit"
              className={`btn ${editingRoleId ? 'btn-info-custom' : 'btn-success'} padding-10-22`}
            >
              {editingRoleId ? '💾 Зберегти зміни ролі' : '✨ Зберегти нову роль'}
            </button>
          </div>

          <div className="margin-bottom-20">
            <div className="users-permissions-grid">
              {allPermissions.map(p => {
                const active = rolePermissions.includes(p.id);
                return (
                  <label
                    key={p.id}
                    className={`perm-checkbox-card ${active ? 'active-role' : ''}`}
                  >
                    <input
                      type="checkbox"
                      checked={active}
                      onChange={() => toggleRolePerm(p.id)}
                      className="checkbox-custom"
                    />
                    <span>{p.label}</span>
                  </label>
                );
              })}
            </div>
          </div>
        </form>

        {customRoles.length > 0 && (
          <div className="margin-top-24 border-top-slate padding-top-16">
            <h4 className="settings-section-title font-size-15 margin-bottom-12">Збережені кастомні ролі:</h4>
            <div className="users-permissions-grid">
              {customRoles.map(r => (
                <div key={r.id} className={`role-item-box ${editingRoleId === r.id ? 'editing' : ''}`}>
                  <div>
                    <div className="pages-item-title">✨ {r.name}</div>
                    <div className="admin-text-subtle font-size-12 margin-top-4">
                      {Array.isArray(r.permissions) ? r.permissions.join(', ') : 'Немає'}
                    </div>
                  </div>
                  <div className="admin-flex-row-gap gap-6">
                    <button type="button" onClick={() => handleEditRoleClick(r)} className="btn btn-secondary btn-sm-action">✏️</button>
                    <button type="button" onClick={() => handleDeleteRole(r.id, r.name)} className="btn btn-danger btn-sm-action">🗑️</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="users-section-card">
        <h2>👥 Зареєстровані користувачі ({users.length})</h2>

        <div className="admin-flex-col gap-12 margin-top-16">
          {users.map(u => (
            <div key={u.id} className={`user-item-box ${editingUserId === u.id ? 'editing' : ''}`}>
              <div>
                <div className="admin-flex-row-gap align-center gap-10">
                  <strong className="pages-item-title font-size-16">{u.username}</strong>
                  {u.role === 'admin' ? (
                    <span className="badge-role-admin">Суперадмін</span>
                  ) : (
                    <span className="badge-role-editor">
                      {u.role && u.role !== 'editor' && u.role !== 'custom' ? u.role : 'Редактор'}
                    </span>
                  )}
                </div>

                <div className="admin-text-subtle font-size-13 margin-top-6">
                  <strong>Доступи:</strong> {u.role === 'admin' ? 'Повний доступ (Усі права)' : (Array.isArray(u.permissions) && u.permissions.length > 0 ? u.permissions.join(', ') : 'Немає прав')}
                </div>
              </div>

              <div className="admin-flex-row-gap gap-8">
                <button type="button" onClick={() => handleEditUserClick(u)} className="btn btn-secondary btn-sm-action font-weight-bold">✏️ Редагувати</button>
                <button type="button" onClick={() => handleDeleteUser(u.id, u.username)} className="btn btn-danger btn-sm-action font-weight-bold">🗑️ Видалити</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default AdminUsers;