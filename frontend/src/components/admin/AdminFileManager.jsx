import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

function AdminFileManager({ token, setMessage }) {
  const [items, setItems] = useState([]);
  const [currentPath, setCurrentPath] = useState('');
  const [loading, setLoading] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileInputKey, setFileInputKey] = useState(Date.now());
  const [uploading, setUploading] = useState(false);

  // Отримання переліку файлів із передачею токена
  const fetchFiles = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await axios.get(`/api/files?path=${encodeURIComponent(currentPath)}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setItems(res.data.items || []);
    } catch (err) {
      console.error('Помилка завантаження файлів:', err);
      if (setMessage) {
        setMessage(`❌ ${err.response?.data?.error || 'Помилка завантаження файлів'}`);
      }
    } finally {
      setLoading(false);
    }
  }, [currentPath, token, setMessage]);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  // Створення папки
  const handleCreateFolder = async (e) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;

    try {
      await axios.post(
        '/api/files/create-folder',
        { folderName: newFolderName, currentPath },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNewFolderName('');
      if (setMessage) setMessage('🎉 Папку успішно створено!');
      fetchFiles();
    } catch (err) {
      if (setMessage) setMessage(`❌ ${err.response?.data?.error || 'Помилка створення папки'}`);
    }
  };

  // Завантаження документа
  const handleUploadFile = async (e) => {
    e.preventDefault();
    if (!selectedFile) return;

    setUploading(true);
    const formData = new FormData();
    
    // ⚠️ ВАЖЛИВО: Текстові поля мають передувати файлу у FormData, 
    // щоб Multer зчитав req.body.folderPath під час розрахунку папки збереження!
    formData.append('folderPath', currentPath);
    formData.append('file', selectedFile);

    try {
      await axios.post('/api/files/upload', formData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setSelectedFile(null);
      setFileInputKey(Date.now());
      if (setMessage) setMessage('🎉 Файл успішно завантажено!');
      fetchFiles();
    } catch (err) {
      if (setMessage) setMessage(`❌ ${err.response?.data?.error || 'Помилка завантаження файла'}`);
    } finally {
      setUploading(false);
    }
  };

  // Видалення елемента
  const handleDeleteItem = async (itemName, isDirectory) => {
    const itemPath = currentPath ? `${currentPath}/${itemName}` : itemName;
    if (!window.confirm(`Ви дійсно бажаєте видалити ${isDirectory ? 'папку' : 'файл'} "${itemName}"?`)) {
      return;
    }

    try {
      await axios.delete('/api/files', {
        headers: { Authorization: `Bearer ${token}` },
        data: { itemPath, isDirectory }
      });
      if (setMessage) setMessage('🗑️ Видалено успішно');
      fetchFiles();
    } catch (err) {
      if (setMessage) setMessage(`❌ ${err.response?.data?.error || 'Помилка видалення'}`);
    }
  };

  const handleOpenFolder = (folderName) => {
    setCurrentPath(prev => (prev ? `${prev}/${folderName}` : folderName));
  };

  const handleGoBack = () => {
    const pathParts = currentPath.split('/');
    pathParts.pop();
    setCurrentPath(pathParts.join('/'));
  };

  return (
    <div className="admin-card">
      <h2>📁 Файловий менеджер</h2>

      <div className="admin-path-banner">
        <span className="admin-path-title">Поточна папка:</span>
        <span className="admin-path-value">/ {currentPath}</span>
        {currentPath && (
          <button onClick={handleGoBack} className="btn btn-secondary admin-btn-back">
            ⬅️ Назад
          </button>
        )}
      </div>

      <div className="admin-grid-2col">
        <form onSubmit={handleCreateFolder} className="admin-grid-box admin-flex-col">
          <label className="form-label">Створити нову папку:</label>
          <div className="admin-flex-row-gap">
            <input
              type="text"
              className="form-control"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              placeholder="Назва папки"
              required
            />
            <button type="submit" className="btn btn-primary">
              Створити
            </button>
          </div>
        </form>

        <form onSubmit={handleUploadFile} className="admin-grid-box admin-flex-col">
          <label className="form-label">Завантажити документ:</label>
          <div className="admin-flex-row-gap">
            <input
              key={fileInputKey}
              type="file"
              className="form-control"
              onChange={(e) => setSelectedFile(e.target.files[0])}
              required
            />
            <button type="submit" disabled={uploading} className="btn btn-success">
              {uploading ? 'Завантаження...' : 'Завантажити'}
            </button>
          </div>
        </form>
      </div>

      {loading ? (
        <div className="text-center padding-20">Завантаження вмісту...</div>
      ) : items.length === 0 ? (
        <div className="file-manager-empty">Папка порожня</div>
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>Тип / Назва</th>
              <th>Розмір</th>
              <th>Змінено</th>
              <th className="text-right">Дії</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.name}>
                <td>
                  {item.isDirectory ? (
                    <span className="file-folder-link" onClick={() => handleOpenFolder(item.name)}>
                      📁 {item.name}
                    </span>
                  ) : (
                    <a href={item.url} target="_blank" rel="noopener noreferrer" className="file-item-name">
                      📄 {item.name}
                    </a>
                  )}
                </td>
                <td>{item.isDirectory ? '-' : `${(item.size / 1024).toFixed(1)} KB`}</td>
                <td>{new Date(item.updatedAt).toLocaleDateString()}</td>
                <td className="text-right">
                  <button
                    onClick={() => handleDeleteItem(item.name, item.isDirectory)}
                    className="btn btn-danger btn-sm-action"
                  >
                    🗑️ Видалити
                  </button>
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