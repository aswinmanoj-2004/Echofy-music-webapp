import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import SongCard from '../../components/music/SongCard';
import { Clock, Play } from 'lucide-react';
import { usePlayer } from '../../context/PlayerContext';

export default function RecentlyPlayedPage() {
  const [recentSongs, setRecentSongs] = useState([]);
  const [loading, setLoading] = useState(true);

  const { playTrack } = usePlayer();

  useEffect(() => {
    api.get('/recent/index.php').then((res) => {
      if (res.data.status) {
        setRecentSongs(res.data.data);
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
          <Clock size={36} strokeWidth={1.5} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <span className="section-label">History</span>
          <h1 style={{
            fontSize: '2.5rem',
            fontWeight: 500,
            fontFamily: 'Playfair Display, serif',
            letterSpacing: '-0.02em'
          }}>
            Recently Played
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 400 }}>
            Your listening history
          </p>
        </div>
      </div>

      {recentSongs.length > 0 && (
        <button onClick={() => playTrack(recentSongs[0], recentSongs)} className="btn-primary" style={{ width: 'fit-content' }}>
          <Play size={16} fill="#0e0e0e" /> Resume
        </button>
      )}

      <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap' }}>
        {recentSongs.map((song) => (
          <SongCard key={song.song_id} song={song} queue={recentSongs} />
        ))}
      </div>
    </div>
  );
}
