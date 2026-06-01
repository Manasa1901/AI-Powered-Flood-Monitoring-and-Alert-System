import React, { useEffect, useState } from 'react';
import { Line, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend } from 'chart.js';
import axios from 'axios';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend);

const API_URL = 'http://localhost:5000';

function Charts() {
  const [predictions, setPredictions] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await axios.post(`${API_URL}/predict-flood`, { location: 'Zone A - Downtown', days: 7 });
      setPredictions(res.data.predictions);
    } catch (err) {
      console.error('Error:', err);
    }
  };

  const riskData = {
    labels: predictions.map(p => p.date),
    datasets: [{
      label: 'Risk Score',
      data: predictions.map(p => p.riskScore),
      borderColor: '#2196f3',
      backgroundColor: 'rgba(33, 150, 243, 0.2)',
      tension: 0.4
    }]
  };

  const weatherData = {
    labels: predictions.map(p => p.date),
    datasets: [
      { label: 'Precipitation (mm)', data: predictions.map(p => p.precipitation), backgroundColor: '#42a5f5' },
      { label: 'Humidity (%)', data: predictions.map(p => p.humidity), backgroundColor: '#64b5f6' }
    ]
  };

  const options = {
    responsive: true,
    plugins: { legend: { labels: { color: '#fff' } } },
    scales: { x: { ticks: { color: '#fff' } }, y: { ticks: { color: '#fff' } } }
  };

  return (
    <div style={{ display: 'grid', gap: '2rem' }}>
      <div className="card">
        <h2>📈 Risk Score Trend</h2>
        <Line data={riskData} options={options} />
      </div>
      <div className="card">
        <h2>📊 Weather Parameters</h2>
        <Bar data={weatherData} options={options} />
      </div>
    </div>
  );
}

export default Charts;
