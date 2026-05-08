import React from 'react';
import { useTheme } from '../hooks/useTheme';

export default function Navbar({ activeTab, setActiveTab }) {
  const { theme, toggle } = useTheme();
  const tabs = ['ISS', 'News', 'Charts'];

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <span className="brand-icon">🛸</span>
        <h1>ISS &amp; News Dashboard</h1>
      </div>
      <div className="nav-tabs">
        {tabs.map(t => (
          <button key={t} className={`nav-tab ${activeTab === t ? 'active' : ''}`} onClick={() => setActiveTab(t)}>
            {t === 'ISS' ? '🛰️ ' : t === 'News' ? '📰 ' : '📊 '}{t}
          </button>
        ))}
      </div>
      <div className="navbar-right">
        <span className="live-dot" title="Live" />
        <button className="theme-toggle" onClick={toggle} title="Toggle theme">
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>
      </div>
    </nav>
  );
}
