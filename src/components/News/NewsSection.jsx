import React, { useState, useEffect } from 'react';
import { useNews, CATEGORIES } from '../../hooks/useNews';
import NewsCard from './NewsCard';
import NewsDistributionChart from './NewsDistributionChart';
import toast from 'react-hot-toast';

const SKELETON = Array(4).fill(null);

function SkeletonCard() {
  return (
    <div className="news-card">
      <div className="skeleton" style={{ height:180 }} />
      <div className="news-card-body" style={{ gap:10 }}>
        <div className="skeleton" style={{ height:12, width:'40%' }} />
        <div className="skeleton" style={{ height:16, width:'90%' }} />
        <div className="skeleton" style={{ height:14, width:'70%' }} />
        <div className="skeleton" style={{ height:12, width:'50%' }} />
      </div>
      <div style={{ padding:'12px 16px' }}>
        <div className="skeleton" style={{ height:32, borderRadius:8 }} />
      </div>
    </div>
  );
}

export default function NewsSection() {
  const {
    loading, errors, searchQuery, setSearchQuery,
    sortBy, setSortBy, fetchCategory, fetchAll,
    getFiltered, getDistribution,
  } = useNews();

  const [activeCategory, setActiveCategory] = useState('technology');

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handleRefresh = (cat) => {
    fetchCategory(cat, true);
    toast.success(`Refreshing ${cat} news…`);
  };

  const handleSliceClick = (cat) => {
    setActiveCategory(cat);
    toast(`Showing ${cat} articles`, { icon: '📊' });
  };

  const articles = getFiltered(activeCategory);
  const isLoading = loading[activeCategory];
  const error = errors[activeCategory];

  return (
    <div className="section fade-in">
      <div className="section-heading">📰 News Dashboard</div>

      {/* Controls */}
      <div style={{ display:'flex', gap:10, flexWrap:'wrap', marginBottom:16, alignItems:'center' }}>
        <div className="search-bar" style={{ maxWidth:340 }}>
          <span>🔍</span>
          <input
            id="news-search"
            placeholder="Search articles…"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} style={{ background:'none',border:'none',cursor:'pointer',color:'var(--text3)',fontSize:'0.9rem' }}>✕</button>
          )}
        </div>
        <select className="filter-select" id="news-sort" value={sortBy} onChange={e => setSortBy(e.target.value)}>
          <option value="publishedAt">Sort by Date</option>
          <option value="source">Sort by Source</option>
        </select>
        <button className="btn btn-ghost btn-sm" onClick={() => handleRefresh(activeCategory)}>
          🔄 Refresh
        </button>
        <button className="btn btn-ghost btn-sm" onClick={() => { fetchAll(true); toast.success('Refreshing all categories…'); }}>
          🔄 Refresh All
        </button>
      </div>

      {/* Distribution chart + category tabs row */}
      <div className="grid-2" style={{ marginBottom:24 }}>
        <div className="card">
          <div className="card-header">
            <span className="card-title">📊 Articles by Category</span>
            <span style={{ fontSize:'0.75rem', color:'var(--text3)' }}>Click slice to filter</span>
          </div>
          <NewsDistributionChart distribution={getDistribution()} onSliceClick={handleSliceClick} />
        </div>
        <div className="card" style={{ display:'flex', flexDirection:'column', justifyContent:'space-between' }}>
          <div>
            <div className="card-header">
              <span className="card-title">🗂️ Categories</span>
            </div>
            <div className="cat-tabs">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  id={`cat-tab-${cat}`}
                  className={`cat-tab ${activeCategory === cat ? 'active' : ''}`}
                  onClick={() => setActiveCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
          <div style={{ marginTop:12 }}>
            <div style={{ fontSize:'0.8rem', color:'var(--text2)', marginBottom:8 }}>Category stats:</div>
            <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
              {getDistribution().map(d => (
                <span key={d.category} className="badge badge-blue" style={{ textTransform:'capitalize' }}>
                  {d.category}: {d.count}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Articles grid */}
      <div style={{ marginBottom:12, display:'flex', alignItems:'center', gap:10 }}>
        <span className="card-title" style={{ textTransform:'capitalize' }}>
          {activeCategory} Articles
        </span>
        {!isLoading && !error && (
          <span style={{ fontSize:'0.78rem', color:'var(--text3)' }}>
            {articles.length} found
          </span>
        )}
      </div>

      {error && (
        <div className="error-box" style={{ marginBottom:16 }}>
          <span>⚠️</span>
          <span>{error}</span>
          <button className="btn btn-outline btn-sm" onClick={() => handleRefresh(activeCategory)}>Retry</button>
        </div>
      )}

      <div className="grid-auto">
        {isLoading
          ? SKELETON.map((_, i) => <SkeletonCard key={i} />)
          : articles.length
            ? articles.slice(0, 10).map((article, i) => (
                <NewsCard key={article.url || i} article={article} category={activeCategory} />
              ))
            : !error && (
                <div style={{ gridColumn:'1/-1', textAlign:'center', padding:'40px 0', color:'var(--text3)' }}>
                  No articles found. Try a different search or refresh.
                </div>
              )
        }
      </div>
    </div>
  );
}
