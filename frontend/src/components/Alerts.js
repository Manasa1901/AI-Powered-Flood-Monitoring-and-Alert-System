import React, { useEffect, useState } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:5000';

const severityColor = (s) =>
  s === 'critical' ? '#ef5350' : s === 'high' ? '#ffa726' : '#ffd54f';

function Alerts() {
  const [alerts, setAlerts] = useState([]);
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchAlerts = async () => {
    try {
      const res = await axios.get(`${API_URL}/alerts`);
      setAlerts(res.data);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Error fetching alerts:', err);
    }
  };

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
        <h2 style={{ margin: 0 }}>🚨 Flood Alerts</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: '#546e7a' }}>
          <span style={{
            width: 8, height: 8, borderRadius: '50%',
            background: '#66bb6a',
            display: 'inline-block',
            boxShadow: '0 0 6px #66bb6a',
            animation: 'pulse-high 2s infinite'
          }} />
          Live · {lastUpdated ? lastUpdated.toLocaleTimeString() : '—'}
        </div>
      </div>

      {alerts.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {alerts.map(alert => (
            <div key={alert.id} style={{
              background: 'rgba(13, 27, 46, 0.6)',
              border: `1px solid rgba(${alert.severity === 'critical' ? '244,67,54' : '255,152,0'}, 0.25)`,
              borderLeft: `3px solid ${severityColor(alert.severity)}`,
              borderRadius: '10px',
              padding: '1rem 1.25rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '1rem',
            }}>
              <div>
                <div style={{ fontWeight: 600, color: severityColor(alert.severity), marginBottom: '0.3rem' }}>
                  {alert.message}
                </div>
                <div style={{ fontSize: '0.82rem', color: '#78909c', display: 'flex', gap: '1rem' }}>
                  <span>📍 {alert.location}</span>
                  <span>🕐 {alert.timestamp}</span>
                </div>
              </div>
              <span className={`risk-badge ${alert.riskLevel.toLowerCase()}`} style={{ flexShrink: 0 }}>
                {alert.riskLevel}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-icon">✅</div>
          <p>No active alerts — all zones are currently safe</p>
        </div>
      )}
    </div>
  );
}

export default Alerts;
