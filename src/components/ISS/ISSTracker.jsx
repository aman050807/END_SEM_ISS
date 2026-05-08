import React from 'react';
import { useISS } from '../../hooks/useISS';
import ISSMap from './ISSMap';
import ISSSpeedChart from './ISSSpeedChart';
import PeopleInSpace from './PeopleInSpace';
import toast from 'react-hot-toast';

function StatTile({ label, value, sub, icon }) {
  return (
    <div className="stat-tile">
      <div className="stat-label">{icon} {label}</div>
      <div className="stat-value">{value}</div>
      {sub && <div className="stat-sub">{sub}</div>}
    </div>
  );
}

function SkeletonStat() {
  return (
    <div className="stat-tile">
      <div className="skeleton" style={{ height:12, width:'60%', marginBottom:8 }} />
      <div className="skeleton" style={{ height:30, width:'80%', marginBottom:6 }} />
      <div className="skeleton" style={{ height:10, width:'50%' }} />
    </div>
  );
}

export default function ISSTracker() {
  const { position, trajectory, speed, speedHistory, locationName, people, loading, error, refresh, posCount } = useISS();

  const handleRefresh = () => { refresh(); toast.success('ISS data refreshed!'); };

  return (
    <div className="section fade-in">
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:12, marginBottom:20 }}>
        <div className="section-heading" style={{ marginBottom:0 }}>🛸 ISS Live Tracker</div>
        <div style={{ display:'flex', gap:8, alignItems:'center' }}>
          <span className="badge badge-green"><span className="live-dot" />LIVE</span>
          <button id="iss-refresh-btn" className="btn btn-outline btn-sm" onClick={handleRefresh} disabled={loading}>
            {loading ? <span className="spinner" style={{width:14,height:14,borderWidth:2}} /> : '🔄'} Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="error-box" style={{ marginBottom:16 }}>
          <span>⚠️ {error}</span>
          <button className="btn btn-outline btn-sm" onClick={handleRefresh}>Retry</button>
        </div>
      )}

      {/* Stats row */}
      <div className="grid-4" style={{ marginBottom:20 }}>
        {loading && !position ? (
          [0,1,2,3].map(i => <SkeletonStat key={i} />)
        ) : (
          <>
            <StatTile icon="🌐" label="Latitude" value={position ? position.lat.toFixed(4)+'°' : '—'} sub="Current position" />
            <StatTile icon="🌐" label="Longitude" value={position ? position.lon.toFixed(4)+'°' : '—'} sub="Current position" />
            <StatTile icon="⚡" label="Speed" value={speed ? `${speed.toLocaleString()}` : '—'} sub="km/h (Haversine calc)" />
            <StatTile icon="📍" label="Positions Tracked" value={posCount} sub="Max 15 kept" />
          </>
        )}
      </div>

      {/* Location */}
      <div className="card" style={{ marginBottom:20 }}>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <span style={{ fontSize:'1.5rem' }}>📌</span>
          <div>
            <div style={{ fontSize:'0.75rem', color:'var(--text2)', textTransform:'uppercase', letterSpacing:'0.08em' }}>Current Location</div>
            {loading && !locationName ? (
              <div className="skeleton" style={{ height:20, width:200, marginTop:4 }} />
            ) : (
              <div style={{ fontSize:'1.1rem', fontWeight:600, color:'var(--text)', marginTop:2 }}>{locationName}</div>
            )}
          </div>
        </div>
      </div>

      {/* Map */}
      <div className="card" style={{ marginBottom:20 }}>
        <div className="card-header">
          <span className="card-title">🗺️ Live ISS Map</span>
          <span style={{ fontSize:'0.75rem', color:'var(--text3)' }}>Updates every 15s</span>
        </div>
        <ISSMap position={position} trajectory={trajectory} />
      </div>

      {/* Speed chart + People */}
      <div className="grid-2">
        <div className="card">
          <div className="card-header">
            <span className="card-title">⚡ Speed History</span>
            <span style={{ fontSize:'0.75rem', color:'var(--text3)' }}>Last {speedHistory.length} readings</span>
          </div>
          <ISSSpeedChart speedHistory={speedHistory} />
        </div>
        <div className="card">
          <div className="card-header">
            <span className="card-title">👩‍🚀 People in Space</span>
            <span className="badge badge-green">{people.number} total</span>
          </div>
          <PeopleInSpace people={people} />
        </div>
      </div>
    </div>
  );
}
