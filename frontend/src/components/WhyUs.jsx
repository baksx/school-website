import React from 'react';

const advantages = [
  {
    id: 1,
    icon: '🛡️',
    title: 'Безпечне середовище',
    description: 'Сучасне облаштоване укриття, цілодобова охорона та система відеоспостереження.',
    color: '#eff6ff',
    iconBg: '#dbeafe',
    borderColor: '#bfdbfe'
  },
  {
    id: 2,
    icon: '🎓',
    title: 'Якість освіти',
    description: 'Висококваліфіковані вчителі, інтерактивні методи навчання та високі результати НМТ/ЗНО.',
    color: '#f0fdf4',
    iconBg: '#dcfce7',
    borderColor: '#bbf7d0'
  },
  {
    id: 3,
    icon: '⚡',
    title: 'Розвиток особистості',
    description: 'Понад 30 гуртків, спортивні секції, STEAM-лабораторії та учнівське самоврядування.',
    color: '#faf5ff',
    iconBg: '#f3e8ff',
    borderColor: '#e9d5ff'
  },
  {
    id: 4,
    icon: '💻',
    title: 'Сучасна інфраструктура',
    description: 'Мультимедійні дошки, комп’ютерні класи, Wi-Fi та комфортні зони відпочинку.',
    color: '#fff7ed',
    iconBg: '#ffedd5',
    borderColor: '#fed7aa'
  }
];

function WhyUs() {
  return (
    <section style={{ padding: '60px 20px', background: '#f8fafc' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        
        {/* ЗАГОЛОВОК СЕКЦІЇ */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h2 style={{ fontSize: '28px', color: '#0f172a', fontWeight: '800', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Чому обирають нас?
          </h2>
          <div style={{ width: '60px', height: '4px', background: '#2563eb', margin: '0 auto 12px', borderRadius: '2px' }}></div>
          <p style={{ color: '#64748b', fontSize: '16px', maxWidth: '600px', margin: '0 auto' }}>
            Ми створюємо найкращі умови для гармонійного розвитку, безпеки та успішного навчання кожної дитини.
          </p>
        </div>

        {/* СІТКА КАРТОК ПЕРЕВАГ */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '24px'
        }}>
          {advantages.map((item) => (
            <div
              key={item.id}
              className="advantage-card"
              style={{
                background: '#ffffff',
                padding: '28px 24px',
                borderRadius: '16px',
                border: `1px solid ${item.borderColor}`,
                boxShadow: '0 4px 12px rgba(15, 23, 42, 0.03)',
                transition: 'all 0.3s ease',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start'
              }}
            >
              {/* Іконка у пастельному кружечку */}
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '14px',
                background: item.iconBg,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '26px',
                marginBottom: '20px'
              }}>
                {item.icon}
              </div>

              <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#0f172a', marginBottom: '10px' }}>
                {item.title}
              </h3>

              <p style={{ fontSize: '14px', color: '#64748b', lineHeight: '1.6', margin: 0 }}>
                {item.description}
              </p>
            </div>
          ))}
        </div>

      </div>

      {/* Hover-ефект через інлайн CSS */}
      <style>{`
        .advantage-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 12px 24px rgba(37, 99, 235, 0.1) !important;
        }
      `}</style>
    </section>
  );
}

export default WhyUs;