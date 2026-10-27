import React, { useState, useEffect } from 'react';
import axios from 'axios';

function PollWidget() {
  const [poll, setPoll] = useState(null);
  const [selectedOption, setSelectedOption] = useState('');
  const [voted, setVoted] = useState(false);
  const [userVoteOptionId, setUserVoteOptionId] = useState(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadPoll();
  }, []);

  const loadPoll = async () => {
    try {
      const res = await axios.get('/api/polls');
      if (res.data && res.data.length > 0) {
        const latestPoll = res.data[0];

        const isExpired = latestPoll.expires_at && new Date() > new Date(latestPoll.expires_at);
        if (!latestPoll.is_active || isExpired) {
          setPoll(null);
          return;
        }

        setPoll(latestPoll);
        const savedVote = localStorage.getItem(`voted_poll_${latestPoll.id}`);
        if (savedVote) {
          setVoted(true);
          setUserVoteOptionId(savedVote);
        }
      } else {
        setPoll(null);
      }
    } catch (err) {
      console.error('Помилка завантаження опитування:', err);
    }
  };

  const handleVote = async () => {
    if (!selectedOption || !poll) return;
    try {
      const res = await axios.post(`/api/polls/${poll.id}/vote`, { optionId: selectedOption });
      
      localStorage.setItem(`voted_poll_${poll.id}`, String(selectedOption));
      setUserVoteOptionId(String(selectedOption));
      setMessage(res.data.message || 'Дякуємо! Ваш голос враховано.');
      setVoted(true);
      loadPoll();
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Помилка при збереженні голосу';
      setMessage(`❌ ${errorMsg}`);
    }
  };

  if (!poll) return null;

  const totalVotes = poll.options?.reduce((sum, opt) => sum + opt.votes, 0) || 0;

  return (
    <div style={{
      maxWidth: '1240px',
      width: '100%',
      margin: '30px auto',
      padding: '0 20px',
      boxSizing: 'border-box'
    }}>
      <div style={{
        background: '#ffffff',
        borderRadius: '20px',
        padding: '28px 32px',
        boxShadow: '0 10px 30px -5px rgba(15, 23, 42, 0.08)',
        border: '1px solid #f1f5f9',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Декоративна кольорова смуга зверху */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '5px',
          background: 'linear-gradient(90deg, #2563eb 0%, #38bdf8 50%, #f97316 100%)'
        }} />

        {/* Заголовок та мета-інформація */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '20px' }}>
          <div>
            <span style={{
              display: 'inline-block',
              padding: '4px 12px',
              borderRadius: '20px',
              backgroundColor: '#eff6ff',
              color: '#2563eb',
              fontSize: '12px',
              fontWeight: '700',
              letterSpacing: '0.5px',
              marginBottom: '8px',
              textTransform: 'uppercase'
            }}>
              📊 Опитування ліцею
            </span>
            <h3 style={{ margin: 0, fontSize: '20px', fontWeight: '800', color: '#0f172a', lineHeight: '1.3' }}>
              {poll.title}
            </h3>
          </div>

          {poll.expires_at && (
            <span style={{
              fontSize: '13px',
              color: '#64748b',
              backgroundColor: '#f8fafc',
              padding: '6px 14px',
              borderRadius: '10px',
              border: '1px solid #e2e8f0',
              fontWeight: '500'
            }}>
              ⏳ Дійсне до: <b>{new Date(poll.expires_at).toLocaleDateString('uk-UA')}</b>
            </span>
          )}
        </div>

        {message && (
          <div style={{
            padding: '12px 16px',
            borderRadius: '12px',
            backgroundColor: '#f0fdf4',
            color: '#166534',
            fontSize: '14px',
            fontWeight: '600',
            marginBottom: '20px',
            border: '1px solid #bbf7d0'
          }}>
            {message}
          </div>
        )}

        {/* РЕЖИМ ГОЛОСУВАННЯ */}
        {!voted ? (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '12px', marginBottom: '20px' }}>
              {poll.options?.map(opt => {
                const isSelected = String(selectedOption) === String(opt.id);
                return (
                  <div
                    key={opt.id}
                    onClick={() => setSelectedOption(opt.id)}
                    style={{
                      padding: '16px 20px',
                      borderRadius: '14px',
                      border: isSelected ? '2px solid #2563eb' : '1px solid #e2e8f0',
                      backgroundColor: isSelected ? '#eff6ff' : '#f8fafc',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      boxShadow: isSelected ? '0 4px 12px rgba(37, 99, 235, 0.15)' : 'none'
                    }}
                  >
                    <div style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      border: isSelected ? '6px solid #2563eb' : '2px solid #94a3b8',
                      backgroundColor: '#ffffff',
                      boxSizing: 'border-box',
                      transition: 'all 0.2s ease',
                      flexShrink: 0
                    }} />
                    <span style={{ fontSize: '15px', fontWeight: isSelected ? '700' : '600', color: isSelected ? '#1e40af' : '#334155' }}>
                      {opt.option_text}
                    </span>
                  </div>
                );
              })}
            </div>

            <button
              onClick={handleVote}
              disabled={!selectedOption}
              style={{
                padding: '14px 32px',
                borderRadius: '12px',
                background: selectedOption ? 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)' : '#cbd5e1',
                color: '#ffffff',
                border: 'none',
                fontWeight: '700',
                fontSize: '15px',
                cursor: selectedOption ? 'pointer' : 'not-allowed',
                boxShadow: selectedOption ? '0 4px 14px rgba(37, 99, 235, 0.35)' : 'none',
                transition: 'all 0.2s ease'
              }}
            >
              🚀 Взяти участь у голосуванні
            </button>
          </div>
        ) : (
          /* РЕЖИМ РЕЗУЛЬТАТІВ */
          <div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '18px' }}>
              {poll.options?.map(opt => {
                const percent = totalVotes > 0 ? Math.round((opt.votes / totalVotes) * 100) : 0;
                const isMyChoice = String(userVoteOptionId) === String(opt.id);

                return (
                  <div key={opt.id} style={{ position: 'relative' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '14px', fontWeight: '700', color: '#0f172a', marginBottom: '6px' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        {opt.option_text}
                        {isMyChoice && (
                          <span style={{ fontSize: '11px', background: '#dcfce7', color: '#166534', padding: '2px 8px', borderRadius: '10px', fontWeight: '700' }}>
                            Ваш вибір ✓
                          </span>
                        )}
                      </span>
                      <span style={{ color: '#2563eb' }}>{percent}% <small style={{ color: '#94a3b8', fontWeight: '500' }}>({opt.votes})</small></span>
                    </div>

                    <div style={{ width: '100%', height: '12px', backgroundColor: '#f1f5f9', borderRadius: '8px', overflow: 'hidden', position: 'relative' }}>
                      <div style={{
                        width: `${percent}%`,
                        height: '100%',
                        background: isMyChoice 
                          ? 'linear-gradient(90deg, #16a34a 0%, #22c55e 100%)' 
                          : 'linear-gradient(90deg, #2563eb 0%, #38bdf8 100%)',
                        borderRadius: '8px',
                        transition: 'width 0.6s cubic-bezier(0.4, 0, 0.2, 1)'
                      }} />
                    </div>
                  </div>
                );
              })}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9', paddingTop: '14px', color: '#64748b', fontSize: '13px' }}>
              <span>Всього взяло участь: <b style={{ color: '#0f172a' }}>{totalVotes} осіб</b></span>
              <span style={{ color: '#166534', fontWeight: '600' }}>✓ Дякуємо за вашу думку!</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default PollWidget;