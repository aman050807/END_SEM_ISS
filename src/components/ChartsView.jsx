import React, { useEffect, useState } from 'react';
import ISSMap from './ISS/ISSMap';
import ISSSpeedChart from './ISS/ISSSpeedChart';
import NewsDistributionChart from './News/NewsDistributionChart';
import { useNews, CATEGORIES } from '../hooks/useNews';
import toast from 'react-hot-toast';

export default function ChartsView({ issData }) {
  const { fetchAll, getDistribution, getFiltered, articles } = useNews();
  const [filteredCat, setFilteredCat] = useState(null);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handleSliceClick = (cat) => {
    setFilteredCat(cat === filteredCat ? null : cat);
    toast(`Filtered to: ${cat}`, { icon: '📊' });
  };

  const displayArticles = filteredCat ? getFiltered(filteredCat) : CATEGORIES.flatMap(c => (articles[c] || []).slice(0, 2));

  return (
    <div className="section fade-in">
      <div className="section-heading">📊 Charts &amp; Visuals</div>

      <div className="grid-2" style={{ marginBottom: 24 }}>
        {/* Speed Chart */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">⚡ ISS Speed Over Time</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text3)' }}>Last {issData.speedHistory?.length || 0} readings</span>
          </div>
          <ISSSpeedChart speedHistory={issData.speedHistory || []} />
          <div style={{ marginTop: 12, display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            {issData.speedHistory?.length > 0 && (
              <>
                <div className="stat-tile" style={{ flex: 1, padding: '10px 14px' }}>
                  <div className="stat-label">Current</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--accent)' }}>
                    {issData.speed?.toLocaleString()} km/h
                  </div>
                </div>
                <div className="stat-tile" style={{ flex: 1, padding: '10px 14px' }}>
                  <div className="stat-label">Average</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--accent2)' }}>
                    {Math.round(issData.speedHistory.reduce((a, b) => a + b.speed, 0) / issData.speedHistory.length).toLocaleString()} km/h
                  </div>
                </div>
                <div className="stat-tile" style={{ flex: 1, padding: '10px 14px' }}>
                  <div className="stat-label">Peak</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--accent3)' }}>
                    {Math.max(...issData.speedHistory.map(s => s.speed)).toLocaleString()} km/h
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* News Distribution */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">📰 News Distribution</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text3)' }}>Click slice to filter below</span>
          </div>
          <NewsDistributionChart distribution={getDistribution()} onSliceClick={handleSliceClick} />
          {filteredCat && (
            <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: '0.82rem', color: 'var(--text2)' }}>Filtered:</span>
              <span className="badge badge-purple" style={{ textTransform: 'capitalize' }}>{filteredCat}</span>
              <button className="btn btn-ghost btn-sm" onClick={() => setFilteredCat(null)}>✕ Clear</button>
            </div>
          )}
        </div>
      </div>

      {/* Live Map */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div className="card-header">
          <span className="card-title">🗺️ ISS Live Map</span>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <span className="badge badge-green"><span className="live-dot" />LIVE</span>
          </div>
        </div>
        <ISSMap position={issData.position} trajectory={issData.trajectory} />
      </div>

      {/* Filtered articles preview */}
      {filteredCat && (
        <div>
          <div className="card-title" style={{ marginBottom: 14, textTransform: 'capitalize' }}>
            📰 {filteredCat} Articles ({getFiltered(filteredCat).length})
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {getFiltered(filteredCat).slice(0, 5).map((a, i) => (
              <div key={i} className="card" style={{ padding: '14px 18px', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <span style={{ fontSize: '1.4rem' }}>📄</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text)', marginBottom: 4 }}>{a.title}</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text3)' }}>{a.source?.name}</div>
                </div>
                <a href={a.url} target="_blank" rel="noopener noreferrer" className="btn btn-ghost btn-sm">→</a>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
