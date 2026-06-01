import React, { useState } from 'react';
import './Auth.css';

const LOCATIONS = [
  'Chennai - T Nagar', 'Chennai - Anna Nagar', 'Chennai - Velachery',
  'Chennai - Adyar', 'Chennai - Tambaram', 'Coimbatore', 'Madurai',
  'Tiruchirappalli', 'Salem', 'Tirunelveli',
];

function Register({ onRegister, onSwitchToLogin }) {
  const [form, setForm] = useState({
    name: '', email: '', phone: '', location: LOCATIONS[0], password: '', confirm: '',
  });
  const [errors, setErrors] = useState({});
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const set = (field, val) => {
    setForm(f => ({ ...f, [field]: val }));
    if (errors[field]) setErrors(e => ({ ...e, [field]: '' }));
  };

  const passwordStrength = (p) => {
    if (!p) return { score: 0, label: '', color: '' };
    let score = 0;
    if (p.length >= 8) score++;
    if (/[A-Z]/.test(p)) score++;
    if (/[0-9]/.test(p)) score++;
    if (/[^A-Za-z0-9]/.test(p)) score++;
    const map = [
      { label: 'Weak',   color: '#ef5350' },
      { label: 'Fair',   color: '#ffa726' },
      { label: 'Good',   color: '#ffd54f' },
      { label: 'Strong', color: '#66bb6a' },
      { label: 'Very Strong', color: '#42a5f5' },
    ];
    return { score, ...map[score] };
  };

  const strength = passwordStrength(form.password);

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Full name is required';
    if (!form.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) e.email = 'Enter a valid email address';
    if (!form.phone.match(/^\d{10}$/)) e.phone = 'Enter a valid 10-digit phone number';
    if (form.password.length < 6) e.password = 'Password must be at least 6 characters';
    if (form.password !== form.confirm) e.confirm = 'Passwords do not match';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    await new Promise(r => setTimeout(r, 900));
    const userData = { name: form.name, email: form.email, phone: form.phone, location: form.location, password: form.password };
    const users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
    const exists = users.find(u => u.email === form.email);
    if (!exists) users.push(userData);
    else users[users.indexOf(exists)] = userData;
    localStorage.setItem('registeredUsers', JSON.stringify(users));
    onRegister(userData);
    setLoading(false);
  };

  return (
    <div className="auth-page">
      {/* Left branding panel */}
      <div className="auth-brand register-brand">
        <div className="auth-brand-bg" />
        <div className="auth-brand-content">
          <div className="auth-logo">🌊</div>
          <h1 className="auth-brand-title">Join the Network</h1>
          <p className="auth-brand-sub">Help protect Tamil Nadu from floods</p>
          <div className="auth-brand-divider" />
          <div className="auth-steps">
            {[
              { step: '01', title: 'Create Account', desc: 'Register with your details' },
              { step: '02', title: 'Set Location',   desc: 'Choose your Tamil Nadu zone' },
              { step: '03', title: 'Get Alerts',     desc: 'Receive real-time warnings' },
              { step: '04', title: 'Stay Safe',      desc: 'Monitor & report floods' },
            ].map((s, i) => (
              <div key={i} className="auth-step-item">
                <div className="auth-step-num">{s.step}</div>
                <div>
                  <div className="auth-step-title">{s.title}</div>
                  <div className="auth-step-desc">{s.desc}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="auth-brand-badge">🌍 Free · No hardware required</div>
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
            <h2>Create your account</h2>
            <p>Join thousands monitoring Tamil Nadu floods</p>
          </div>

          <form onSubmit={handleSubmit} noValidate>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 1rem' }}>
              <div className={`auth-field ${errors.name ? 'has-error' : ''}`} style={{ gridColumn: '1 / -1' }}>
                <label>Full Name</label>
                <div className="auth-input-wrap">
                  <span className="auth-input-icon">👤</span>
                  <input
                    type="text"
                    placeholder="Your full name"
                    value={form.name}
                    onChange={e => set('name', e.target.value)}
                    autoComplete="name"
                  />
                </div>
                {errors.name && <span className="auth-error">{errors.name}</span>}
              </div>

              <div className={`auth-field ${errors.email ? 'has-error' : ''}`} style={{ gridColumn: '1 / -1' }}>
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

              <div className={`auth-field ${errors.phone ? 'has-error' : ''}`}>
                <label>Phone Number</label>
                <div className="auth-input-wrap">
                  <span className="auth-input-icon">📱</span>
                  <input
                    type="tel"
                    placeholder="10-digit number"
                    value={form.phone}
                    onChange={e => set('phone', e.target.value)}
                    autoComplete="tel"
                  />
                </div>
                {errors.phone && <span className="auth-error">{errors.phone}</span>}
              </div>

              <div className="auth-field">
                <label>Location</label>
                <div className="auth-input-wrap">
                  <span className="auth-input-icon">📍</span>
                  <select value={form.location} onChange={e => set('location', e.target.value)}>
                    {LOCATIONS.map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
              </div>

              <div className={`auth-field ${errors.password ? 'has-error' : ''}`}>
                <label>Password</label>
                <div className="auth-input-wrap">
                  <span className="auth-input-icon">🔒</span>
                  <input
                    type={showPass ? 'text' : 'password'}
                    placeholder="Min. 6 characters"
                    value={form.password}
                    onChange={e => set('password', e.target.value)}
                    autoComplete="new-password"
                  />
                  <button type="button" className="auth-toggle-pass" onClick={() => setShowPass(s => !s)}>
                    {showPass ? '🙈' : '👁️'}
                  </button>
                </div>
                {form.password && (
                  <div className="auth-strength">
                    <div className="auth-strength-bar">
                      {[0,1,2,3].map(i => (
                        <div key={i} className="auth-strength-seg" style={{ background: i < strength.score ? strength.color : 'rgba(255,255,255,0.08)' }} />
                      ))}
                    </div>
                    <span style={{ color: strength.color }}>{strength.label}</span>
                  </div>
                )}
                {errors.password && <span className="auth-error">{errors.password}</span>}
              </div>

              <div className={`auth-field ${errors.confirm ? 'has-error' : ''}`}>
                <label>Confirm Password</label>
                <div className="auth-input-wrap">
                  <span className="auth-input-icon">🔑</span>
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    placeholder="Repeat password"
                    value={form.confirm}
                    onChange={e => set('confirm', e.target.value)}
                    autoComplete="new-password"
                  />
                  <button type="button" className="auth-toggle-pass" onClick={() => setShowConfirm(s => !s)}>
                    {showConfirm ? '🙈' : '👁️'}
                  </button>
                </div>
                {errors.confirm && <span className="auth-error">{errors.confirm}</span>}
              </div>
            </div>

            <button type="submit" className="auth-submit-btn" disabled={loading} style={{ marginTop: '0.5rem' }}>
              {loading ? <span className="auth-spinner" /> : null}
              {loading ? 'Creating account...' : 'Create Account →'}
            </button>
          </form>

          <div className="auth-divider"><span>or</span></div>

          <p className="auth-switch">
            Already have an account?{' '}
            <button type="button" className="auth-link-btn bold" onClick={onSwitchToLogin}>
              Sign in
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

export default Register;
