'use client';

import React from 'react';
import { format } from 'date-fns';
import { HiXMark, HiArrowTopRightOnSquare, HiBolt } from 'react-icons/hi2';

interface Props {
  news: {
    id: number;
    title: string;
    summary: string;
    author: string | null;
    url: string;
    published_at: string;
    tags: string[] | null;
    impact_score: number | null;
  };
  sourceName?: string;
  onClose: () => void;
}

export default function NewsDetailModal({ news, sourceName, onClose }: Props) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Intelligence Report</h3>
          <button className="icon-btn" onClick={onClose}>
            <HiXMark size={24} />
          </button>
        </div>
        <div className="modal-body">
          {sourceName && (
            <span className="source-label" style={{ marginBottom: 16, display: 'inline-flex' }}>
              {sourceName}
            </span>
          )}

          <h3 className="card-title" style={{ fontSize: 32, marginBottom: 16, lineHeight: 1.2 }}>
            {news.title}
          </h3>

          <div style={{ display: 'flex', gap: 16, marginBottom: 32, fontSize: 12, color: 'var(--text-muted)', fontFamily: 'var(--font-sans)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {news.author && <span>By {news.author}</span>}
            <span>{format(new Date(news.published_at), 'MMMM d, yyyy')}</span>
          </div>

          {news.impact_score !== null && news.impact_score > 0 && (
            <div className={`impact-badge ${news.impact_score >= 0.7 ? 'impact-high' : news.impact_score >= 0.4 ? 'impact-medium' : 'impact-low'}`}
              style={{ marginBottom: 32 }}>
              <HiBolt size={14} />
              Priority Weight: {(news.impact_score * 100).toFixed(0)}%
            </div>
          )}

          <div style={{
            background: 'var(--bg-accent)',
            border: '1px solid var(--border)',
            padding: 40,
            fontSize: 16,
            lineHeight: 1.8,
            color: 'var(--text-secondary)',
            marginBottom: 40,
            fontFamily: 'var(--font-serif)',
          }}>
            {news.summary?.replace(/<[^>]*>/g, '') || 'Document empty.'}
          </div>

          <div style={{ display: 'flex', gap: 16 }}>
            <a
              href={news.url}
              target="_blank"
              rel="noopener noreferrer"
              className="read-more-btn"
              style={{ flex: 1, textAlign: 'center', fontSize: 13 }}
            >
              Access Intelligence Source
            </a>
            {/* @ts-ignore */}
            {news.discussion_url && (
              <a
                /* @ts-ignore */
                href={news.discussion_url}
                target="_blank"
                rel="noopener noreferrer"
                className="discussion-btn"
                style={{ flex: 1, textAlign: 'center', fontSize: 13 }}
              >
                View Discussion
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
