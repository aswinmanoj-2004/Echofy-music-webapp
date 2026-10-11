import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { usePlayer } from '../../context/PlayerContext';
import api from '../../services/api';
import { Play, Pause, Heart } from 'lucide-react';

export default function SongCard({ song, queue = [] }) {
  const navigate = useNavigate();
  const { currentTrack, isPlaying, playTrack, togglePlay } = usePlayer();
  const [isFav, setIsFav] = useState(song.is_favorite || false);

  const isCurrent = currentTrack?.song_id === song.song_id;

  const handleCardClick = () => {
    if (!isCurrent) {
      playTrack(song, queue.length > 0 ? queue : [song]);
    }
    navigate(`/song/${song.song_id}`);
  };

  const handlePlayClick = (e) => {
    e.stopPropagation();
    if (isCurrent) {
      togglePlay();
    } else {
      playTrack(song, queue.length > 0 ? queue : [song]);
    }
  };

  const handleToggleFavorite = async (e) => {
    e.stopPropagation();
    try {
      const res = await api.post('/favorites/toggle.php', { song_id: song.song_id });
      if (res.data.status) {
        setIsFav(res.data.data.is_favorite);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const coverSrc = song.cover_image
    ? (song.cover_image.startsWith('http') ? song.cover_image : `http://localhost/Echofy${song.cover_image}`)
    : 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=300&q=80';

  return (
    <div
      onClick={handleCardClick}
      style={{
        padding: '0.875rem',
        borderRadius: 'var(--radius-md)',
        cursor: 'pointer',
        position: 'relative',
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
      {/* Cover Art */}
      <div style={{
        position: 'relative',
        width: '100%',
        aspectRatio: '1/1',
        borderRadius: 'var(--radius-sm)',
        overflow: 'hidden'
      }}>
        <img
          src={coverSrc}
          alt={song.title}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />

        {/* Play Button Overlay */}
        <div
          onClick={handlePlayClick}
          style={{
            position: 'absolute',
            bottom: '8px',
            right: '8px',
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            background: 'var(--primary-color)',
            color: '#0e0e0e',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: 0.95,
            transition: 'var(--transition)'
          }}
        >
          {isCurrent && isPlaying ? <Pause size={16} fill="#0e0e0e" /> : <Play size={16} fill="#0e0e0e" style={{ marginLeft: '2px' }} />}
        </div>
      </div>

      {/* Info */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
        <div style={{
          fontWeight: 500,
          fontSize: '0.9rem',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          color: isCurrent ? 'var(--primary-color)' : 'var(--text-main)',
          letterSpacing: '0.01em'
        }}>
          {song.title}
        </div>
        <div style={{
          fontSize: '0.8rem',
          color: 'var(--text-muted)',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          fontWeight: 400
        }}>
          {song.artist_name}
        </div>
      </div>

      {/* Footer */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: '0.25rem'
      }}>
        <span style={{
          fontSize: '0.7rem',
          color: 'var(--text-muted)',
          fontWeight: 500,
          letterSpacing: '0.03em',
          textTransform: 'uppercase'
        }}>
          {song.genre_name || 'Song'}
        </span>
        <button
          onClick={handleToggleFavorite}
          style={{
            background: 'none',
            border: 'none',
            color: isFav ? '#e57373' : 'var(--text-muted)',
            cursor: 'pointer',
            padding: '0.25rem',
            transition: 'var(--transition)'
          }}
        >
          <Heart size={15} fill={isFav ? '#e57373' : 'none'} strokeWidth={1.5} />
        </button>
      </div>
    </div>
  );
}
