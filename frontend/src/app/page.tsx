'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { getNews, getSources, refreshNews } from '@/lib/api';
import { useApp } from '@/context/AppContext';
import { format } from 'date-fns';
import {
  HiMagnifyingGlass,
  HiArrowPath,
  HiStar,
  HiOutlineStar,
  HiChatBubbleLeftRight,
  HiBolt,
} from 'react-icons/hi2';
import toast from 'react-hot-toast';
import NewsDetailModal from '@/components/NewsDetailModal';

interface NewsItem {
  id: number;
  source_id: number | null;
  title: string;
  summary: string;
  author: string | null;
  url: string;
  discussion_url?: string | null;
  published_at: string;
  tags: string[] | null;
  impact_score: number | null;
  is_duplicate: boolean | null;
}

interface Source {
  id: number;
  name: string;
  url: string;
  type: string;
  active: boolean;
}

export default function NewsFeedPage() {
  const { favoriteNewsIds, toggleFavorite } = useApp();
  const [news, setNews] = useState<NewsItem[]>([]);
  const [sources, setSources] = useState<Source[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [keyword, setKeyword] = useState('');
  const [sourceFilter, setSourceFilter] = useState<number | ''>('');
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);

  const sourceMap = sources.reduce((acc, s) => {
    acc[s.id] = s.name;
    return acc;
  }, {} as Record<number, string>);

  const fetchNews = useCallback(async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (keyword.trim()) params.keyword = keyword.trim();
      if (sourceFilter) params.source_id = sourceFilter;
      const res = await getNews(params);
      setNews(res.data);
    } catch {
      toast.error('Failed to load news');
    } finally {
      setLoading(false);
    }
  }, [keyword, sourceFilter]);

  const fetchSources = useCallback(async () => {
    try {
      const res = await getSources();
      setSources(res.data);
    } catch {}
  }, []);

  useEffect(() => {
    fetchSources();
  }, [fetchSources]);

  useEffect(() => {
    const timer = setTimeout(() => fetchNews(), 300);
    return () => clearTimeout(timer);
  }, [fetchNews]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshNews();
      toast.success('Sync complete');
      await fetchNews();
    } catch {
      toast.error('Sync failed');
    } finally {
      setRefreshing(false);
    }
  };

  const handleToggleFavorite = async (newsId: number) => {
    try {
      await toggleFavorite(newsId);
    } catch {
      toast.error('Failed to update favorite');
    }
  };

  const getImpactLevel = (score: number | null) => {
    if (!score || score <= 0.1) return null;
    if (score >= 0.7) return { label: 'Priority', cls: 'impact-high' };
    if (score >= 0.4) return { label: 'Notable', cls: 'impact-medium' };
    return { label: 'Brief', cls: 'impact-low' };
  };

  const nonDuplicateNews = news.filter(n => !n.is_duplicate);

  return (
    <>
      <div className="page-header">
        <h2>Intelligence Feed</h2>
        <p>Curated AI developments from across the globe.</p>
      </div>

      {/* Stats */}
      <div className="stats-row">
        <div className="stat-card dominant">
          <div className="stat-value">{nonDuplicateNews.length}</div>
          <div className="stat-label">Total Reports</div>
        </div>
        <div className="stat-card dominant">
          <div className="stat-value">{sources.length}</div>
          <div className="stat-label">Active Sources</div>
        </div>
        <div className={`stat-card ${favoriteNewsIds.size === 0 ? 'minimized' : ''}`}>
          <div className="stat-value">{favoriteNewsIds.size}</div>
          <div className="stat-label">Saved to Archive</div>
        </div>
        <div className={`stat-card ${news.filter(n => n.is_duplicate).length === 0 ? 'minimized' : ''}`}>
          <div className="stat-value">{news.filter(n => n.is_duplicate).length}</div>
          <div className="stat-label">Duplicates Filtered</div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="toolbar">
        <div className="search-box">
          <HiMagnifyingGlass className="search-icon" />
          <input
            type="text"
            placeholder="Search the archives..."
            value={keyword}
            onChange={e => setKeyword(e.target.value)}
          />
        </div>
        <select
          className="filter-select"
          value={sourceFilter}
          onChange={e => setSourceFilter(e.target.value ? Number(e.target.value) : '')}
        >
          <option value="">All Streams</option>
          {sources.map(s => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
        <button
          className="btn btn-primary"
          onClick={handleRefresh}
          disabled={refreshing}
        >
          <HiArrowPath className={refreshing ? 'animate-spin' : ''} />
          {refreshing ? 'Refreshing...' : 'Refresh Feed'}
        </button>
      </div>

      {/* News Grid */}
      {loading ? (
        <div className="loading-container">
          <div className="spinner" />
          <p>Decrypting news wire...</p>
        </div>
      ) : nonDuplicateNews.length === 0 ? (
        <div className="empty-state">
          <p>No matches found in the current intelligence stream.</p>
        </div>
      ) : (
        <div className="news-grid">
          {nonDuplicateNews.map((item, index) => {
            const impact = getImpactLevel(item.impact_score);
            const isFav = favoriteNewsIds.has(item.id);
            const isFeatured = index === 0 && !keyword && !sourceFilter;

            return (
              <article key={item.id} className={`news-card ${isFeatured ? 'featured' : ''}`}>
                <div className="card-meta">
                  <span className="source-label">
                    {item.source_id && sourceMap[item.source_id]
                      ? sourceMap[item.source_id]
                      : 'Intelligence'}
                  </span>
                  <span className="date-label">
                    {format(new Date(item.published_at), 'MMM d, yyyy')}
                  </span>
                </div>

                <h3
                  className="card-title"
                  onClick={() => setSelectedNews(item)}
                >
                  {item.title}
                </h3>

                <p className="card-summary">
                  {item.summary?.replace(/<[^>]*>/g, '').slice(0, isFeatured ? 450 : 180)}
                  {item.summary?.length > (isFeatured ? 450 : 180) && '...'}
                </p>

                <div className="card-footer">
                  <div className="card-actions">
                    <a 
                      href={item.url} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="read-more-btn"
                    >
                      Read Article
                    </a>
                    {item.discussion_url && (
                      <a 
                        href={item.discussion_url} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="discussion-btn"
                      >
                        View Comments
                      </a>
                    )}
                  </div>
                  <div className="card-actions">
                    {impact && (
                      <span className={`impact-badge ${impact.cls}`}>
                        <HiBolt /> {impact.label}
                      </span>
                    )}
                    <button
                      className={`icon-btn ${isFav ? 'favorited' : ''}`}
                      onClick={() => handleToggleFavorite(item.id)}
                      title={isFav ? "Remove from favorites" : "Add to favorites"}
                    >
                      {isFav ? <HiStar size={20} /> : <HiOutlineStar size={20} />}
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {selectedNews && (
        <NewsDetailModal
          news={selectedNews}
          sourceName={selectedNews.source_id ? sourceMap[selectedNews.source_id] : undefined}
          onClose={() => setSelectedNews(null)}
        />
      )}
    </>
  );
}
