import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:5000';

function ReportFlooding() {
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [location, setLocation] = useState({ lat: '', lng: '' });
  const [manualLocation, setManualLocation] = useState(false);
  const [severity, setSeverity] = useState('Medium');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [verificationResult, setVerificationResult] = useState(null);

  useEffect(() => {
    getGPSLocation();
  }, []);

  const getGPSLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude.toFixed(6),
            lng: position.coords.longitude.toFixed(6)
          });
        },
        (error) => {
          console.error('Location error:', error);
          setMessage('⚠️ GPS detection failed. Please enter location manually.');
          setManualLocation(true);
        }
      );
    } else {
      setMessage('⚠️ GPS not supported. Please enter location manually.');
      setManualLocation(true);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
      setVerificationResult(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const lat = parseFloat(location.lat);
    const lng = parseFloat(location.lng);
    
    if (!lat || !lng || isNaN(lat) || isNaN(lng)) {
      setMessage('❌ Please provide valid GPS coordinates (latitude and longitude).');
      return;
    }

    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      setMessage('❌ Invalid coordinates. Lat: -90 to 90, Lng: -180 to 180.');
      return;
    }

    setLoading(true);
    setMessage('🔄 Submitting report and analyzing image...');
    setVerificationResult(null);

    try {
      const formData = new FormData();
      if (image) {
        formData.append('image', image);
      }
      formData.append('latitude', lat);
      formData.append('longitude', lng);
      formData.append('severity', severity);

      const res = await axios.post(`${API_URL}/verify-flood-image`, formData);

      setVerificationResult(res.data);
      
      if (res.data.verified) {
        setMessage(`✅ Flood confirmed by AI! Confidence: ${(res.data.confidence * 100).toFixed(1)}%. Check map for red marker.`);
      } else if (res.data.image_analyzed) {
        setMessage(`⚠️ Image verification inconclusive. Confidence: ${(res.data.confidence * 100).toFixed(1)}%. Check map for orange marker.`);
      } else {
        setMessage('✅ Report submitted successfully (no image provided). Check map for marker.');
      }
      
      // Reset form
      setImage(null);
      setImagePreview(null);
      if (!manualLocation) {
        getGPSLocation();
      }
    } catch (err) {
      console.error('Error:', err);
      setMessage('❌ Error submitting report. Please ensure backend is running on port 5000.');
    }
    setLoading(false);
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
      <div className="card">
        <h2>📸 Report Flooding</h2>
        <form onSubmit={handleSubmit}>
          <label className="field-label">Upload Photo (Optional)</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            style={{ marginBottom: '1rem' }}
          />
          
          {imagePreview && (
            <div style={{ marginBottom: '1rem' }}>
              <img 
                src={imagePreview} 
                alt="Preview" 
                style={{ width: '100%', maxHeight: '300px', objectFit: 'cover', borderRadius: '8px' }}
              />
            </div>
          )}

          <label className="field-label">Flood Severity</label>
          <select value={severity} onChange={(e) => setSeverity(e.target.value)}>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
            <option value="Critical">Critical</option>
          </select>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <label className="field-label" style={{ marginBottom: 0 }}>GPS Location</label>
            <button 
              type="button"
              onClick={() => setManualLocation(!manualLocation)}
              style={{ 
                background: 'rgba(33, 150, 243, 0.2)', 
                border: '1px solid #2196f3',
                color: '#2196f3',
                padding: '0.3rem 0.8rem',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '0.85rem'
              }}
            >
              {manualLocation ? '📍 Use GPS' : '✏️ Manual Entry'}
            </button>
          </div>

          {manualLocation ? (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
              <div>
                <input
                  type="number"
                  step="any"
                  placeholder="Latitude (e.g., 13.0418)"
                  value={location.lat}
                  onChange={(e) => setLocation({ ...location, lat: e.target.value })}
                  style={{ marginBottom: 0 }}
                />
              </div>
              <div>
                <input
                  type="number"
                  step="any"
                  placeholder="Longitude (e.g., 80.2341)"
                  value={location.lng}
                  onChange={(e) => setLocation({ ...location, lng: e.target.value })}
                  style={{ marginBottom: 0 }}
                />
              </div>
            </div>
          ) : (
            <input
              type="text"
              value={location.lat && location.lng ? `${location.lat}, ${location.lng}` : 'Detecting GPS...'}
              disabled
              style={{ background: 'rgba(255,255,255,0.05)', marginBottom: '1rem' }}
            />
          )}

          <button 
            type="submit" 
            className="primary" 
            disabled={loading || !location.lat || !location.lng}
            style={{ width: '100%', marginTop: '1rem' }}
          >
            {loading ? '⏳ Analyzing...' : '📤 Submit Report'}
          </button>

          {message && (
            <div className={`msg-banner ${
              message.includes('✅') ? 'success' :
              message.includes('⚠️') ? 'warning' :
              message.includes('🔄') ? 'info' : 'error'
            }`}>
              {message}
            </div>
          )}
        </form>
      </div>

      <div className="card">
        <h2>🤖 AI Verification Status</h2>
        {verificationResult ? (
          <div>
            <div style={{ 
              padding: '1.5rem', 
              background: verificationResult.verified ? 'rgba(76, 175, 80, 0.1)' : 'rgba(255, 152, 0, 0.1)',
              borderRadius: '8px',
              marginBottom: '1rem'
            }}>
              <h3 style={{ 
                color: verificationResult.verified ? '#4caf50' : '#ff9800',
                marginBottom: '1rem'
              }}>
                {verificationResult.verified ? '✅ Flood Detected' : '⚠️ Unverified'}
              </h3>
              <div style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>
                <strong>Confidence:</strong> {(verificationResult.confidence * 100).toFixed(1)}%
              </div>
              <div style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>
                <strong>Status:</strong> {verificationResult.status}
              </div>
              <div style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>
                <strong>Marker:</strong> {verificationResult.verified ? '🔴 Red Pin' : '🟠 Orange Pin'}
              </div>
            </div>

            <div className="card" style={{ background: 'rgba(33, 150, 243, 0.1)' }}>
              <h3>📍 Report Details</h3>
              <p><strong>Location:</strong> {verificationResult.location}</p>
              <p><strong>GPS:</strong> {verificationResult.latitude.toFixed(4)}, {verificationResult.longitude.toFixed(4)}</p>
              <p><strong>Severity:</strong> {verificationResult.severity}</p>
              <p><strong>Timestamp:</strong> {new Date(verificationResult.timestamp).toLocaleString()}</p>
              {verificationResult.image_analyzed && (
                <p><strong>Image Analysis:</strong> Completed</p>
              )}
            </div>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#64b5f6' }}>
            <p>Upload an image and submit to see AI verification results</p>
            <div style={{ marginTop: '2rem', fontSize: '0.9rem', color: '#999' }}>
              <p>🔍 AI analyzes images for:</p>
              <ul style={{ listStyle: 'none', padding: 0, marginTop: '1rem' }}>
                <li>• Water presence</li>
                <li>• Road flooding</li>
                <li>• Flood severity indicators</li>
              </ul>
            </div>
          </div>
        )}

        <div className="card" style={{ background: 'rgba(33, 150, 243, 0.05)', marginTop: '1rem' }}>
          <h3>🗺️ Map Marker Legend</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '1rem' }}>
            <div><span style={{ color: '#4caf50' }}>🟢</span> Prediction Only</div>
            <div><span style={{ color: '#ff9800' }}>🟠</span> Citizen Report (Unverified)</div>
            <div><span style={{ color: '#f44336' }}>🔴</span> AI-Confirmed Flood</div>
          </div>
          <p style={{ marginTop: '1rem', fontSize: '0.85rem', color: '#999' }}>Check Map View tab to see your report marker</p>
        </div>
      </div>
    </div>
  );
}

export default ReportFlooding;
