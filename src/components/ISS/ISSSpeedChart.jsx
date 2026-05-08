import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale,
  PointElement, LineElement, Title, Tooltip, Legend, Filler,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

export default function ISSSpeedChart({ speedHistory }) {
  const labels = speedHistory.map(s => s.time);
  const data = {
    labels,
    datasets: [{
      label: 'Speed (km/h)',
      data: speedHistory.map(s => s.speed),
      borderColor: '#63b3ed',
      backgroundColor: 'rgba(99,179,237,0.1)',
      borderWidth: 2,
      pointRadius: 3,
      pointBackgroundColor: '#63b3ed',
      tension: 0.4,
      fill: true,
    }],
  };
  const options = {
    responsive: true, maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(13,17,23,0.9)',
        titleColor: '#63b3ed', bodyColor: '#e8eaf0',
        borderColor: 'rgba(99,179,237,0.3)', borderWidth: 1,
        callbacks: { label: ctx => ` ${ctx.parsed.y.toLocaleString()} km/h` },
      },
    },
    scales: {
      x: {
        ticks: { color: '#8892a4', maxTicksLimit: 8, font: { size: 10 } },
        grid: { color: 'rgba(255,255,255,0.05)' },
      },
      y: {
        ticks: { color: '#8892a4', font: { size: 10 }, callback: v => v.toLocaleString() },
        grid: { color: 'rgba(255,255,255,0.05)' },
      },
    },
  };

  if (!speedHistory.length) {
    return (
      <div className="chart-wrapper" style={{display:'flex',alignItems:'center',justifyContent:'center'}}>
        <p style={{color:'var(--text3)'}}>Collecting speed data…</p>
      </div>
    );
  }

  return (
    <div className="chart-wrapper">
      <Line data={data} options={options} />
    </div>
  );
}
