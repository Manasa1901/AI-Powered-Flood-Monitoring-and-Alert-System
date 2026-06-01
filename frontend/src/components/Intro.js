import React, { useState, useEffect } from 'react';

function Intro({ userData, onComplete }) {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      icon: '🌊',
      title: 'Welcome to AI Flood Prediction',
      description: `Hello ${userData.name}! Get real-time flood predictions powered by machine learning for Tamil Nadu.`,
      features: ['AI-Powered Predictions', 'Real-time Weather Data', 'Tamil Nadu Coverage']
    },
    {
      icon: '📊',
      title: 'Smart Dashboard',
      description: 'Monitor flood risks with interactive charts, predictions, and live weather updates.',
      features: ['7-Day Forecasts', 'Risk Level Indicators', 'Historical Data']
    },
    {
      icon: '🗺️',
      title: 'Interactive Map',
      description: 'View flood risk zones across Tamil Nadu with color-coded markers and real-time updates.',
      features: ['Live Risk Zones', 'GPS Integration', 'Citizen Reports']
    },
    {
      icon: '📸',
      title: 'AI Image Verification',
      description: 'Upload flood photos for instant AI-powered verification and contribute to community safety.',
      features: ['Photo Analysis', 'Confidence Scoring', 'Map Integration']
    },
    {
      icon: '🚨',
      title: 'Smart Alerts',
      description: 'Receive instant email notifications when high flood risk is detected in your area.',
      features: ['Email Alerts', 'Risk Notifications', 'Safety Tips']
    },
    {
      icon: '📞',
      title: 'Emergency Support',
      description: 'Quick access to Tamil Nadu emergency services and disaster management contacts.',
      features: ['24/7 Helplines', 'Local Authorities', 'Quick Response']
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const goToSlide = (index) => setCurrentSlide(index);
  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0a1929 0%, #1a2332 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem'
    }}>
      <div style={{
        maxWidth: '900px',
        width: '100%',
        background: 'rgba(26, 35, 50, 0.95)',
        borderRadius: '20px',
        padding: '3rem',
        boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
        border: '1px solid rgba(33, 150, 243, 0.3)'
      }}>
        {/* Carousel */}
        <div style={{ position: 'relative', minHeight: '400px' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '5rem', marginBottom: '1rem' }}>
              {slides[currentSlide].icon}
            </div>
            <h2 style={{ color: '#2196f3', fontSize: '2rem', marginBottom: '1rem' }}>
              {slides[currentSlide].title}
            </h2>
            <p style={{ color: '#ccc', fontSize: '1.1rem', marginBottom: '2rem', lineHeight: '1.6' }}>
              {slides[currentSlide].description}
            </p>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginBottom: '2rem' }}>
              {slides[currentSlide].features.map((feature, idx) => (
                <div key={idx} style={{
                  background: 'rgba(33, 150, 243, 0.1)',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '20px',
                  border: '1px solid rgba(33, 150, 243, 0.3)',
                  color: '#64b5f6',
                  fontSize: '0.9rem'
                }}>
                  ✓ {feature}
                </div>
              ))}
            </div>
          </div>

          {/* Navigation Arrows */}
          <button
            onClick={prevSlide}
            style={{
              position: 'absolute',
              left: '-20px',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'rgba(33, 150, 243, 0.3)',
              border: '1px solid #2196f3',
              color: '#fff',
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              cursor: 'pointer',
              fontSize: '1.5rem'
            }}
          >
            ‹
          </button>
          <button
            onClick={nextSlide}
            style={{
              position: 'absolute',
              right: '-20px',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'rgba(33, 150, 243, 0.3)',
              border: '1px solid #2196f3',
              color: '#fff',
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              cursor: 'pointer',
              fontSize: '1.5rem'
            }}
          >
            ›
          </button>
        </div>

        {/* Dots Indicator */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginBottom: '2rem' }}>
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => goToSlide(idx)}
              style={{
                width: currentSlide === idx ? '30px' : '10px',
                height: '10px',
                borderRadius: '5px',
                background: currentSlide === idx ? '#2196f3' : 'rgba(33, 150, 243, 0.3)',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.3s'
              }}
            />
          ))}
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <button
            onClick={onComplete}
            className="primary"
            style={{
              padding: '1rem 3rem',
              fontSize: '1.1rem',
              fontWeight: '600'
            }}
          >
            Enter Dashboard →
          </button>
          <button
            onClick={() => setCurrentSlide((currentSlide + 1) % slides.length)}
            style={{
              padding: '1rem 2rem',
              background: 'rgba(33, 150, 243, 0.2)',
              border: '1px solid #2196f3',
              color: '#2196f3',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: '600'
            }}
          >
            Next Feature
          </button>
        </div>

        <p style={{ textAlign: 'center', color: '#999', fontSize: '0.85rem', marginTop: '2rem' }}>
          Slide {currentSlide + 1} of {slides.length} • Auto-advancing every 5 seconds
        </p>
      </div>
    </div>
  );
}

export default Intro;
