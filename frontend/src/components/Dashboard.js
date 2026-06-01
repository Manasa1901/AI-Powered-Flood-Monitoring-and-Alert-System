import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:5000';

function Dashboard() {
  const [location, setLocation] = useState('Chennai - T Nagar');
  const [days, setDays] = useState(7);
  const [email, setEmail] = useState('');
  const [weather, setWeather] = useState(null);
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [locations, setLocations] = useState([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchWeather();
    fetchLocations();
  }, []);

  const fetchWeather = async () => {
    try {
      const res = await axios.get(`${API_URL}/weather-data`);
      setWeather(res.data);
    } catch (err) {
      console.error('Error fetching weather:', err);
    }
  };

  const fetchLocations = async () => {
    try {
      const res = await axios.get(`${API_URL}/locations`);
      setLocations(res.data);
    } catch (err) {
      setLocations(['Chennai - T Nagar', 'Chennai - Anna Nagar', 'Coimbatore']);
    }
  };

  const predictFlood = async () => {
    if (email && !email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      setMessage('error:Please enter a valid email address');
      return;
    }
    setLoading(true);
    setMessage('');
    try {
      const res = await axios.post(`${API_URL}/predict-flood`, { location, days, email });
      setPredictions(res.data.predictions);
      if (email && res.data.emailSent) {
        setMessage('success:Prediction complete! Alert email sent to ' + email);
      } else if (email) {
        setMessage('warning:Prediction complete! Email notification failed.');
      } else {
        setMessage('success:Prediction complete!');
      }
    } catch (err) {
      setMessage('error:Unable to connect to server. Please ensure backend is running.');
    }
    setLoading(false);
  };

  const getRiskClass = (level) =>
    ({ Low: 'low', Medium: 'medium', High: 'high', Critical: 'critical' }[level] || 'low');

  const currentRisk = predictions.length > 0 ? predictions[0].riskLevel : null;

  const [msgType, msgText] = message ? message.split(':') : [];

  const weatherStats = weather ? [
    { icon: '🌡️', value: `${weather.temperature}°C`, label: 'Temperature' },
    { icon: '💧', value: `${weather.humidity}%`,     label: 'Humidity' },
    { icon: '🌧️', value: `${weather.rainfall} mm`,   label: 'Rainfall' },
    { icon: '💨', value: `${weather.windSpeed} km/h`, label: 'Wind Speed' },
  ] : [];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '1.5rem', alignItems: 'start' }}>
      {/* Left Panel */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div className="card">
          <h3>🎯 Prediction Parameters</h3>
          <div className="section-divider" />
          <label className="field-label">Location</label>
          <select value={location} onChange={(e) => setLocation(e.target.value)}>
            {locations.map(loc => <option key={loc} value={loc}>{loc}</option>)}
          </select>
          <label className="field-label">Forecast Days</label>
          <input type="number" value={days} onChange={(e) => setDays(e.target.value)} min="1" max="14" />
          <label className="field-label">Email for Alerts (Optional)</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
          />
          <button className="primary" onClick={predictFlood} disabled={loading} style={{ width: '100%' }}>
            {loading ? '⏳ Predicting...' : '🔮 Predict Flood Risk'}
          </button>
          {message && (
            <div className={`msg-banner ${msgType}`}>{msgText}</div>
          )}
        </div>

        {weather && (
          <div className="card">
            <h3>🌤️ Current Weather</h3>
            <div className="section-divider" />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              {weatherStats.map(s => (
                <div key={s.label} className="stat-card">
                  <div className="stat-icon">{s.icon}</div>
                  <div className="stat-value">{s.value}</div>
                  <div className="stat-label">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="card" style={{ textAlign: 'center' }}>
          <h3>⚠️ Current Risk Level</h3>
          <div className="section-divider" />
          <div style={{ padding: '1.5rem 0' }}>
            {currentRisk ? (
              <span className={`risk-badge ${getRiskClass(currentRisk)}`} style={{ fontSize: '1.1rem', padding: '0.6rem 1.8rem' }}>
                {currentRisk}
              </span>
            ) : (
              <span style={{ color: '#455a64', fontSize: '0.9rem' }}>Run a prediction to see risk</span>
            )}
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="card">
        <h2>📊 Prediction Results</h2>
        {predictions.length > 0 ? (
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Risk Level</th>
                  <th>Risk Score</th>
                  <th>Precipitation</th>
                  <th>Humidity</th>
                  <th>Wind Speed</th>
                </tr>
              </thead>
              <tbody>
                {predictions.map((pred, idx) => (
                  <tr key={idx}>
                    <td>{pred.date}</td>
                    <td><span className={`risk-badge ${getRiskClass(pred.riskLevel)}`}>{pred.riskLevel}</span></td>
                    <td>{pred.riskScore}</td>
                    <td>{pred.precipitation} mm</td>
                    <td>{pred.humidity}%</td>
                    <td>{pred.windSpeed} km/h</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">🔮</div>
            <p>Select a location and click "Predict Flood Risk" to see results</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
