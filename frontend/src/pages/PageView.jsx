import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import '../App.css';

function PageView() {
  const { slug } = useParams();
  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    setLoading(true);
    axios.get(`/api/pages/by-slug/${slug}`)
      .then(res => {
        setPage(res.data);
        setLoading(false);
        setError(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  }, [slug]);

  if (loading) return <div className="page-loading">⏳ Завантаження сторінки...</div>;
  if (error || !page) return <div className="page-error"><h2>404</h2><p>Сторінку не знайдено або вона ще не опублікована.</p></div>;

  return (
    <main className="page-view-wrapper">
      <h1 className="page-view-title">
        {page.title}
      </h1>
      
      <div 
        className="page-view-content"
        dangerouslySetInnerHTML={{ __html: page.content }} 
      />
    </main>
  );
}

export default PageView;