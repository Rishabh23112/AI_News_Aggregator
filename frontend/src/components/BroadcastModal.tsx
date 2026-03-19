import React, { useState } from 'react';
import { broadcast } from '@/lib/api';
import { HiXMark } from 'react-icons/hi2';
import toast from 'react-hot-toast';
import ReactMarkdown from 'react-markdown';

interface Props {
  favoriteId: number;
  newsTitle: string;
  platform: string;
  onClose: () => void;
}

export default function BroadcastModal({ favoriteId, newsTitle, platform, onClose }: Props) {
  const [content, setContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState(false);

  const platformLabels: Record<string, string> = {
    email: 'Archive Dispatch',
    linkedin: 'Professional Briefing',
    whatsapp: 'Direct Wire',
    newsletter: 'Special Bulletin',
  };

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const res = await broadcast(favoriteId, platform);
      setContent(res.data.content);
      setGenerated(true);
      toast.success(`Content generated.`);
    } catch {
      toast.error('Failed to generate content');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Broadcast — {platformLabels[platform] || platform}</h3>
          <button className="icon-btn" onClick={onClose}>
            <HiXMark size={24} />
          </button>
        </div>
        <div className="modal-body">
          <p style={{ fontSize: 11, color: 'var(--accent)', marginBottom: 8, textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.1em' }}>Source Report</p>
          <p className="card-title" style={{ fontSize: 22, fontWeight: 700, marginBottom: 32 }}>{newsTitle}</p>

          {!generated ? (
            <button
              className="btn btn-primary"
              onClick={handleGenerate}
              disabled={loading}
              style={{ width: '100%', justifyContent: 'center' }}
            >
              {loading ? (
                <>
                  <div className="spinner" style={{ width: 16, height: 16, border: '2px solid white', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite', marginRight: 8 }} />
                  Processing...
                </>
              ) : (
                `Compose ${platform.charAt(0).toUpperCase() + platform.slice(1)} Dispatch`
              )}
            </button>
          ) : (
            <>
              <p style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>
                Generated Content
              </p>
              <div className="generated-content" style={{ 
                background: 'var(--bg-secondary)', 
                border: '1px solid var(--border)', 
                borderRadius: '8px',
                padding: 24, 
                fontSize: 15, 
                lineHeight: 1.7, 
                color: 'var(--text-primary)',
                marginBottom: 32,
              }}>
                <div className="markdown-content">
                  <ReactMarkdown>{content}</ReactMarkdown>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 16 }}>
                <button
                  className="read-more-btn"
                  onClick={() => {
                    navigator.clipboard.writeText(content || '');
                    toast.success('Copied to clipboard');
                  }}
                  style={{ flex: 1, textAlign: 'center' }}
                >
                  Copy Content
                </button>
                <button
                  className="btn btn-primary"
                  onClick={() => {
                    toast.success(`Dispatch Sent.`);
                    onClose();
                  }}
                  style={{ flex: 1, justifyContent: 'center' }}
                >
                  Send
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
