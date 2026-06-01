import React, { useState } from 'react';

function UserProfile({ userData, onUpdate, onLogout }) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(userData);
  const [errors, setErrors] = useState({});

  const locations = [
    'Chennai - T Nagar', 'Chennai - Anna Nagar', 'Chennai - Velachery',
    'Chennai - Adyar', 'Chennai - Tambaram', 'Coimbatore', 'Madurai',
    'Tiruchirappalli', 'Salem', 'Tirunelveli'
  ];

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Name required';
    if (!formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) newErrors.email = 'Valid email required';
    if (!formData.phone.match(/^\d{10}$/)) newErrors.phone = '10 digits required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (validate()) {
      onUpdate(formData);
      setIsEditing(false);
      setShowDropdown(false);
    }
  };

  const handleCancel = () => {
    setFormData(userData);
    setIsEditing(false);
    setErrors({});
  };

  const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div style={{ position: 'relative', zIndex: 9999 }}>
      {/* Profile Button */}
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        style={{
          background: 'linear-gradient(135deg, #2196f3, #1976d2)',
          border: '2px solid rgba(255,255,255,0.3)',
          borderRadius: '50%',
          width: '50px',
          height: '50px',
          cursor: 'pointer',
          fontSize: '1.2rem',
          fontWeight: 'bold',
          color: '#fff',
          boxShadow: '0 4px 15px rgba(33, 150, 243, 0.5)',
          transition: 'all 0.3s',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
        onMouseEnter={(e) => {
          e.target.style.transform = 'scale(1.1)';
          e.target.style.boxShadow = '0 6px 20px rgba(33, 150, 243, 0.7)';
        }}
        onMouseLeave={(e) => {
          e.target.style.transform = 'scale(1)';
          e.target.style.boxShadow = '0 4px 15px rgba(33, 150, 243, 0.5)';
        }}
      >
        {getInitials(userData.name)}
      </button>

      {/* Dropdown Menu */}
      {showDropdown && (
        <>
          {/* Backdrop */}
          <div
            onClick={() => setShowDropdown(false)}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 1000
            }}
          />

          {/* Dropdown Card */}
          <div style={{
            position: 'absolute',
            top: '60px',
            right: 0,
            background: 'linear-gradient(135deg, rgba(26, 35, 50, 0.98), rgba(13, 71, 161, 0.95))',
            borderRadius: '16px',
            padding: '2rem',
            minWidth: '350px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(33, 150, 243, 0.5)',
            zIndex: 1001,
            backdropFilter: 'blur(10px)'
          }}>
            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: '1.5rem', paddingBottom: '1.5rem', borderBottom: '2px solid rgba(33, 150, 243, 0.3)' }}>
              <div style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #2196f3, #1976d2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '2rem',
                fontWeight: 'bold',
                margin: '0 auto 1rem',
                boxShadow: '0 8px 20px rgba(33, 150, 243, 0.5)',
                border: '3px solid rgba(255,255,255,0.3)'
              }}>
                {getInitials(userData.name)}
              </div>
              <h3 style={{ color: '#fff', margin: '0 0 0.5rem 0', fontSize: '1.3rem' }}>{userData.name}</h3>
              <p style={{ color: '#64b5f6', fontSize: '0.9rem', margin: 0 }}>👤 User Profile</p>
            </div>

            {/* Profile Details */}
            {!isEditing ? (
              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ marginBottom: '1.2rem', padding: '0.75rem', background: 'rgba(33, 150, 243, 0.1)', borderRadius: '8px', border: '1px solid rgba(33, 150, 243, 0.2)' }}>
                  <label style={{ color: '#64b5f6', fontSize: '0.85rem', display: 'block', marginBottom: '0.4rem', fontWeight: '600' }}>📧 Email</label>
                  <p style={{ color: '#fff', margin: 0, fontSize: '1rem', wordBreak: 'break-word' }}>{userData.email}</p>
                </div>
                <div style={{ marginBottom: '1.2rem', padding: '0.75rem', background: 'rgba(33, 150, 243, 0.1)', borderRadius: '8px', border: '1px solid rgba(33, 150, 243, 0.2)' }}>
                  <label style={{ color: '#64b5f6', fontSize: '0.85rem', display: 'block', marginBottom: '0.4rem', fontWeight: '600' }}>📱 Phone</label>
                  <p style={{ color: '#fff', margin: 0, fontSize: '1rem' }}>{userData.phone}</p>
                </div>
                <div style={{ padding: '0.75rem', background: 'rgba(33, 150, 243, 0.1)', borderRadius: '8px', border: '1px solid rgba(33, 150, 243, 0.2)' }}>
                  <label style={{ color: '#64b5f6', fontSize: '0.85rem', display: 'block', marginBottom: '0.4rem', fontWeight: '600' }}>📍 Location</label>
                  <p style={{ color: '#fff', margin: 0, fontSize: '1rem' }}>{userData.location}</p>
                </div>
              </div>
            ) : (
              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ color: '#64b5f6', fontSize: '0.85rem', display: 'block', marginBottom: '0.4rem', fontWeight: '600' }}>Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      background: 'rgba(255,255,255,0.1)',
                      border: `2px solid ${errors.name ? '#f44336' : 'rgba(33, 150, 243, 0.5)'}`,
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '1rem'
                    }}
                  />
                  {errors.name && <span style={{ color: '#f44336', fontSize: '0.8rem', marginTop: '0.25rem', display: 'block' }}>{errors.name}</span>}
                </div>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ color: '#64b5f6', fontSize: '0.85rem', display: 'block', marginBottom: '0.4rem', fontWeight: '600' }}>Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      background: 'rgba(255,255,255,0.1)',
                      border: `2px solid ${errors.email ? '#f44336' : 'rgba(33, 150, 243, 0.5)'}`,
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '1rem'
                    }}
                  />
                  {errors.email && <span style={{ color: '#f44336', fontSize: '0.8rem', marginTop: '0.25rem', display: 'block' }}>{errors.email}</span>}
                </div>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ color: '#64b5f6', fontSize: '0.85rem', display: 'block', marginBottom: '0.4rem', fontWeight: '600' }}>Phone</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      background: 'rgba(255,255,255,0.1)',
                      border: `2px solid ${errors.phone ? '#f44336' : 'rgba(33, 150, 243, 0.5)'}`,
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '1rem'
                    }}
                  />
                  {errors.phone && <span style={{ color: '#f44336', fontSize: '0.8rem', marginTop: '0.25rem', display: 'block' }}>{errors.phone}</span>}
                </div>
                <div>
                  <label style={{ color: '#64b5f6', fontSize: '0.85rem', display: 'block', marginBottom: '0.4rem', fontWeight: '600' }}>Location</label>
                  <select
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      background: 'rgba(255,255,255,0.1)',
                      border: '2px solid rgba(33, 150, 243, 0.5)',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '1rem'
                    }}
                  >
                    {locations.map(loc => <option key={loc} value={loc} style={{ background: '#1a2332' }}>{loc}</option>)}
                  </select>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {!isEditing ? (
                <>
                  <button
                    onClick={() => setIsEditing(true)}
                    style={{
                      background: 'linear-gradient(135deg, #2196f3, #1976d2)',
                      border: 'none',
                      color: '#fff',
                      padding: '0.9rem',
                      borderRadius: '10px',
                      cursor: 'pointer',
                      fontSize: '1rem',
                      fontWeight: '600',
                      transition: 'all 0.3s',
                      boxShadow: '0 4px 12px rgba(33, 150, 243, 0.4)'
                    }}
                    onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
                    onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
                  >
                    ✏️ Edit Profile
                  </button>
                  <button
                    onClick={onLogout}
                    style={{
                      background: 'linear-gradient(135deg, #f44336, #d32f2f)',
                      border: 'none',
                      color: '#fff',
                      padding: '0.9rem',
                      borderRadius: '10px',
                      cursor: 'pointer',
                      fontSize: '1rem',
                      fontWeight: '600',
                      transition: 'all 0.3s',
                      boxShadow: '0 4px 12px rgba(244, 67, 54, 0.4)'
                    }}
                    onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
                    onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
                  >
                    🚪 Logout
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={handleSave}
                    style={{
                      background: 'linear-gradient(135deg, #4caf50, #388e3c)',
                      border: 'none',
                      color: '#fff',
                      padding: '0.9rem',
                      borderRadius: '10px',
                      cursor: 'pointer',
                      fontSize: '1rem',
                      fontWeight: '600',
                      boxShadow: '0 4px 12px rgba(76, 175, 80, 0.4)'
                    }}
                  >
                    ✓ Save Changes
                  </button>
                  <button
                    onClick={handleCancel}
                    style={{
                      background: 'rgba(255,255,255,0.1)',
                      border: '2px solid rgba(255,255,255,0.3)',
                      color: '#fff',
                      padding: '0.9rem',
                      borderRadius: '10px',
                      cursor: 'pointer',
                      fontSize: '1rem',
                      fontWeight: '600'
                    }}
                  >
                    ✕ Cancel
                  </button>
                </>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default UserProfile;
