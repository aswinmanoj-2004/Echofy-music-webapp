import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../services/api';
import SongCard from '../../components/music/SongCard';
import { Play } from 'lucide-react';
import { usePlayer } from '../../context/PlayerContext';

export default function AlbumDetails() {
  const { id } = useParams();
  const [album, setAlbum] = useState(null);
  const [loading, setLoading] = useState(true);

  const { playTrack } = usePlayer();

  useEffect(() => {
    api.get(`/albums/index.php?id=${id}`).then((res) => {
      if (res.data.status) {
        setAlbum(res.data.data);
      }
      setLoading(false);
    }).catch(console.error);
  }, [id]);

  if (loading || !album) {
    return <div style={{ color: 'var(--text-muted)', padding: '3rem' }}>Loading...</div>;
  }

  const coverSrc = album.cover_image
    ? (album.cover_image.startsWith('http') ? album.cover_image : `http://localhost/Echofy${album.cover_image}`)
    : 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?auto=format&fit=crop&w=400&q=80';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem', animation: 'fadeIn 0.5s ease' }}>
      {/* Hero */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '2.5rem' }}>
        <img
          src={coverSrc}
          alt={album.title}
          style={{
            width: '200px',
            height: '200px',
            borderRadius: 'var(--radius-lg)',
            objectFit: 'cover',
            boxShadow: 'var(--shadow-lg)'
          }}
        />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <span style={{
            fontSize: '0.65rem',
            color: 'var(--primary-color)',
            fontWeight: 600,
            letterSpacing: '0.12em',
            textTransform: 'uppercase'
          }}>
            Album
          </span>
          <h1 style={{
            fontSize: '2.75rem',
            fontWeight: 500,
            fontFamily: 'Playfair Display, serif',
            letterSpacing: '-0.03em',
            lineHeight: 1.1
          }}>
            {album.title}
          </h1>
          <p style={{
            color: 'var(--text-secondary)',
            fontSize: '0.95rem',
            fontWeight: 400
          }}>
            {album.artist_name} &middot; {album.songs?.length || 0} tracks
          </p>
          {album.songs?.length > 0 && (
            <button onClick={() => playTrack(album.songs[0], album.songs)} className="btn-primary" style={{ width: 'fit-content', marginTop: '0.5rem' }}>
              <Play size={16} fill="#0e0e0e" /> Play Album
            </button>
          )}
        </div>
      </div>

      {/* Tracks */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
          <h2 className="section-title" style={{ fontSize: '1.5rem' }}>Tracks</h2>
          <span className="section-label">{album.songs?.length || 0} songs</span>
        </div>
        <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap' }}>
          {album.songs?.map((song) => (
            <SongCard key={song.song_id} song={song} queue={album.songs} />
          ))}
        </div>
      </section>
    </div>
  );
}
