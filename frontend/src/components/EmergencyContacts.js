import React from 'react';

const contacts = [
  { name: 'Emergency Services', phone: '112', icon: '🚨', color: '#ef5350' },
  { name: 'Tamil Nadu Disaster Management', phone: '044-28524161', icon: '⚠️', color: '#ffa726' },
  { name: 'Chennai Flood Control', phone: '044-25619206', icon: '🌊', color: '#42a5f5' },
  { name: 'State Emergency Operations', phone: '044-28524161', icon: '🚨', color: '#ef5350' },
  { name: 'Chennai Corporation', phone: '044-25619200', icon: '🏛️', color: '#90caf9' },
  { name: 'Ambulance Service', phone: '108', icon: '🚑', color: '#66bb6a' },
];

function EmergencyContacts() {
  return (
    <div className="card">
      <h2>📞 Emergency Contacts</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
        {contacts.map((contact, idx) => (
          <div
            key={idx}
            style={{
              background: 'rgba(13, 27, 46, 0.6)',
              border: '1px solid rgba(33, 150, 243, 0.15)',
              borderRadius: '12px',
              padding: '1.5rem',
              textAlign: 'center',
              transition: 'all 0.2s',
              cursor: 'pointer',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = contact.color;
              e.currentTarget.style.boxShadow = `0 0 20px ${contact.color}33`;
              e.currentTarget.style.transform = 'translateY(-4px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'rgba(33, 150, 243, 0.15)';
              e.currentTarget.style.boxShadow = 'none';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>{contact.icon}</div>
            <h3 style={{ fontSize: '0.95rem', marginBottom: '0.75rem', color: '#e2e8f0' }}>{contact.name}</h3>
            <div style={{ fontSize: '1.4rem', fontWeight: 700, color: contact.color, marginBottom: '0.75rem' }}>
              {contact.phone}
            </div>
            <a
              href={`tel:${contact.phone}`}
              style={{
                display: 'inline-block',
                background: `${contact.color}22`,
                color: contact.color,
                border: `1px solid ${contact.color}55`,
                padding: '0.4rem 1.2rem',
                borderRadius: '20px',
                fontSize: '0.8rem',
                fontWeight: 600,
                textDecoration: 'none',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = contact.color;
                e.currentTarget.style.color = '#fff';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = `${contact.color}22`;
                e.currentTarget.style.color = contact.color;
              }}
            >
              📞 Call Now
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}

export default EmergencyContacts;
