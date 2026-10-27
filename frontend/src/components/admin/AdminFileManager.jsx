import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../../styles/Admin.css';

const getFileUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  const baseUrl = window.location.hostname === 'localhost' ? 'http://localhost:5000' : '';
  return `${baseUrl}${url.startsWith('/') ? '' : '/'}${url}`;
};

const formatBytes = (bytes) => {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

function AdminFileManager({ token, setMessage }) {
  const [currentPath, setCurrentPath] = useState('');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileInputKey, setFileInputKey] = useState(Date.now());

  useEffect(() => {
    loadFiles(currentPath);
  }, [currentPath]);

  const loadFiles = async (path = '') => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/files?path=${encodeURIComponent(path)}`);
      setItems(res.data.items || []);
    } catch (err) {
      if (setMessage) setMessage('❌ Помилка завантаження файлів');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateFolder = async (e) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;

    try {
      await axios.post(
        '/api/files/create-folder',
        { folderName: newFolderName.trim(), currentPath },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (setMessage) setMessage('📁 Папку успішно створено!');
      setNewFolderName('');
      loadFiles(currentPath);
    } catch (err) {
      const msg = err.response?.data?.error || 'Помилка створення папки';
      if (setMessage) setMessage(`❌ ${msg}`);
    }
  };

  const handleFileUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append('folderPath', currentPath);
    formData.append('file', selectedFile);

    try {
      await axios.post('/api/files/upload', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      if (setMessage) setMessage('🎉 Файл успішно завантажено!');
      setSelectedFile(null);
      setFileInputKey(Date.now());
      loadFiles(currentPath);
    } catch (err) {
      if (setMessage) setMessage('❌ Помилка завантаження файла');
    }
  };

  const handleDeleteItem = async (itemName, isDirectory) => {
    const confirmMsg = isDirectory
      ? `Видалити папку "${itemName}" та весь її вміст?`
      : `Видалити файл "${itemName}"?`;

    if (!window.confirm(confirmMsg)) return;

    const itemPath = currentPath ? `${currentPath}/${itemName}` : itemName;

    try {
      await axios.delete('/api/files', {
        headers: { Authorization: `Bearer ${token}` },
        data: { itemPath, isDirectory }
      });
      if (setMessage) setMessage('🗑️ Видалено успішно!');
      loadFiles(currentPath);
    } catch (err) {
      if (setMessage) setMessage('❌ Помилка видалення');
    }
  };

  const handleCopyLink = (rawUrl) => {
    const fullUrl = getFileUrl(rawUrl);
    navigator.clipboard.writeText(fullUrl);
    if (setMessage) setMessage('📋 Пряме посилання скопійовано в буфер обміну!');
  };

  const handleOpenFolder = (folderName) => {
    const newPath = currentPath ? `${currentPath}/${folderName}` : folderName;
    setCurrentPath(newPath);
  };

  const handleGoBack = () => {
    if (!currentPath) return;
    const pathParts = currentPath.split('/');
    pathParts.pop();
    setCurrentPath(pathParts.join('/'));
  };

  return (
    <div className="admin-card">
      <h2>📁 Файловий менеджер документов</h2>
      <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '20px' }}>
        Завантажуйте документи (PDF, Word, Excel, Архіви) та копіюйте посилання для вставки на сторінки або в новини.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px', background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
        <form onSubmit={handleCreateFolder} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label className="form-label">➕ Створити нову папку:</label>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              type="text"
              className="form-control"
              placeholder="Наприклад: Розклади_2026"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
            />
            <button type="submit" className="btn btn-primary">
              Створити
            </button>
          </div>
        </form>

        <form onSubmit={handleFileUpload} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label className="form-label">📤 Завантажити файл у поточну папку:</label>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              key={fileInputKey}
              type="file"
              className="form-control"
              onChange={(e) => setSelectedFile(e.target.files[0])}
            />
            <button
              type="submit"
              disabled={!selectedFile}
              className={`btn ${selectedFile ? 'btn-success' : 'btn-secondary'}`}
            >
              Завантажити
            </button>
          </div>
        </form>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px', fontSize: '14px', background: '#eff6ff', padding: '10px 14px', borderRadius: '8px' }}>
        <span style={{ fontWeight: 'bold', color: '#1e40af' }}>📂 Шлях:</span>
        <span style={{ fontFamily: 'monospace', color: '#0f172a' }}>
          /documents{currentPath ? `/${currentPath}` : ''}
        </span>
        {currentPath && (
          <button
            type="button"
            onClick={handleGoBack}
            className="btn btn-primary"
            style={{ marginLeft: 'auto', padding: '4px 12px', fontSize: '12px' }}
          >
            ⬆️ На рівень вгору
          </button>
        )}
      </div>

      {loading ? (
        <div style={{ padding: '20px', textAlign: 'center', color: '#64748b' }}>⏳ Завантаження вмісту папки...</div>
      ) : items.length === 0 ? (
        <div style={{ padding: '30px', textAlign: 'center', color: '#94a3b8', border: '2px dashed #e2e8f0', borderRadius: '12px' }}>
          Ця папка порожня. Завантажте файл або створіть підпапку.
        </div>
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>Тип / Назва</th>
              <th>Розмір</th>
              <th>Дата зміни</th>
              <th style={{ textAlign: 'right' }}>Дії</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, idx) => (
              <tr key={idx}>
                <td>
                  {item.isDirectory ? (
                    <span
                      onClick={() => handleOpenFolder(item.name)}
                      style={{ cursor: 'pointer', color: '#d97706', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px' }}
                    >
                      📁 {item.name}
                    </span>
                  ) : (
                    <span style={{ color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      📄 {item.name}
                    </span>
                  )}
                </td>
                <td style={{ color: '#64748b' }}>
                  {item.isDirectory ? '—' : formatBytes(item.size)}
                </td>
                <td style={{ color: '#64748b', fontSize: '12px' }}>
                  {new Date(item.updatedAt).toLocaleDateString('uk-UA')}
                </td>
                <td style={{ textAlign: 'right' }}>
                  <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                    {!item.isDirectory && (
                      <button
                        type="button"
                        onClick={() => handleCopyLink(item.url)}
                        className="btn btn-secondary"
                        style={{ padding: '4px 10px', fontSize: '12px' }}
                      >
                        🔗 Посилання
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleDeleteItem(item.name, item.isDirectory)}
                      className="btn btn-danger"
                      style={{ padding: '4px 10px', fontSize: '12px' }}
                    >
                      🗑️
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default AdminFileManager;