import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const COLORS = ['#63b3ed','#7c3aed','#10b981','#ed8936','#f56565','#48bb78'];
const LABELS = { technology:'Tech', science:'Science', business:'Business', health:'Health', sports:'Sports', entertainment:'Entertainment' };

export default function NewsDistributionChart({ distribution, onSliceClick }) {
  const filtered = distribution.filter(d => d.count > 0);
  if (!filtered.length) {
    return (
      <div style={{ height:260, display:'flex', alignItems:'center', justifyContent:'center', color:'var(--text3)' }}>
        No data yet — refresh news
      </div>
    );
  }

  const data = {
    labels: filtered.map(d => LABELS[d.category] || d.category),
    datasets: [{
      data: filtered.map(d => d.count),
      backgroundColor: COLORS.slice(0, filtered.length),
      borderColor: 'rgba(255,255,255,0.08)',
      borderWidth: 2,
      hoverOffset: 8,
    }],
  };

  const options = {
    responsive: true, maintainAspectRatio: false,
    cutout: '65%',
    plugins: {
      legend: {
        position: 'bottom',
        labels: { color: '#8892a4', font: { size: 11 }, padding: 12, boxWidth: 12 },
      },
      tooltip: {
        backgroundColor: 'rgba(13,17,23,0.92)',
        titleColor: '#63b3ed', bodyColor: '#e8eaf0',
        borderColor: 'rgba(99,179,237,0.3)', borderWidth: 1,
        callbacks: { label: ctx => ` ${ctx.label}: ${ctx.parsed} articles` },
      },
    },
    onClick: (_, elements) => {
      if (elements.length && onSliceClick) {
        onSliceClick(filtered[elements[0].index].category);
      }
    },
  };

  return (
    <div className="chart-wrapper">
      <Doughnut data={data} options={options} />
    </div>
  );
}
