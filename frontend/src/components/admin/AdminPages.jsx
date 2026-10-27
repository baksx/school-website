import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Editor } from '@tinymce/tinymce-react';

const getImageUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  const baseUrl = window.location.hostname === 'localhost' ? 'http://localhost:5000' : '';
  return `${baseUrl}${url.startsWith('/') ? '' : '/'}${url}`;
};

function AdminPages({ token, setMessage }) {
  const [pages, setPages] = useState([]);
  const [selectedPage, setSelectedPage] = useState(null);
  const [formData, setFormData] = useState({ 
    title: '', 
    slug: '', 
    content: '', 
    is_published: true 
  });
  const [loading, setLoading] = useState(true);
  const editorRef = useRef(null);

  useEffect(() => {
    fetchPages();
  }, []);

  const fetchPages = () => {
    axios.get('/api/pages')
      .then(res => {
        setPages(res.data || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  const handleSelectPage = async (page) => {
    try {
      const res = await axios.get(`/api/pages/by-slug/${page.slug}`);
      const fullPage = res.data || page;
      
      setSelectedPage(fullPage);
      setFormData({
        title: fullPage.title || '',
        slug: fullPage.slug || '',
        content: fullPage.content || '',
        is_published: fullPage.is_published === 1 || fullPage.is_published === true
      });

      if (editorRef.current) {
        editorRef.current.setContent(fullPage.content || '');
      }
    } catch (err) {
      setSelectedPage(page);
      setFormData({
        title: page.title || '',
        slug: page.slug || '',
        content: page.content || '',
        is_published: page.is_published === 1 || page.is_published === true
      });

      if (editorRef.current) {
        editorRef.current.setContent(page.content || '');
      }
    }
  };

  const handleNewPage = () => {
    setSelectedPage(null);
    setFormData({ title: '', slug: '', content: '', is_published: true });
    if (editorRef.current) {
      editorRef.current.setContent('');
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();

    // Отримуємо актуальний HTML з редактора
    const contentFromEditor = editorRef.current ? editorRef.current.getContent() : formData.content;

    const payload = {
      ...formData,
      content: contentFromEditor
    };

    try {
      if (selectedPage) {
        await axios.put(`/api/pages/${selectedPage.id}`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (setMessage) setMessage('🎉 Сторінку успішно оновлено!');
      } else {
        await axios.post('/api/pages', payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (setMessage) setMessage('🎉 Нову сторінку створено!');
      }
      fetchPages();
      handleNewPage();
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.error || 'Помилка збереження сторінки';
      if (setMessage) setMessage(`❌ ${msg}`);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Ви дійсно бажаєте видалити цю сторінку?')) return;
    try {
      await axios.delete(`/api/pages/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (setMessage) setMessage('🗑️ Сторінку видалено');
      fetchPages();
      handleNewPage();
    } catch (err) {
      if (setMessage) setMessage('❌ Помилка видалення сторінки');
    }
  };

  if (loading) return <div style={{ padding: '20px', color: '#64748b' }}>⏳ Завантаження сторінок...</div>;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '20px', background: '#fff', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
      
      {/* ЛІВА КОЛОНКА — СПИСОК СТОРІНОК */}
      <div style={{ borderRight: '1px solid #e2e8f0', paddingRight: '16px' }}>
        <button
          type="button"
          onClick={handleNewPage}
          style={{ width: '100%', padding: '10px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', marginBottom: '16px' }}
        >
          ➕ Створити сторінку
        </button>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {pages.map(page => (
            <div
              key={page.id}
              onClick={() => handleSelectPage(page)}
              style={{
                padding: '10px 12px',
                borderRadius: '8px',
                background: selectedPage?.id === page.id ? '#eff6ff' : '#f8fafc',
                border: selectedPage?.id === page.id ? '1px solid #3b82f6' : '1px solid #cbd5e1',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <div style={{ fontWeight: 'bold', fontSize: '14px', color: '#0f172a' }}>{page.title}</div>
              <div style={{ fontSize: '12px', color: '#64748b' }}>/page/{page.slug}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ПРАВА КОЛОНКА — РЕДАКТОР TINYMCE */}
      <div>
        <h3 style={{ marginTop: 0, color: '#0f172a' }}>
          {selectedPage ? `✏️ Редагування: ${selectedPage.title}` : '📄 Створення нової сторінки'}
        </h3>
        
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '4px', fontSize: '13px' }}>Заголовок сторінки:</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={e => setFormData({ ...formData, title: e.target.value })}
                placeholder="Наприклад: Про школу"
                style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '4px', fontSize: '13px' }}>URL-адреса (Slug):</label>
              <input
                type="text"
                required
                value={formData.slug}
                onChange={e => setFormData({ ...formData, slug: e.target.value })}
                placeholder="about або contacts"
                style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
              />
            </div>
          </div>

          {/* ПОЛНОФУНКЦІОНАЛЬНИЙ TINYMCE */}
          <div>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '6px', fontSize: '13px' }}>Контент сторінки:</label>
            <Editor
              tinymceScriptSrc="https://cdn.jsdelivr.net/npm/tinymce@6/tinymce.min.js"
              onInit={(evt, editor) => editorRef.current = editor}
              initialValue={formData.content}
              init={{
                height: 500,
                menubar: 'file edit view insert format tools table help',
                plugins: [
                  'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
                  'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
                  'insertdatetime', 'media', 'table', 'help', 'wordcount', 'emoticons',
                  'codesample', 'directionality', 'nonbreaking', 'pagebreak', 'quickbars'
                ],
                toolbar: 'undo redo | blocks fontfamily fontsize | ' +
                  'bold italic underline strikethrough forecolor backcolor | ' +
                  'alignleft aligncenter alignright alignjustify | ' +
                  'bullist numlist outdent indent | table image media link charmap emoticons | ' +
                  'codesample hr pagebreak | removeformat | code fullscreen preview',
                
                quickbars_selection_toolbar: 'bold italic | quicklink h2 h3 blockquote',
                quickbars_insert_toolbar: 'quickimage quicktable media',
                
                image_advtab: true,
                image_title: true,
                image_caption: true,

                content_style: `
                  body { font-family: Helvetica, Arial, sans-serif; font-size: 15px; line-height: 1.6; padding: 10px; } 
                  img { max-width: 100%; height: auto; display: block; margin: 10px 0; }
                `,
                
                images_upload_handler: async (blobInfo) => {
                  const formDataUpload = new FormData();
                  formDataUpload.append('image', blobInfo.blob(), blobInfo.filename());
                  const res = await axios.post('/api/upload', formDataUpload, {
                    headers: { Authorization: `Bearer ${token}` }
                  });
                  return getImageUrl(res.data.imageUrl);
                }
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginTop: '12px' }}>
            <input
              type="checkbox"
              id="is_published"
              checked={formData.is_published}
              onChange={e => setFormData({ ...formData, is_published: e.target.checked })}
            />
            <label htmlFor="is_published" style={{ fontWeight: 'bold', fontSize: '14px', cursor: 'pointer' }}>Опублікувати сторінку на сайті</label>
          </div>

          <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
            <button
              type="submit"
              style={{ padding: '10px 24px', background: '#16a34a', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}
            >
              💾 Зберегти сторінку
            </button>
            {selectedPage && (
              <button
                type="button"
                onClick={() => handleDelete(selectedPage.id)}
                style={{ padding: '10px 16px', background: '#fee2e2', color: '#dc2626', border: '1px solid #fca5a5', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}
              >
                🗑️ Видалити
              </button>
            )}
          </div>

        </form>
      </div>

    </div>
  );
}

export default AdminPages;