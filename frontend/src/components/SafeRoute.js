import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, Polyline, Marker, useMap } from 'react-leaflet';
import axios from 'axios';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const API_URL = 'http://localhost:5000';

// Tamil Nadu major cities with coordinates
const TN_LOCATIONS = [
  { name: 'Chennai', lat: 13.0827, lng: 80.2707 },
  { name: 'Coimbatore', lat: 11.0168, lng: 76.9558 },
  { name: 'Madurai', lat: 9.9252, lng: 78.1198 },
  { name: 'Tiruchirappalli', lat: 10.7905, lng: 78.7047 },
  { name: 'Salem', lat: 11.6643, lng: 78.1460 },
  { name: 'Tirunelveli', lat: 8.7139, lng: 77.7567 },
  { name: 'Vellore', lat: 12.9165, lng: 79.1325 },
  { name: 'Erode', lat: 11.3410, lng: 77.7172 },
  { name: 'Thanjavur', lat: 10.7870, lng: 79.1378 },
  { name: 'Dindigul', lat: 10.3624, lng: 77.9695 },
  { name: 'Cuddalore', lat: 11.7480, lng: 79.7714 },
  { name: 'Kanchipuram', lat: 12.8185, lng: 79.6947 },
];

const greenIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41],
});

const blueIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41],
});

function FitBounds({ positions }) {
  const map = useMap();
  useEffect(() => {
    if (positions && positions.length > 1) {
      map.fitBounds(L.latLngBounds(positions), { padding: [60, 60] });
    }
  }, [positions, map]);
  return null;
}

function SafeRoute() {
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [route, setRoute] = useState(null);
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null); // { type, msg }
  const [routeInfo, setRouteInfo] = useState(null);

  useEffect(() => {
    axios.get(`${API_URL}/map-data`)
      .then(res => setZones(res.data))
      .catch(() => {});
  }, []);

  const getRiskColor = (risk) => ({ low: '#4caf50', medium: '#ffeb3b', high: '#f44336' }[risk] || '#4caf50');

  const getHighRiskZones = () => zones.filter(z => z.risk === 'high');

  // Check if a route segment passes near a flood zone
  const routePassesFloodZone = (coords) => {
    const highRisk = getHighRiskZones();
    for (const point of coords) {
      for (const zone of highRisk) {
        const dist = Math.sqrt(Math.pow(point[0] - zone.lat, 2) + Math.pow(point[1] - zone.lng, 2));
        if (dist < 0.3) return true; // ~33km threshold
      }
    }
    return false;
  };

  const fetchRoute = async (fromLoc, toLoc) => {
    // OSRM public API — free, no key needed
    const url = `https://router.project-osrm.org/route/v1/driving/${fromLoc.lng},${fromLoc.lat};${toLoc.lng},${toLoc.lat}?overview=full&geometries=geojson`;
    const res = await axios.get(url);
    const routeData = res.data.routes[0];
    const coords = routeData.geometry.coordinates.map(c => [c[1], c[0]]);
    const distKm = (routeData.distance / 1000).toFixed(1);
    const durMin = Math.round(routeData.duration / 60);
    return { coords, distKm, durMin };
  };

  const handleFindRoute = async () => {
    if (!origin || !destination) {
      setStatus({ type: 'warning', msg: '⚠️ Please select both origin and destination.' });
      return;
    }
    if (origin === destination) {
      setStatus({ type: 'warning', msg: '⚠️ Origin and destination cannot be the same.' });
      return;
    }

    setLoading(true);
    setRoute(null);
    setRouteInfo(null);
    setStatus(null);

    const fromLoc = TN_LOCATIONS.find(l => l.name === origin);
    const toLoc = TN_LOCATIONS.find(l => l.name === destination);

    try {
      const { coords, distKm, durMin } = await fetchRoute(fromLoc, toLoc);
      const hasFloodRisk = routePassesFloodZone(coords);

      setRoute(coords);
      setRouteInfo({ distKm, durMin, hasFloodRisk, from: origin, to: destination });
      setStatus(
        hasFloodRisk
          ? { type: 'warning', msg: '⚠️ Route passes near flood-risk zones. Exercise caution or consider delaying travel.' }
          : { type: 'success', msg: '✅ Route is clear of high-risk flood zones. Safe to travel.' }
      );
    } catch {
      setStatus({ type: 'error', msg: '❌ Could not fetch route. Check your connection and try again.' });
    } finally {
      setLoading(false);
    }
  };

  const fromLoc = TN_LOCATIONS.find(l => l.name === origin);
  const toLoc = TN_LOCATIONS.find(l => l.name === destination);

  return (
    <div className="card">
      <h2>🚗 Safe Route Finder</h2>
      <p style={{ color: '#78909c', fontSize: '0.88rem', marginBottom: '1.25rem' }}>
        Find the safest travel route avoiding flood-risk zones across Tamil Nadu.
      </p>

      {/* Controls */}
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1rem', alignItems: 'flex-end' }}>
        <div style={{ flex: 1, minWidth: 160 }}>
          <label className="field-label">📍 Origin</label>
          <select value={origin} onChange={e => setOrigin(e.target.value)} style={{ marginBottom: 0 }}>
            <option value="">Select city...</option>
            {TN_LOCATIONS.map(l => (
              <option key={l.name} value={l.name}>{l.name}</option>
            ))}
          </select>
        </div>
        <div style={{ flex: 1, minWidth: 160 }}>
          <label className="field-label">🏁 Destination</label>
          <select value={destination} onChange={e => setDestination(e.target.value)} style={{ marginBottom: 0 }}>
            <option value="">Select city...</option>
            {TN_LOCATIONS.map(l => (
              <option key={l.name} value={l.name}>{l.name}</option>
            ))}
          </select>
        </div>
        <button
          className="primary"
          onClick={handleFindRoute}
          disabled={loading}
          style={{ padding: '0.7rem 1.5rem', whiteSpace: 'nowrap' }}
        >
          {loading ? '⏳ Finding...' : '🔍 Find Safe Route'}
        </button>
      </div>

      {/* Status Banner */}
      {status && (
        <div className={`msg-banner ${status.type}`} style={{ marginBottom: '1rem' }}>
          {status.msg}
        </div>
      )}

      {/* Route Info */}
      {routeInfo && (
        <div style={{
          display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1rem',
          padding: '0.85rem 1rem', background: 'rgba(33,150,243,0.06)',
          border: '1px solid rgba(33,150,243,0.15)', borderRadius: '10px',
        }}>
          <span style={{ color: '#90caf9', fontSize: '0.88rem' }}>
            📍 <strong>{routeInfo.from}</strong> → <strong>{routeInfo.to}</strong>
          </span>
          <span style={{ color: '#90caf9', fontSize: '0.88rem' }}>🛣️ {routeInfo.distKm} km</span>
          <span style={{ color: '#90caf9', fontSize: '0.88rem' }}>⏱️ ~{routeInfo.durMin} min</span>
          <span style={{
            fontSize: '0.82rem', fontWeight: 600, padding: '0.15rem 0.6rem', borderRadius: '12px',
            background: routeInfo.hasFloodRisk ? 'rgba(255,152,0,0.15)' : 'rgba(76,175,80,0.15)',
            color: routeInfo.hasFloodRisk ? '#ffa726' : '#66bb6a',
            border: `1px solid ${routeInfo.hasFloodRisk ? 'rgba(255,152,0,0.3)' : 'rgba(76,175,80,0.3)'}`,
          }}>
            {routeInfo.hasFloodRisk ? '⚠️ Flood Risk Nearby' : '✅ Safe Route'}
          </span>
        </div>
      )}

      {/* Map */}
      <div style={{ height: '520px', borderRadius: '10px', overflow: 'hidden' }}>
        <MapContainer center={[11.1271, 78.6569]} zoom={7} style={{ height: '100%', width: '100%' }}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

          {/* Flood zones */}
          {zones.map((zone, idx) => (
            <CircleMarker
              key={idx}
              center={[zone.lat, zone.lng]}
              radius={14}
              fillColor={getRiskColor(zone.risk)}
              color="#fff"
              weight={1.5}
              opacity={0.9}
              fillOpacity={0.5}
            >
              <Popup>
                <strong>{zone.name}</strong><br />
                Risk: {zone.risk?.toUpperCase()}<br />
                Score: {zone.score}
              </Popup>
            </CircleMarker>
          ))}

          {/* Route polyline */}
          {route && (
            <>
              <Polyline
                positions={route}
                color={routeInfo?.hasFloodRisk ? '#ffa726' : '#42a5f5'}
                weight={5}
                opacity={0.85}
              />
              <FitBounds positions={route} />
            </>
          )}

          {/* Origin / Destination markers */}
          {fromLoc && route && (
            <Marker position={[fromLoc.lat, fromLoc.lng]} icon={greenIcon}>
              <Popup>🟢 Start: {fromLoc.name}</Popup>
            </Marker>
          )}
          {toLoc && route && (
            <Marker position={[toLoc.lat, toLoc.lng]} icon={blueIcon}>
              <Popup>🔵 End: {toLoc.name}</Popup>
            </Marker>
          )}
        </MapContainer>
      </div>

      {/* Legend */}
      <div style={{
        marginTop: '0.85rem', display: 'flex', gap: '1.5rem', flexWrap: 'wrap',
        justifyContent: 'center', padding: '0.65rem', background: 'rgba(13,27,46,0.5)',
        borderRadius: '8px', fontSize: '0.82rem', color: '#90a4ae',
      }}>
        <span><span style={{ color: '#66bb6a' }}>●</span> Low Risk</span>
        <span><span style={{ color: '#ffd54f' }}>●</span> Medium Risk</span>
        <span><span style={{ color: '#ef5350' }}>●</span> High Risk</span>
        <span><span style={{ color: '#42a5f5' }}>━</span> Safe Route</span>
        <span><span style={{ color: '#ffa726' }}>━</span> Caution Route</span>
        <span>🟢 Origin &nbsp; 🔵 Destination</span>
      </div>
    </div>
  );
}

export default SafeRoute;
