import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Editor } from '@tinymce/tinymce-react';

const getImageUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  const baseUrl = window.location.hostname === 'localhost' ? 'http://localhost:5000' : '';
  return `${baseUrl}${url.startsWith('/') ? '' : '/'}${url}`;
};

const formatDateForInput = (dateString) => {
  if (!dateString) return '';
  if (typeof dateString === 'string' && dateString.length >= 10) {
    return dateString.substring(0, 10);
  }
  return '';
};

const MONTH_NAMES = [
  'Січень', 'Лютий', 'Березень', 'Квітень', 'Травень', 'Червень',
  'Липень', 'Серпень', 'Вересень', 'Жовтень', 'Листопад', 'Грудень'
];

function AdminNews({ token, setMessage }) {
  const [newsList, setNewsList] = useState([]);
  const [newsForm, setNewsForm] = useState({ id: null, title: '', content: '', image_url: '', date: '' });
  const [fileInputKey, setFileInputKey] = useState(Date.now());
  const editorRef = useRef(null);

  const [selectedYear, setSelectedYear] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  useEffect(() => {
    loadNews();
  }, []);

  const loadNews = () => {
    axios.get('/api/news').then(res => setNewsList(res.data)).catch(console.error);
  };

  const resetNewsForm = () => {
    setNewsForm({ id: null, title: '', content: '', image_url: '', date: '' });
    setFileInputKey(Date.now());
    if (editorRef.current) {
      editorRef.current.setContent('');
    }
  };

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
      if (setMessage) setMessage('Зображення успішно завантажено!');
    } catch (err) {
      if (setMessage) setMessage('Помилка завантаження файла');
    }
  };

  const handleSaveNews = async (e) => {
    e.preventDefault();
    
    const contentFromEditor = editorRef.current ? editorRef.current.getContent() : newsForm.content;

    const payload = {
      title: newsForm.title,
      content: contentFromEditor,
      image_url: newsForm.image_url,
      date: newsForm.date,
      created_at: newsForm.date
    };

    try {
      if (newsForm.id) {
        await axios.put(`/api/news/${newsForm.id}`, payload, { headers: { Authorization: `Bearer ${token}` } });
        if (setMessage) setMessage('🎉 Новину успішно оновлено!');
      } else {
        await axios.post('/api/news', payload, { headers: { Authorization: `Bearer ${token}` } });
        if (setMessage) setMessage('🎉 Новину успішно створено!');
      }
      resetNewsForm();
      loadNews();
    } catch (err) {
      if (setMessage) setMessage('❌ Помилка збереження новини');
    }
  };

  const handleEditNews = (item) => {
    const rawDate = item.date || item.created_at;
    setNewsForm({
      id: item.id,
      title: item.title || '',
      content: item.content || '',
      image_url: item.image_url || '',
      date: formatDateForInput(rawDate)
    });
    
    if (editorRef.current) {
      editorRef.current.setContent(item.content || '');
    }

    setFileInputKey(Date.now());
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteNews = async (id) => {
    if (!window.confirm('Видалити цю новину?')) return;
    try {
      await axios.delete(`/api/news/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      if (setMessage) setMessage('Новину видалено!');
      if (newsForm.id === id) resetNewsForm();
      loadNews();
    } catch (err) {
      if (setMessage) setMessage('Помилка видалення новини');
    }
  };

  const availableYears = Array.from(
    new Set(
      newsList
        .map(item => {
          const raw = item.date || item.created_at;
          return raw ? new Date(raw).getFullYear() : null;
        })
        .filter(Boolean)
    )
  ).sort((a, b) => b - a);

  const filteredNews = newsList.filter(item => {
    const raw = item.date || item.created_at;
    if (!raw) return true;
    const d = new Date(raw);
    const yearMatches = selectedYear ? d.getFullYear() === Number(selectedYear) : true;
    const monthMatches = selectedMonth !== '' ? d.getMonth() === Number(selectedMonth) : true;
    return yearMatches && monthMatches;
  });

  const totalPages = Math.ceil(filteredNews.length / itemsPerPage) || 1;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentNewsPage = filteredNews.slice(indexOfFirstItem, indexOfLastItem);

  const handleResetFilters = () => {
    setSelectedYear('');
    setSelectedMonth('');
    setCurrentPage(1);
  };

  return (
    <div>
      <div className="admin-card">
        <h2>{newsForm.id ? '✏️ Редагувати новину' : '➕ Додати нову новину'}</h2>
        <form onSubmit={handleSaveNews}>
          <div className="form-group">
            <label className="form-label">Заголовок новини:</label>
            <input
              type="text"
              className="form-control"
              value={newsForm.title}
              onChange={e => setNewsForm({ ...newsForm, title: e.target.value })}
              placeholder="Введіть заголовок новини"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Дата публікації:</label>
            <input
              type="date"
              className="form-control"
              value={newsForm.date || ''}
              onChange={e => setNewsForm({ ...newsForm, date: e.target.value })}
            />
            <small className="admin-text-subtle margin-top-4 display-block font-size-12">
              * Якщо залишити порожнім — підставиться сьогоднішня дата.
            </small>
          </div>

          <div className="form-group">
            <label className="form-label">Головне зображення новини:</label>
            <input
              key={`news-file-${fileInputKey}`}
              type="file"
              accept="image/*"
              onChange={e => handleFileUpload(e, url => setNewsForm({ ...newsForm, image_url: url }))}
              className="display-block margin-bottom-8"
            />
            {newsForm.image_url && (
              <div className="admin-flex-row-gap margin-top-8 align-center">
                <img src={getImageUrl(newsForm.image_url)} alt="Preview" className="height-80 border-radius-6" />
                <button
                  type="button"
                  className="btn btn-danger btn-sm-action"
                  onClick={() => setNewsForm({ ...newsForm, image_url: '' })}
                >
                  Видалити зображення
                </button>
              </div>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Текст новини:</label>
            <Editor
              tinymceScriptSrc="https://cdn.jsdelivr.net/npm/tinymce@6/tinymce.min.js"
              onInit={(evt, editor) => editorRef.current = editor}
              initialValue={newsForm.content}
              init={{
                height: 450,
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

                content_style: `
                  body { font-family: Helvetica, Arial, sans-serif; font-size: 15px; line-height: 1.6; padding: 10px; } 
                  img { max-width: 100%; height: auto; display: block; margin: 10px 0; }
                `,
                
                images_upload_handler: async (blobInfo) => {
                  const formData = new FormData();
                  formData.append('image', blobInfo.blob(), blobInfo.filename());
                  const res = await axios.post('/api/upload', formData, {
                    headers: { Authorization: `Bearer ${token}` }
                  });
                  return getImageUrl(res.data.imageUrl);
                }
              }}
            />
          </div>

          <div className="admin-flex-row-gap margin-top-20">
            <button type="submit" className="btn btn-primary">
              {newsForm.id ? 'Зберегти зміни' : 'Опублікувати новину'}
            </button>
            {newsForm.id && (
              <button type="button" className="btn btn-secondary" onClick={resetNewsForm}>
                Скасувати
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="admin-card">
        <h3>📰 Опубліковані новини ({filteredNews.length})</h3>

        <div className="admin-filters-bar">
          <div className="admin-filter-group">
            <label className="admin-filter-label">Рік:</label>
            <select
              value={selectedYear}
              onChange={(e) => { setSelectedYear(e.target.value); setCurrentPage(1); }}
              className="form-control admin-filter-select"
            >
              <option value="">Усі роки</option>
              {availableYears.map(yr => (
                <option key={yr} value={yr}>{yr}</option>
              ))}
            </select>
          </div>

          <div className="admin-filter-group">
            <label className="admin-filter-label">Місяць:</label>
            <select
              value={selectedMonth}
              onChange={(e) => { setSelectedMonth(e.target.value); setCurrentPage(1); }}
              className="form-control admin-filter-select"
            >
              <option value="">Усі місяці</option>
              {MONTH_NAMES.map((mName, idx) => (
                <option key={idx} value={idx}>{mName}</option>
              ))}
            </select>
          </div>

          {(selectedYear || selectedMonth !== '') && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="btn btn-secondary btn-filter-reset"
            >
              🔄 Скинути фільтри
            </button>
          )}
        </div>

        {currentNewsPage.length > 0 ? (
          <div className="admin-news-list-container">
            {currentNewsPage.map(item => (
              <div key={item.id} className="admin-list-item">
                <div>
                  <strong className="admin-news-title">{item.title}</strong>
                  <div className="admin-news-date">
                    📅 {formatDateForInput(item.date || item.created_at) || 'Сьогодні'}
                  </div>
                </div>
                <div className="admin-news-actions">
                  <button className="btn btn-warning" onClick={() => handleEditNews(item)}>✏️ Редагувати</button>
                  <button className="btn btn-danger" onClick={() => handleDeleteNews(item.id)}>🗑️ Видалити</button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="admin-news-empty">
            Новин за обраними фільтрами не знайдено.
          </div>
        )}

        {totalPages > 1 && (
          <div className="admin-pagination-container">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => prev - 1)}
              className="btn btn-secondary btn-pagination-nav"
            >
              ← Попередня
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => (
              <button
                key={pageNum}
                onClick={() => setCurrentPage(pageNum)}
                className={`btn-pagination-number ${pageNum === currentPage ? 'active' : ''}`}
              >
                {pageNum}
              </button>
            ))}

            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(prev => prev + 1)}
              className="btn btn-secondary btn-pagination-nav"
            >
              Наступна →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminNews;