import { useState, useCallback } from 'react';
import { saveWithTTL, loadWithTTL } from '../utils/storage';

const NEWS_BASE = 'https://newsdata.io/api/1/latest';
const API_KEY = import.meta.env.VITE_NEWS_API_KEY;

export const CATEGORIES = ['technology', 'science', 'business', 'health', 'sports', 'entertainment'];

function mapArticle(raw) {
  return {
    title: raw.title,
    description: raw.description || raw.content || '',
    url: raw.link,
    urlToImage: raw.image_url,
    source: { name: raw.source_name || raw.source_id || 'Unknown' },
    author: raw.creator ? raw.creator.join(', ') : null,
    publishedAt: raw.pubDate,
    category: (raw.category && raw.category[0]) || 'general',
  };
}

export function useNews() {
  const [articles, setArticles] = useState({});
  const [loading, setLoading] = useState({});
  const [errors, setErrors] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('publishedAt');

  const fetchCategory = useCallback(async (category, forceRefresh = false) => {
    const cacheKey = `news_${category}`;
    if (!forceRefresh) {
      const cached = loadWithTTL(cacheKey);
      if (cached) {
        setArticles(prev => ({ ...prev, [category]: cached }));
        return;
      }
    }
    setLoading(prev => ({ ...prev, [category]: true }));
    setErrors(prev => ({ ...prev, [category]: null }));
    try {
      const res = await fetch(
        `${NEWS_BASE}?apikey=${API_KEY}&category=${category}&language=en&size=10`
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (data.status === 'error') throw new Error(data.results?.message || 'API error');
      const arts = (data.results || [])
        .filter(a => a.title && a.title !== '[Removed]')
        .map(mapArticle);
      saveWithTTL(cacheKey, arts, 15);
      setArticles(prev => ({ ...prev, [category]: arts }));
    } catch (err) {
      setErrors(prev => ({ ...prev, [category]: err.message }));
    } finally {
      setLoading(prev => ({ ...prev, [category]: false }));
    }
  }, []);

  const fetchAll = useCallback((force = false) => {
    CATEGORIES.forEach(cat => fetchCategory(cat, force));
  }, [fetchCategory]);

  const getFiltered = (category) => {
    const list = articles[category] || [];
    let filtered = searchQuery
      ? list.filter(a =>
          a.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          a.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          a.source?.name?.toLowerCase().includes(searchQuery.toLowerCase())
        )
      : list;
    if (sortBy === 'publishedAt') {
      filtered = [...filtered].sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
    } else if (sortBy === 'source') {
      filtered = [...filtered].sort((a, b) => (a.source?.name || '').localeCompare(b.source?.name || ''));
    }
    return filtered;
  };

  const getDistribution = () =>
    CATEGORIES.map(cat => ({
      category: cat,
      count: (articles[cat] || []).length,
    }));

  const getAllArticles = () => CATEGORIES.flatMap(cat => (articles[cat] || []).map(a => ({ ...a, category: cat })));

  return {
    articles, loading, errors, searchQuery, setSearchQuery,
    sortBy, setSortBy, fetchCategory, fetchAll, getFiltered,
    getDistribution, getAllArticles,
  };
}
