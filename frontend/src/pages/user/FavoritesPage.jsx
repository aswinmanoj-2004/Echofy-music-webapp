import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import SongCard from '../../components/music/SongCard';
import { Heart, Play } from 'lucide-react';
import { usePlayer } from '../../context/PlayerContext';

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  const { playTrack } = usePlayer();

  useEffect(() => {
    api.get('/favorites/index.php').then((res) => {
      if (res.data.status) {
        setFavorites(res.data.data);
      }
      setLoading(false);
    }).catch(console.error);
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem', animation: 'fadeIn 0.5s ease' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.75rem' }}>
        <div style={{
          width: '90px',
          height: '90px',
          borderRadius: 'var(--radius-lg)',
          background: 'linear-gradient(135deg, var(--primary-color) 0%, var(--primary-hover) 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#0e0e0e',
          boxShadow: 'var(--shadow-md)'
        }}>
          <Heart size={36} fill="#0e0e0e" strokeWidth={1.5} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <span className="section-label">Your Collection</span>
          <h1 style={{
            fontSize: '2.5rem',
            fontWeight: 500,
            fontFamily: 'Playfair Display, serif',
            letterSpacing: '-0.02em'
          }}>
            Liked Songs
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 400 }}>
            {favorites.length} saved tracks
          </p>
        </div>
      </div>

      {favorites.length > 0 && (
        <button onClick={() => playTrack(favorites[0], favorites)} className="btn-primary" style={{ width: 'fit-content' }}>
          <Play size={16} fill="#0e0e0e" /> Play All
        </button>
      )}

      <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap' }}>
        {favorites.map((song) => (
          <SongCard key={song.song_id} song={song} queue={favorites} />
        ))}
      </div>
    </div>
  );
}
