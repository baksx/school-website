import React from 'react';
import { Link } from 'react-router-dom';

function QuickAccess() {
  const quickLinks = [
    {
      id: 'schedule',
      title: 'Розклад уроків',
      subtitle: 'Актуальний розклад занять та дзвінків',
      icon: '📅',
      path: '/schedule',
      bgColor: '#eff6ff',
      isExternal: false
    },
    {
      id: 'menu',
      title: 'Меню їдальні',
      subtitle: 'Щоденний раціон та харчування',
      icon: '🥗',
      path: '/menu',
      bgColor: '#ecfdf5',
      isExternal: false
    },
    {
      id: 'clubs',
      title: 'Гуртки та секції',
      subtitle: 'Позакласні заняття та творчість',
      icon: '🎨',
      path: '/clubs',
      bgColor: '#fffbeb',
      isExternal: false
    },
    {
      id: 'diary',
      title: 'Електронний щоденник',
      subtitle: 'Оцінки, завдання та відвідуваність',
      icon: '📖',
      path: 'https://mriia.gov.ua/',
      bgColor: '#f5f3ff',
      isExternal: true
    },
  ];

  return (
    <section style={{ 
      position: 'relative', 
      zIndex: 10, 
      marginTop: '-50px', 
      padding: '0 20px', 
      marginBottom: '40px' 
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '20px'
        }}>
          {quickLinks.map((item) => {
            const cardContent = (
              <>
                <div style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '14px',
                  background: item.bgColor,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '28px',
                  flexShrink: 0
                }}>
                  {item.icon}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{
                    fontSize: '17px',
                    fontWeight: '700',
                    color: '#0f172a',
                    lineHeight: '1.3'
                  }}>
                    {item.title}
                  </span>
                  <span style={{
                    fontSize: '13px',
                    color: '#64748b',
                    marginTop: '4px',
                    lineHeight: '1.4'
                  }}>
                    {item.subtitle}
                  </span>
                </div>
              </>
            );

            const cardStyle = {
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              padding: '20px 24px',
              background: '#ffffff',
              borderRadius: '16px',
              border: '1px solid #e2e8f0',
              boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.08), 0 8px 10px -6px rgba(15, 23, 42, 0.04)',
              textDecoration: 'none',
              transition: 'transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease'
            };

            if (item.isExternal) {
              return (
                <a
                  key={item.id}
                  href={item.path}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="quick-access-card"
                  style={cardStyle}
                >
                  {cardContent}
                </a>
              );
            }

            return (
              <Link
                key={item.id}
                to={item.path}
                className="quick-access-card"
                style={cardStyle}
              >
                {cardContent}
              </Link>
            );
          })}
        </div>
      </div>

      <style>{`
        .quick-access-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 20px 25px -5px rgba(15, 23, 42, 0.12), 0 8px 10px -6px rgba(15, 23, 42, 0.06) !important;
          border-color: #cbd5e1 !important;
        }
      `}</style>
    </section>
  );
}

export default QuickAccess;