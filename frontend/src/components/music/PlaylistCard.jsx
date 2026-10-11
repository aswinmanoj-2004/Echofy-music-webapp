import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ListMusic } from 'lucide-react';

export default function PlaylistCard({ playlist }) {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/playlist/${playlist.playlist_id}`)}
      style={{
        padding: '0.875rem',
        borderRadius: 'var(--radius-md)',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.875rem',
        width: '190px',
        flexShrink: 0,
        background: 'var(--card-bg)',
        border: '1px solid var(--border-subtle)',
        transition: 'var(--transition)'
      }}
      className="glass-card"
    >
      {/* Playlist Art */}
      <div
        style={{
          width: '100%',
          aspectRatio: '1/1',
          borderRadius: 'var(--radius-sm)',
          background: 'linear-gradient(135deg, var(--surface-hover) 0%, var(--surface-color) 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--primary-color)',
          border: '1px solid var(--border-subtle)'
        }}
      >
        <ListMusic size={38} strokeWidth={1.5} />
      </div>

      {/* Info */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
        <div style={{
          fontWeight: 500,
          fontSize: '0.9rem',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          color: 'var(--text-main)',
          letterSpacing: '0.01em'
        }}>
          {playlist.name}
        </div>
        <div style={{
          fontSize: '0.8rem',
          color: 'var(--text-muted)',
          fontWeight: 400
        }}>
          {playlist.total_songs || 0} tracks
        </div>
      </div>
    </div>
  );
}
