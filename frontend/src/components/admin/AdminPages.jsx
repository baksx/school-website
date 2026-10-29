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

  if (loading) return <div className="admin-text-subtle padding-20">⏳ Завантаження сторінок...</div>;

  return (
    <div className="pages-layout-grid">
      <div className="pages-sidebar">
        <button
          type="button"
          onClick={handleNewPage}
          className="pages-new-btn"
        >
          ➕ Створити сторінку
        </button>

        <div className="pages-list">
          {pages.map(page => (
            <div
              key={page.id}
              onClick={() => handleSelectPage(page)}
              className={`pages-list-item ${selectedPage?.id === page.id ? 'selected' : ''}`}
            >
              <div className="pages-item-title">{page.title}</div>
              <div className="pages-item-slug">/page/{page.slug}</div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3>
          {selectedPage ? `✏️ Редагування: ${selectedPage.title}` : '📄 Створення нової сторінки'}
        </h3>
        
        <form onSubmit={handleSave} className="admin-flex-col gap-16">
          <div className="form-group-grid-2-sm">
            <div>
              <label className="pages-editor-label">Заголовок сторінки:</label>
              <input
                type="text"
                required
                className="form-control"
                value={formData.title}
                onChange={e => setFormData({ ...formData, title: e.target.value })}
                placeholder="Наприклад: Про школу"
              />
            </div>

            <div>
              <label className="pages-editor-label">URL-адреса (Slug):</label>
              <input
                type="text"
                required
                className="form-control"
                value={formData.slug}
                onChange={e => setFormData({ ...formData, slug: e.target.value })}
                placeholder="about або contacts"
              />
            </div>
          </div>

          <div>
            <label className="pages-editor-label margin-bottom-6">Контент сторінки:</label>
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

          <div className="admin-flex-row-gap margin-top-12 align-center">
            <input
              type="checkbox"
              id="is_published"
              checked={formData.is_published}
              onChange={e => setFormData({ ...formData, is_published: e.target.checked })}
            />
            <label htmlFor="is_published" className="admin-checkbox-label">Опублікувати сторінку на сайті</label>
          </div>

          <div className="pages-actions-row">
            <button
              type="submit"
              className="btn-save-page"
            >
              💾 Зберегти сторінку
            </button>
            {selectedPage && (
              <button
                type="button"
                onClick={() => handleDelete(selectedPage.id)}
                className="btn-delete-page"
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