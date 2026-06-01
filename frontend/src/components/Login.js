import React, { useState } from 'react';
import './Auth.css';

const LOCATIONS = [
  'Chennai - T Nagar', 'Chennai - Anna Nagar', 'Chennai - Velachery',
  'Chennai - Adyar', 'Chennai - Tambaram', 'Coimbatore', 'Madurai',
  'Tiruchirappalli', 'Salem', 'Tirunelveli',
];

function Login({ onLogin, onSwitchToRegister }) {
  const [form, setForm] = useState({ email: '', password: '', remember: false });
  const [errors, setErrors] = useState({});
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const set = (field, val) => {
    setForm(f => ({ ...f, [field]: val }));
    if (errors[field]) setErrors(e => ({ ...e, [field]: '' }));
  };

  const validate = () => {
    const e = {};
    if (!form.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) e.email = 'Enter a valid email address';
    if (form.password.length < 6) e.password = 'Password must be at least 6 characters';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    await new Promise(r => setTimeout(r, 900));
    const users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
    // legacy single-user support
    const legacy = JSON.parse(localStorage.getItem('registeredUser') || 'null');
    if (legacy) users.push(legacy);
    const match = users.find(u => u.email === form.email && u.password === form.password);
    if (match) {
      if (form.remember) localStorage.setItem('rememberedEmail', form.email);
      onLogin(match);
    } else {
      setErrors({ submit: 'Invalid email or password. Please try again.' });
    }
    setLoading(false);
  };

  const handleDemoLogin = () => {
    onLogin({ name: 'Demo User', email: 'demo@floodpredictor.in', phone: '9999999999', location: 'Chennai - T Nagar' });
  };

  return (
    <div className="auth-page">
      {/* Left branding panel */}
      <div className="auth-brand">
        <div className="auth-brand-bg" />
        <div className="auth-brand-content">
          <div className="auth-logo">🌊</div>
          <h1 className="auth-brand-title">AI Flood Predictor</h1>
          <p className="auth-brand-sub">Smart City Disaster Management</p>
          <div className="auth-brand-divider" />
          <div className="auth-features">
            {[
              { icon: '🤖', text: 'AI-powered flood prediction' },
              { icon: '🗺️', text: 'Real-time risk zone mapping' },
              { icon: '🚨', text: 'Instant flood alerts' },
              { icon: '📸', text: 'Citizen flood reporting' },
            ].map((f, i) => (
              <div key={i} className="auth-feature-item">
                <span className="auth-feature-icon">{f.icon}</span>
                <span>{f.text}</span>
              </div>
            ))}
          </div>
          <div className="auth-brand-badge">🛰️ Tamil Nadu · Live Monitoring</div>
        </div>
        <div className="auth-wave">
          <svg viewBox="0 0 100 100" preserveAspectRatio="none">
            <path d="M100,0 L100,100 L0,100 Q20,60 0,0 Z" fill="rgba(7,13,26,0.97)" />
          </svg>
        </div>
      </div>

      {/* Right form panel */}
      <div className="auth-form-panel">
        <div className="auth-form-box">
          <div className="auth-form-header">
            <h2>Welcome back</h2>
            <p>Sign in to your account to continue</p>
          </div>

          <form onSubmit={handleSubmit} noValidate>
            <div className={`auth-field ${errors.email ? 'has-error' : ''}`}>
              <label>Email Address</label>
              <div className="auth-input-wrap">
                <span className="auth-input-icon">✉️</span>
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={e => set('email', e.target.value)}
                  autoComplete="email"
                />
              </div>
              {errors.email && <span className="auth-error">{errors.email}</span>}
            </div>

            <div className={`auth-field ${errors.password ? 'has-error' : ''}`}>
              <label>Password</label>
              <div className="auth-input-wrap">
                <span className="auth-input-icon">🔒</span>
                <input
                  type={showPass ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={e => set('password', e.target.value)}
                  autoComplete="current-password"
                />
                <button type="button" className="auth-toggle-pass" onClick={() => setShowPass(s => !s)}>
                  {showPass ? '🙈' : '👁️'}
                </button>
              </div>
              {errors.password && <span className="auth-error">{errors.password}</span>}
            </div>

            <div className="auth-row">
              <label className="auth-checkbox">
                <input type="checkbox" checked={form.remember} onChange={e => set('remember', e.target.checked)} />
                <span className="auth-checkmark" />
                Remember me
              </label>
              <button type="button" className="auth-link-btn">Forgot password?</button>
            </div>

            {errors.submit && (
              <div className="auth-submit-error">{errors.submit}</div>
            )}

            <button type="submit" className="auth-submit-btn" disabled={loading}>
              {loading ? <span className="auth-spinner" /> : null}
              {loading ? 'Signing in...' : 'Sign In →'}
            </button>
          </form>

          <div className="auth-divider"><span>or</span></div>

          <button type="button" className="auth-submit-btn" onClick={handleDemoLogin}
            style={{ background: 'rgba(33,150,243,0.12)', border: '1px solid rgba(33,150,243,0.3)', color: '#42a5f5', boxShadow: 'none', marginBottom: '1rem' }}>
            🚀 Continue as Demo User
          </button>

          <p className="auth-switch">
            Don't have an account?{' '}
            <button type="button" className="auth-link-btn bold" onClick={onSwitchToRegister}>
              Create one free
            </button>
          </p>

          <p className="auth-hint">
            🔐 Your data is encrypted and used only for flood alerts
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
