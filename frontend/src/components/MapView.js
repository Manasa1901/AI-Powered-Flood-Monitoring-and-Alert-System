import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, Marker } from 'react-leaflet';
import axios from 'axios';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const API_URL = 'http://localhost:5000';

// Custom marker icons
const redIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const orangeIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

function MapView() {
  const [zones, setZones] = useState([]);
  const [reports, setReports] = useState([]);

  useEffect(() => {
    fetchMapData();
    fetchReports();
    const interval = setInterval(() => {
      fetchReports();
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchMapData = async () => {
    try {
      const res = await axios.get(`${API_URL}/map-data`);
      setZones(res.data);
    } catch (err) {
      console.error('Error fetching map data:', err);
    }
  };

  const fetchReports = async () => {
    try {
      const res = await axios.get(`${API_URL}/flood-reports`);
      setReports(res.data);
    } catch (err) {
      console.error('Error fetching reports:', err);
    }
  };

  const getRiskColor = (risk) => {
    const colors = { low: '#4caf50', medium: '#ffeb3b', high: '#f44336' };
    return colors[risk] || '#4caf50';
  };

  return (
    <div className="card">
      <h2>🗺️ Flood Risk Map - Tamil Nadu</h2>
      <div style={{ height: '600px', borderRadius: '8px', overflow: 'hidden' }}>
        <MapContainer center={[11.1271, 78.6569]} zoom={7} style={{ height: '100%', width: '100%' }}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          
          {/* Prediction zones */}
          {zones.map((zone, idx) => (
            <CircleMarker
              key={`zone-${idx}`}
              center={[zone.lat, zone.lng]}
              radius={15}
              fillColor={getRiskColor(zone.risk)}
              color="#fff"
              weight={2}
              opacity={1}
              fillOpacity={0.7}
            >
              <Popup>
                <strong>{zone.name}</strong><br/>
                Risk: {zone.risk.toUpperCase()}<br/>
                Score: {zone.score}<br/>
                <em>Prediction Model</em>
              </Popup>
            </CircleMarker>
          ))}
          
          {/* Citizen reports */}
          {reports.map((report, idx) => (
            <Marker
              key={`report-${idx}`}
              position={[report.latitude, report.longitude]}
              icon={report.verified ? redIcon : orangeIcon}
            >
              <Popup>
                <strong>{report.verified ? '🔴 AI-Confirmed Flood' : '🟠 Unverified Report'}</strong><br/>
                Location: {report.location}<br/>
                Severity: {report.severity}<br/>
                {report.image_analyzed && (
                  <>
                    Confidence: {(report.confidence * 100).toFixed(1)}%<br/>
                  </>
                )}
                Status: {report.status}<br/>
                Time: {new Date(report.timestamp).toLocaleString()}
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
      <div style={{ marginTop: '1rem', display: 'flex', gap: '1.5rem', justifyContent: 'center', flexWrap: 'wrap', padding: '0.75rem', background: 'rgba(13,27,46,0.5)', borderRadius: '10px', fontSize: '0.85rem', color: '#90a4ae' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><span style={{ color: '#66bb6a', fontSize: '1.1rem' }}>●</span> Low Risk</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><span style={{ color: '#ffd54f', fontSize: '1.1rem' }}>●</span> Medium Risk</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><span style={{ color: '#ef5350', fontSize: '1.1rem' }}>●</span> High Risk</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>🟠 Unverified Report</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>🔴 AI-Confirmed Flood</div>
      </div>
    </div>
  );
}

export default MapView;
