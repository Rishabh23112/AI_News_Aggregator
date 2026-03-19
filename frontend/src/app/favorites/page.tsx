'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { format } from 'date-fns';
import {
  HiTrash,
  HiEnvelope,
  HiChatBubbleOvalLeft,
  HiNewspaper,
  HiArrowTopRightOnSquare,
} from 'react-icons/hi2';
import { FaLinkedinIn, FaWhatsapp } from 'react-icons/fa6';
import toast from 'react-hot-toast';
import BroadcastModal from '@/components/BroadcastModal';

export default function FavoritesPage() {
  const { favorites, refreshFavorites } = useApp();
  const [broadcastState, setBroadcastState] = useState<{
    favoriteId: number;
    newsTitle: string;
    platform: string;
  } | null>(null);

  const handleRemove = async (favoriteId: number) => {
    try {
      const { removeFavorite } = await import('@/lib/api');
      await removeFavorite(favoriteId);
      await refreshFavorites();
      toast.success('Removed from favorites');
    } catch {
      toast.error('Failed to remove');
    }
  };

  const openBroadcast = (favoriteId: number, newsTitle: string, platform: string) => {
    setBroadcastState({ favoriteId, newsTitle, platform });
  };

  return (
    <>
      <div className="page-header">
        <h2>Favorites</h2>
        <p>Your curated collection of saved articles — broadcast them anywhere</p>
      </div>

      {/* Stats */}
      <div className="stats-row">
        <div className="stat-card dominant">
          <div className="stat-value">{favorites.length}</div>
          <div className="stat-label">Total Saved Articles</div>
        </div>
      </div>

      {favorites.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">⭐</div>
          <p>The collection is currently empty. Star articles from the feed to save them here.</p>
        </div>
      ) : (
        <div className="favorites-list">
          {favorites.map(fav => (
            <article key={fav.favorite_id} className="favorite-card">
              <div className="fav-content">
                <div className="card-meta">
                  <span className="source-label">{fav.news_item.source_id ? 'Archived Intelligence' : 'Saved Report'}</span>
                  <span className="date-label">
                    Filed {format(new Date(fav.created_at), 'MMM d, yyyy')}
                  </span>
                </div>
                <h3 className="card-title">
                  {fav.news_item.title}
                </h3>
                <p className="card-summary">
                  {fav.news_item.summary?.replace(/<[^>]*>/g, '').slice(0, 200)}...
                </p>
                
                <div style={{ display: 'flex', gap: 12 }}>
                  <a 
                    href={fav.news_item.url} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="read-more-btn"
                  >
                    Read Full Source
                  </a>
                  <button
                    className="icon-btn"
                    onClick={() => handleRemove(fav.favorite_id)}
                    title="Remove from favorites"
                    style={{ color: '#ff4d4f' }}
                  >
                    <HiTrash size={18} />
                  </button>
                </div>
              </div>

              <div className="fav-actions">
                <button
                  className="broadcast-btn"
                  onClick={() => openBroadcast(fav.favorite_id, fav.news_item.title, 'email')}
                >
                  <HiEnvelope size={14} /> Email
                </button>
                <button
                  className="broadcast-btn"
                  onClick={() => openBroadcast(fav.favorite_id, fav.news_item.title, 'linkedin')}
                >
                  <FaLinkedinIn size={13} /> LinkedIn
                </button>
                <button
                  className="broadcast-btn"
                  onClick={() => openBroadcast(fav.favorite_id, fav.news_item.title, 'whatsapp')}
                >
                  <FaWhatsapp size={14} /> WhatsApp
                </button>
                <button
                  className="broadcast-btn"
                  onClick={() => openBroadcast(fav.favorite_id, fav.news_item.title, 'newsletter')}
                >
                  <HiNewspaper size={14} /> Bulletin
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      {broadcastState && (
        <BroadcastModal
          favoriteId={broadcastState.favoriteId}
          newsTitle={broadcastState.newsTitle}
          platform={broadcastState.platform}
          onClose={() => setBroadcastState(null)}
        />
      )}
    </>
  );
}
