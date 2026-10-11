import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function AlbumCard({ album }) {
  const navigate = useNavigate();

  const coverSrc = album.cover_image
    ? (album.cover_image.startsWith('http') ? album.cover_image : `http://localhost/Echofy${album.cover_image}`)
    : 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?auto=format&fit=crop&w=300&q=80';

  return (
    <div
      onClick={() => navigate(`/album/${album.album_id}`)}
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
      {/* Cover */}
      <div style={{
        width: '100%',
        aspectRatio: '1/1',
        borderRadius: 'var(--radius-sm)',
        overflow: 'hidden'
      }}>
        <img
          src={coverSrc}
          alt={album.title}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
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
          {album.title}
        </div>
        <div style={{
          fontSize: '0.8rem',
          color: 'var(--text-muted)',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          fontWeight: 400
        }}>
          {album.artist_name || 'Album'}
        </div>
      </div>
    </div>
  );
}
