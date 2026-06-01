import React, { useState } from 'react';
import './App.css';
import Login from './components/Login';
import Register from './components/Register';
import Intro from './components/Intro';
import Dashboard from './components/Dashboard';
import MapView from './components/MapView';
import Alerts from './components/Alerts';
import Charts from './components/Charts';
import History from './components/History';
import EmergencyContacts from './components/EmergencyContacts';
import ReportFlooding from './components/ReportFlooding';
import SafeRoute from './components/SafeRoute';

const TABS = [
  { id: 'dashboard', label: '📊 Dashboard' },
  { id: 'map',       label: '🗺️ Map View' },
  { id: 'report',    label: '📸 Report Flood' },
  { id: 'alerts',    label: '🚨 Alerts' },
  { id: 'charts',    label: '📈 Charts' },
  { id: 'history',   label: '📜 History' },
  { id: 'contacts',  label: '📞 Emergency' },
  { id: 'saferoute', label: '🚗 Safe Route' },
];

function App() {
  const [screen, setScreen] = useState('login'); // 'login' | 'register' | 'intro' | 'app'
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');

  const handleLogin = (userData) => {
    setUser(userData);
    setScreen('intro');
  };

  const handleRegister = (userData) => {
    setUser(userData);
    setScreen('intro');
  };

  const handleLogout = () => {
    setUser(null);
    setScreen('login');
  };

  const getInitials = (name) =>
    name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard />;
      case 'map':       return <MapView />;
      case 'report':    return <ReportFlooding />;
      case 'alerts':    return <Alerts />;
      case 'charts':    return <Charts />;
      case 'history':   return <History />;
      case 'contacts':  return <EmergencyContacts />;
      case 'saferoute':  return <SafeRoute />;
      default:          return <Dashboard />;
    }
  };

  if (screen === 'login')    return <Login    onLogin={handleLogin}       onSwitchToRegister={() => setScreen('register')} />;
  if (screen === 'register') return <Register onRegister={handleRegister} onSwitchToLogin={() => setScreen('login')} />;
  if (screen === 'intro')    return <Intro    userData={user}             onComplete={() => setScreen('app')} />;

  return (
    <div className="App">
      <header className="app-header">
        <div className="header-content">
          <div className="header-badge">🛰️ Live Monitoring · Tamil Nadu</div>
          <h1>🌊 AI Urban Flood Prediction System</h1>
          <p>Real-time disaster monitoring, prediction & early warning</p>
        </div>
        <div className="header-wave">
          <svg viewBox="0 0 1440 50" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0,30 C360,60 1080,0 1440,30 L1440,50 L0,50 Z" fill="#070d1a" />
          </svg>
        </div>
      </header>

      <nav className="nav-bar">
        {TABS.map(tab => (
          <button
            key={tab.id}
            className={activeTab === tab.id ? 'active' : ''}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
        {user && (
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ fontSize: '0.82rem', color: '#546e7a' }}>
              👋 {user.name.split(' ')[0]}
            </span>
            <div style={{
              width: 34, height: 34,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #1565c0, #1976d2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '0.75rem', fontWeight: 700, color: '#fff',
              border: '2px solid rgba(33,150,243,0.4)',
              cursor: 'default',
            }}>
              {getInitials(user.name)}
            </div>
            <button
              onClick={handleLogout}
              style={{
                background: 'rgba(239,83,80,0.1)',
                border: '1px solid rgba(239,83,80,0.3)',
                color: '#ef5350',
                padding: '0.35rem 0.85rem',
                borderRadius: '7px',
                cursor: 'pointer',
                fontSize: '0.8rem',
                fontWeight: 600,
                fontFamily: 'inherit',
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,83,80,0.2)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(239,83,80,0.1)'; }}
            >
              Sign Out
            </button>
          </div>
        )}
      </nav>

      <main className="main-content">
        {renderContent()}
      </main>
    </div>
  );
}

export default App;
