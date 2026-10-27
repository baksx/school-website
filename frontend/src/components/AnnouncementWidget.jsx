import React, { useState, useEffect } from 'react';
import axios from 'axios';

function AnnouncementWidget() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    axios.get('/api/announcements')
      .then(res => setItems(Array.isArray(res.data) ? res.data : []))
      .catch(console.error);
  }, []);

  if (items.length === 0) return null;

  return (
    <div style={{ 
  maxWidth: '1240px', 
  width: '100%', 
  margin: '20px auto', 
  padding: '0 20px', 
  boxSizing: 'border-box' 
}}>
      {items.map(item => (
        <div 
          key={item.id} 
          style={{ 
            width: '100%',
            backgroundColor: '#fffbeb',
            borderLeft: '5px solid #f59e0b',
            borderRadius: '16px',
            padding: '16px 20px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.04)',
            marginBottom: '16px',
            boxSizing: 'border-box'
          }}
        >
          <h4 style={{ 
            margin: '0 0 6px 0', 
            fontSize: '18px', 
            color: '#92400e', 
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            📢 {item.title}
          </h4>
          
          <p style={{ 
            margin: 0, 
            fontSize: '14px', 
            color: '#78350f', 
            whiteSpace: 'pre-wrap', 
            lineHeight: '1.4' 
          }}>
            {item.content}
          </p>
        </div>
      ))}
    </div>
  );
}

export default AnnouncementWidget;