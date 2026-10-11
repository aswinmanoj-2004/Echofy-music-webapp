import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function ArtistCard({ artist }) {
  const navigate = useNavigate();

  const avatarSrc = artist.profile_picture
    ? (artist.profile_picture.startsWith('http') ? artist.profile_picture : `http://localhost/Echofy${artist.profile_picture}`)
    : '/artist-cover.jpg';

  return (
    <div
      onClick={() => navigate(`/artist/${artist.artist_id}`)}
      style={{
        padding: '1.25rem',
        borderRadius: 'var(--radius-md)',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        gap: '1rem',
        width: '170px',
        flexShrink: 0,
        background: 'var(--card-bg)',
        border: '1px solid var(--border-subtle)',
        transition: 'var(--transition)'
      }}
      className="glass-card"
    >
      {/* Avatar */}
      <div style={{
        width: '110px',
        height: '110px',
        borderRadius: '50%',
        overflow: 'hidden',
        border: '2px solid var(--border-subtle)'
      }}>
        <img
          src={avatarSrc}
          alt={artist.artist_name}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      </div>

      {/* Info */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
        <div style={{
          fontWeight: 500,
          fontSize: '0.95rem',
          color: 'var(--text-main)',
          letterSpacing: '0.01em'
        }}>
          {artist.artist_name}
        </div>
        <div style={{
          fontSize: '0.7rem',
          color: 'var(--primary-color)',
          fontWeight: 500,
          letterSpacing: '0.05em',
          textTransform: 'uppercase'
        }}>
          Artist
        </div>
      </div>
    </div>
  );
}
