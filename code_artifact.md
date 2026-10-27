import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

// Автоматичне налаштування базової адреси для бекенду
if (window.location.hostname === 'localhost') {
axios.defaults.baseURL = 'http://localhost:5000';
}

function Admin() {
const \[token, setToken\] = useState(localStorage.getItem('token') || '');
const \[username, setUsername\] = useState('');
const \[password, setPassword\] = useState('');
const \[error, setError\] = useState('');

// Нова вкладка за замовчуванням - 'dashboard'
const \[activeTab, setActiveTab\] = useState('dashboard');

// --- СТАНИ ДЛЯ НОВИН ---
const \[title, setTitle\] = useState('');
const \[content, setContent\] = useState('');
const \[newsImageFile, setNewsImageFile\] = useState(null);
const \[existingImageUrl, setExistingImageUrl\] = useState('');
const \[editingNewsId, setEditingNewsId\] = useState(null);
const \[news, setNews\] = useState(\[\]);

// --- СТАНИ ДЛЯ ГАЛЕРЕЇ ---
const \[galleryTitle, setGalleryTitle\] = useState('');
const \[galleryImageFile, setGalleryImageFile\] = useState(null);
const \[gallery, setGallery\] = useState(\[\]);

const \[isUploading, setIsUploading\] = useState(false);

useEffect(() => {
if (token) {
fetchNews();
fetchGallery();
}
}, \[token\]);

const fetchNews = () => {
axios.get('/api/news')
.then(res => setNews(res.data))
.catch(err => console.error(err));
};

const fetchGallery = () => {
axios.get('/api/gallery')
.then(res => setGallery(res.data))
.catch(err => console.error(err));
};

const handleLogin = (e) => {
e.preventDefault();
axios.post('/api/login', { username, password })
.then(res => {
setToken(res.data.token);
localStorage.setItem('token', res.data.token);
setError('');
})
.catch(() => setError('Невірний логін або пароль'));
};

const handleLogout = () => {
setToken('');
localStorage.removeItem('token');
};

const uploadFile = async (file) => {
if (!file) return '';
const formData = new FormData();
formData.append('image', file);
const res = await axios.post('/api/upload', formData, {
headers: { 'Content-Type': 'multipart/form-data' }
});
return res.data.imageUrl;
};

// --- ФУНКЦІЇ ДЛЯ НОВИН ---
const resetNewsForm = () => {
setEditingNewsId(null);
setTitle('');
setContent('');
setNewsImageFile(null);
setExistingImageUrl('');
};

const handleEditClick = (item) => {
setActiveTab('news');
setEditingNewsId(item.id);
setTitle(item.title);
setContent(item.content);
setExistingImageUrl(item.image_url);
setNewsImageFile(null);
window.scrollTo({ top: 0, behavior: 'smooth' });
};

const handleSubmitNews = async (e) => {
e.preventDefault();
if (!content || content === '

') {
alert('Будь ласка, введіть текст новини');
return;
}

```
setIsUploading(true);
try {
  let finalImageUrl = existingImageUrl;
  if (newsImageFile) {
    finalImageUrl = await uploadFile(newsImageFile);
  }

  if (editingNewsId) {
    await axios.put(`/api/news/${editingNewsId}`, { 
      title, content, image_url: finalImageUrl 
    });
  } else {
    await axios.post('/api/news', { 
      title, content, image_url: finalImageUrl 
    });
  }

  resetNewsForm(); 
  fetchNews(); 
} catch (err) {
  console.error('Помилка збереження новини:', err);
} finally {
  setIsUploading(false);
}

```

};

const handleDeleteNews = (id) => {
if (window.confirm('Видалити цю новину?')) {
axios.delete(`/api/news/${id}`)
.then(() => fetchNews())
.catch(err => console.error(err));
}
};

// --- ФУНКЦІЇ ДЛЯ ГАЛЕРЕЇ ---
const handleAddGalleryPhoto = async (e) => {
e.preventDefault();
if (!galleryImageFile) {
alert('Будь ласка, виберіть фото');
return;
}
setIsUploading(true);
try {
const imageUrl = await uploadFile(galleryImageFile);
await axios.post('/api/gallery', { title: galleryTitle, image_url: imageUrl });
setGalleryTitle('');
setGalleryImageFile(null);
e.target.reset();
fetchGallery();
} catch (err) {
console.error('Помилка додавання фото:', err);
} finally {
setIsUploading(false);
}
};

const handleDeleteGalleryPhoto = (id) => {
if (window.confirm('Видалити це фото з галереї?')) {
axios.delete(`/api/gallery/${id}`)
.then(() => fetchGallery())
.catch(err => console.error(err));
}
};

// --- ЕКРАН ВХОДУ ---
if (!token) {
return (
<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#f4f6f9' }}>
<div style={{ width: '400px', padding: '40px', background: '#fff', borderRadius: '8px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}>
<h2 style={{ textAlign: 'center', marginBottom: '25px', color: '#1e293b' }}>Вхід в Адмін-панель
{error && <p style={{ color: '#ef4444', textAlign: 'center', marginBottom: '15px' }}>{error}}
<form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
<input type="text" placeholder="Логін" value={username} onChange={e => setUsername(e.target.value)} style={{ padding: '12px', borderRadius: '4px', border: '1px solid #ced4da' }} required />
<input type="password" placeholder="Пароль" value={password} onChange={e => setPassword(e.target.value)} style={{ padding: '12px', borderRadius: '4px', border: '1px solid #ced4da' }} required />
<button type="submit" style={{ padding: '12px', background: '#007bff', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Увійти



);
}

// --- СТИЛІ ІНТЕРФЕЙСУ ---
const sidebarStyle = {
width: '250px',
background: '#222d32',
color: '#b8c7ce',
display: 'flex',
flexDirection: 'column',
height: '100vh',
position: 'fixed',
left: 0,
top: 0
};

const mainContentStyle = {
marginLeft: '250px',
background: '#ecf0f5',
minHeight: '100vh',
display: 'flex',
flexDirection: 'column'
};

const getMenuItemStyle = (tabName) => ({
display: 'flex',
alignItems: 'center',
padding: '15px 20px',
background: activeTab === tabName ? '#1e282c' : 'transparent',
color: activeTab === tabName ? '#ffffff' : '#b8c7ce',
borderLeft: activeTab === tabName ? '4px solid #3c8dbc' : '4px solid transparent',
cursor: 'pointer',
transition: '0.2s',
fontWeight: '500',
fontSize: '15px'
});

const statCardStyle = (bgColor) => ({
background: bgColor,
color: '#fff',
borderRadius: '4px',
padding: '20px',
flex: '1',
boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)',
position: 'relative',
overflow: 'hidden'
});

return (
<div style={{ display: 'flex', fontFamily: '"Segoe UI", Roboto, Helvetica, Arial, sans-serif' }}>

```
  {/* ⬅️ БОКОВЕ МЕНЮ (Sidebar) */}
  <aside style={sidebarStyle}>
    <div style={{ background: '#367fa9', color: '#fff', padding: '15px 20px', fontSize: '20px', fontWeight: 'bold', textAlign: 'center', letterSpacing: '1px' }}>
      SchoolAdmin
    </div>
    
    <div style={{ padding: '15px', display: 'flex', alignItems: 'center', gap: '10px', borderBottom: '1px solid #1a2226' }}>
      <div style={{ width: '40px', height: '40px', background: '#3c8dbc', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#fff', fontWeight: 'bold' }}>A</div>
      <div>
        <div style={{ color: '#fff', fontWeight: 'bold', fontSize: '14px' }}>Адміністратор</div>
        <div style={{ color: '#28a745', fontSize: '12px' }}>● Online</div>
      </div>
    </div>

    <div style={{ padding: '10px 20px', fontSize: '12px', background: '#1a2226', color: '#4b646f', textTransform: 'uppercase' }}>
      Головне меню
    </div>

    <nav style={{ flex: 1 }}>
      <div onClick={() => setActiveTab('dashboard')} style={getMenuItemStyle('dashboard')}>
        <span style={{ marginRight: '10px' }}>🏠</span> Home Dashboard
      </div>
      <div onClick={() => { setActiveTab('news'); resetNewsForm(); }} style={getMenuItemStyle('news')}>
        <span style={{ marginRight: '10px' }}>📰</span> Content (Новини)
      </div>
      <div onClick={() => setActiveTab('gallery')} style={getMenuItemStyle('gallery')}>
        <span style={{ marginRight: '10px' }}>🖼️</span> Media (Галерея)
      </div>
    </nav>

    <div onClick={handleLogout} style={{ ...getMenuItemStyle('logout'), borderTop: '1px solid #1a2226', color: '#dd4b39' }}>
      <span style={{ marginRight: '10px' }}>🚪</span> Вийти
    </div>
  </aside>

  {/* ➡️ ГОЛОВНИЙ КОНТЕНТ */}
  <main style={mainContentStyle}>
    
    {/* Верхня панель (Navbar) */}
    <header style={{ background: '#fff', padding: '15px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', zIndex: 10 }}>
      <h1 style={{ fontSize: '20px', margin: 0, color: '#333' }}>
        {activeTab === 'dashboard' && '🏠 Home Dashboard'}
        {activeTab === 'news' && '📰 Управління новинами'}
        {activeTab === 'gallery' && '🖼️ Управління галереєю'}
      </h1>
      <div>
        <a href="/" target="_blank" style={{ color: '#3c8dbc', textDecoration: 'none', fontWeight: 'bold' }}>Перейти на сайт ↗</a>
      </div>
    </header>

    {/* Робоча область */}
    <div style={{ padding: '20px' }}>

      {/* ===================== DASHBOARD ===================== */}
      {activeTab === 'dashboard' && (
        <div>
          {/* Картки статистики */}
          <div style={{ display: 'flex', gap: '20px', marginBottom: '30px' }}>
            <div style={statCardStyle('#00a65a')}>
              <div style={{ fontSize: '38px', fontWeight: 'bold' }}>{news.length}</div>
              <div style={{ fontSize: '15px', marginTop: '5px' }}>Опублікованих новин</div>
            </div>
            <div style={statCardStyle('#00c0ef')}>
              <div style={{ fontSize: '38px', fontWeight: 'bold' }}>1</div>
              <div style={{ fontSize: '15px', marginTop: '5px' }}>Користувачів системи</div>
            </div>
            <div style={statCardStyle('#f39c12')}>
              <div style={{ fontSize: '38px', fontWeight: 'bold' }}>{gallery.length}</div>
              <div style={{ fontSize: '15px', marginTop: '5px' }}>Фотографій у галереї</div>
            </div>
          </div>

          {/* Нижні блоки (Останні новини) */}
          <div style={{ display: 'flex', gap: '20px' }}>
            <div style={{ flex: 1, background: '#fff', borderRadius: '3px', borderTop: '3px solid #3c8dbc', boxShadow: '0 1px 1px rgba(0,0,0,0.1)' }}>
              <div style={{ padding: '10px', borderBottom: '1px solid #f4f4f4', fontWeight: 'bold', color: '#444' }}>
                Останні додані новини
              </div>
              <div style={{ padding: '10px' }}>
                {news.length === 0 ? <p style={{ color: '#999' }}>Немає новин.</p> : (
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                    <thead>
                      <tr style={{ background: '#f9f9f9', textAlign: 'left' }}>
                        <th style={{ padding: '8px', borderBottom: '1px solid #ddd' }}>Заголовок</th>
                        <th style={{ padding: '8px', borderBottom: '1px solid #ddd', width: '100px' }}>Дія</th>
                      </tr>
                    </thead>
                    <tbody>
                      {news.slice(0, 5).map(item => (
                        <tr key={item.id}>
                          <td style={{ padding: '8px', borderBottom: '1px solid #f4f4f4', color: '#333' }}>{item.title}</td>
                          <td style={{ padding: '8px', borderBottom: '1px solid #f4f4f4' }}>
                            <button onClick={() => handleEditClick(item)} style={{ background: 'transparent', border: 'none', color: '#3c8dbc', cursor: 'pointer', padding: 0 }}>Редагувати</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===================== НОВИНИ ===================== */}
      {activeTab === 'news' && (
        <div style={{ background: '#fff', padding: '20px', borderRadius: '3px', borderTop: '3px solid #00a65a', boxShadow: '0 1px 1px rgba(0,0,0,0.1)' }}>
          
          <h3 style={{ marginBottom: '15px', color: '#444' }}>
            {editingNewsId ? '✏️ Редагування новини' : '➕ Створити нову статтю'}
          </h3>
          
          <form onSubmit={handleSubmitNews} style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '40px', paddingBottom: '20px', borderBottom: '1px solid #eee' }}>
            <input type="text" placeholder="Заголовок статті" value={title} onChange={e => setTitle(e.target.value)} style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc', width: '100%' }} required />
            
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', color: '#666' }}>Обкладинка (фото):</label>
              <input type="file" accept="image/*" onChange={e => setNewsImageFile(e.target.files[0])} style={{ padding: '5px' }} />
              {editingNewsId && existingImageUrl && !newsImageFile && (
                <div style={{ marginTop: '10px', fontSize: '13px', color: '#666' }}>
                  Поточне фото: <img src={existingImageUrl} alt="Current" style={{ height: '30px', verticalAlign: 'middle', marginLeft: '10px' }} />
                </div>
              )}
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', color: '#666' }}>Текст статті:</label>
              <div style={{ marginBottom: '45px' }}>
                <ReactQuill theme="snow" value={content} onChange={setContent} style={{ height: '250px' }} />
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '10px' }}>
              <button type="submit" style={{ padding: '10px 20px', background: '#00a65a', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }} disabled={isUploading}>
                {isUploading ? 'Збереження...' : (editingNewsId ? 'Зберегти зміни' : 'Опублікувати')}
              </button>
              {editingNewsId && (
                <button type="button" onClick={resetNewsForm} style={{ padding: '10px 20px', background: '#f4f4f4', color: '#333', border: '1px solid #ddd', borderRadius: '4px', cursor: 'pointer' }}>Скасувати</button>
              )}
            </div>
          </form>

          <h3 style={{ marginBottom: '15px', color: '#444' }}>Список статей</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
            <thead>
              <tr style={{ background: '#f9f9f9', textAlign: 'left' }}>
                <th style={{ padding: '10px', borderBottom: '2px solid #ddd', width: '60px' }}>Фото</th>
                <th style={{ padding: '10px', borderBottom: '2px solid #ddd' }}>Заголовок</th>
                <th style={{ padding: '10px', borderBottom: '2px solid #ddd', width: '150px' }}>Дії</th>
              </tr>
            </thead>
            <tbody>
              {news.map(item => (
                <tr key={item.id} style={{ borderBottom: '1px solid #f4f4f4' }}>
                  <td style={{ padding: '10px' }}>
                    {item.image_url ? <img src={item.image_url} alt="" style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '3px' }} /> : <div style={{ width: '50px', height: '50px', background: '#eee', borderRadius: '3px' }}></div>}
                  </td>
                  <td style={{ padding: '10px', color: '#333', fontWeight: '500' }}>{item.title}</td>
                  <td style={{ padding: '10px' }}>
                    <button onClick={() => handleEditClick(item)} style={{ background: '#3c8dbc', color: '#fff', border: 'none', padding: '5px 10px', borderRadius: '3px', cursor: 'pointer', marginRight: '5px' }}>✎</button>
                    <button onClick={() => handleDeleteNews(item.id)} style={{ background: '#dd4b39', color: '#fff', border: 'none', padding: '5px 10px', borderRadius: '3px', cursor: 'pointer' }}>✖</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ===================== ГАЛЕРЕЯ ===================== */}
      {activeTab === 'gallery' && (
        <div style={{ background: '#fff', padding: '20px', borderRadius: '3px', borderTop: '3px solid #f39c12', boxShadow: '0 1px 1px rgba(0,0,0,0.1)' }}>
          
          <h3 style={{ marginBottom: '15px', color: '#444' }}>Завантажити нове фото</h3>
          <form onSubmit={handleAddGalleryPhoto} style={{ display: 'flex', gap: '15px', alignItems: 'center', marginBottom: '30px', paddingBottom: '20px', borderBottom: '1px solid #eee' }}>
            <input type="text" placeholder="Підпис до фото" value={galleryTitle} onChange={e => setGalleryTitle(e.target.value)} style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc', flex: 1 }} required />
            <input type="file" accept="image/*" onChange={e => setGalleryImageFile(e.target.files[0])} style={{ padding: '5px' }} required />
            <button type="submit" style={{ padding: '10px 20px', background: '#f39c12', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }} disabled={isUploading}>
              {isUploading ? 'Завантаження...' : 'Додати'}
            </button>
          </form>

          <h3 style={{ marginBottom: '15px', color: '#444' }}>Медіафайли</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '15px' }}>
            {gallery.map(item => (
              <div key={item.id} style={{ border: '1px solid #ddd', padding: '5px', borderRadius: '3px', textAlign: 'center', background: '#f9f9f9' }}>
                <img src={item.image_url} alt={item.title} style={{ width: '100%', height: '120px', objectFit: 'cover' }} />
                <div style={{ fontSize: '13px', margin: '8px 0', color: '#555', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.title}</div>
                <button onClick={() => handleDeleteGalleryPhoto(item.id)} style={{ background: '#dd4b39', color: '#fff', border: 'none', padding: '4px 8px', borderRadius: '2px', cursor: 'pointer', fontSize: '12px', width: '100%' }}>Видалити</button>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  </main>
</div>

```

);
}

export default Admin;