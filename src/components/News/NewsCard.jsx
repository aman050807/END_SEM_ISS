import React from 'react';
import { formatDistanceToNow } from 'date-fns';

const CATEGORY_EMOJI = {
  technology:'💻', science:'🔬', business:'💼',
  health:'🏥', sports:'⚽', entertainment:'🎬', general:'🌍',
};

export default function NewsCard({ article, category }) {
  const { title, source, author, publishedAt, urlToImage, description, url } = article;
  const emoji = CATEGORY_EMOJI[category] || '📰';
  const timeAgo = publishedAt ? formatDistanceToNow(new Date(publishedAt), { addSuffix: true }) : '';

  return (
    <div className="news-card fade-in">
      {urlToImage ? (
        <img src={urlToImage} alt={title} onError={e => { e.target.style.display='none'; }} loading="lazy" />
      ) : (
        <div className="news-card-img-placeholder">{emoji}</div>
      )}
      <div className="news-card-body">
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <span className="news-card-source">{source?.name || 'Unknown'}</span>
          <span className="badge badge-purple" style={{ textTransform:'capitalize' }}>{category}</span>
        </div>
        <div className="news-card-title">{title}</div>
        <div className="news-card-desc">{description || 'No description available.'}</div>
        <div className="news-card-meta">
          {author && <span>✍️ {author.split(',')[0].slice(0, 30)}</span>}
          {timeAgo && <span>🕐 {timeAgo}</span>}
        </div>
      </div>
      <div className="news-card-footer">
        <a href={url} target="_blank" rel="noopener noreferrer" className="btn btn-outline btn-sm" style={{ width:'100%', justifyContent:'center' }}>
          Read More →
        </a>
      </div>
    </div>
  );
}
