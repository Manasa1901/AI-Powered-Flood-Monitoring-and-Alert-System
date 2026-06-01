import React, { useEffect, useState } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:5000';

function History() {
  const [history, setHistory] = useState([]);

  useEffect(() => { fetchHistory(); }, []);

  const fetchHistory = async () => {
    try {
      const res = await axios.get(`${API_URL}/history`);
      setHistory(res.data);
    } catch (err) {
      console.error('Error fetching history:', err);
    }
  };

  const getRiskClass = (level) =>
    ({ Low: 'low', Medium: 'medium', High: 'high', Critical: 'critical' }[level] || 'low');

  return (
    <div className="card">
      <h2>📜 Prediction History</h2>
      {history.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {history.map((item, idx) => (
            <div
              key={idx}
              style={{
                background: 'rgba(13, 27, 46, 0.5)',
                border: '1px solid rgba(33, 150, 243, 0.12)',
                borderRadius: '12px',
                padding: '1.25rem',
                display: 'grid',
                gridTemplateColumns: '1fr auto',
                gap: '1rem',
                alignItems: 'start',
              }}
            >
              <div>
                <div style={{ fontWeight: 600, color: '#e2e8f0', marginBottom: '0.3rem' }}>{item.location}</div>
                <div style={{ fontSize: '0.8rem', color: '#546e7a', marginBottom: '1rem' }}>
                  🕐 {new Date(item.timestamp).toLocaleString()}
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {item.predictions.slice(0, 4).map((pred, i) => (
                    <div
                      key={i}
                      style={{
                        background: 'rgba(33, 150, 243, 0.06)',
                        border: '1px solid rgba(33, 150, 243, 0.12)',
                        borderRadius: '8px',
                        padding: '0.5rem 0.75rem',
                        fontSize: '0.8rem',
                        textAlign: 'center',
                        minWidth: '90px',
                      }}
                    >
                      <div style={{ color: '#78909c', marginBottom: '0.3rem' }}>{pred.date}</div>
                      <span className={`risk-badge ${getRiskClass(pred.riskLevel)}`}>{pred.riskLevel}</span>
                    </div>
                  ))}
                  {item.predictions.length > 4 && (
                    <div style={{
                      background: 'rgba(33, 150, 243, 0.06)',
                      border: '1px solid rgba(33, 150, 243, 0.12)',
                      borderRadius: '8px',
                      padding: '0.5rem 0.75rem',
                      fontSize: '0.8rem',
                      color: '#546e7a',
                      display: 'flex',
                      alignItems: 'center',
                    }}>
                      +{item.predictions.length - 4} more
                    </div>
                  )}
                </div>
              </div>
              <div style={{
                background: 'rgba(33, 150, 243, 0.08)',
                border: '1px solid rgba(33, 150, 243, 0.15)',
                borderRadius: '8px',
                padding: '0.5rem 0.85rem',
                fontSize: '0.78rem',
                color: '#42a5f5',
                fontWeight: 600,
                whiteSpace: 'nowrap',
              }}>
                {item.predictions.length} days
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-icon">📜</div>
          <p>No prediction history available yet</p>
        </div>
      )}
    </div>
  );
}

export default History;
