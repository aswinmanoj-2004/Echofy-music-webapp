import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../services/api';
import SongCard from '../../components/music/SongCard';
import AlbumCard from '../../components/music/AlbumCard';
import { Play } from 'lucide-react';
import { usePlayer } from '../../context/PlayerContext';

export default function ArtistDetails() {
  const { id } = useParams();
  const [artist, setArtist] = useState(null);
  const [loading, setLoading] = useState(true);

  const { playTrack } = usePlayer();

  useEffect(() => {
    api.get(`/artists/detail.php?id=${id}`).then((res) => {
      if (res.data.status) {
        setArtist(res.data.data);
      }
      setLoading(false);
    }).catch(console.error);
  }, [id]);

  if (loading || !artist) {
    return <div style={{ color: 'var(--text-muted)', padding: '3rem' }}>Loading...</div>;
  }

  const avatarSrc = artist.profile_picture
    ? (artist.profile_picture.startsWith('http') ? artist.profile_picture : `http://localhost/Echofy${artist.profile_picture}`)
    : '/artist-cover.jpg';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem', animation: 'fadeIn 0.5s ease' }}>
      {/* Hero */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '2.5rem' }}>
        <img
          src={avatarSrc}
          alt={artist.artist_name}
          style={{
            width: '170px',
            height: '170px',
            borderRadius: '50%',
            objectFit: 'cover',
            border: '2px solid var(--border-subtle)'
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
            Verified Artist
          </span>
          <h1 style={{
            fontSize: '2.75rem',
            fontWeight: 500,
            fontFamily: 'Playfair Display, serif',
            letterSpacing: '-0.03em',
            lineHeight: 1.1
          }}>
            {artist.artist_name}
          </h1>
          <p style={{
            color: 'var(--text-secondary)',
            fontSize: '0.95rem',
            fontWeight: 400,
            maxWidth: '550px',
            lineHeight: 1.6
          }}>
            {artist.biography || 'Independent artist sharing music on Echofy.'}
          </p>

          {artist.songs?.length > 0 && (
            <button
              onClick={() => playTrack(artist.songs[0], artist.songs)}
              className="btn-primary"
              style={{ width: 'fit-content', marginTop: '0.5rem' }}
            >
              <Play size={16} fill="#0e0e0e" /> Play
            </button>
          )}
        </div>
      </div>

      {/* Songs */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
          <h2 className="section-title" style={{ fontSize: '1.5rem' }}>Songs</h2>
          <span className="section-label">{artist.songs?.length || 0} tracks</span>
        </div>
        <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap' }}>
          {artist.songs?.map((song) => (
            <SongCard key={song.song_id} song={song} queue={artist.songs} />
          ))}
        </div>
      </section>

      {/* Albums */}
      {artist.albums?.length > 0 && (
        <section style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <h2 className="section-title" style={{ fontSize: '1.5rem' }}>Albums</h2>
          <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap' }}>
            {artist.albums?.map((album) => (
              <AlbumCard key={album.album_id} album={album} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
