import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { usePlayer } from '../../context/PlayerContext';
import api from '../../services/api';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Heart,
  Volume2,
  VolumeX,
  ArrowLeft,
  Clock,
  ListMusic,
  X,
  Check
} from 'lucide-react';

export default function SongDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    isShuffle,
    isRepeat,
    queue,
    currentIndex,
    youtubeId,
    playTrack,
    togglePlay,
    handleNextTrack,
    handlePrevTrack,
    seekTo,
    handleVolumeChange,
    toggleMute,
    setIsShuffle,
    setIsRepeat
  } = usePlayer();

  const [song, setSong] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [error, setError] = useState('');

  // Add to Playlist state
  const [showPlaylistModal, setShowPlaylistModal] = useState(false);
  const [userPlaylists, setUserPlaylists] = useState([]);
  const [addedToPlaylistId, setAddedToPlaylistId] = useState(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    api.get(`/songs/detail.php?id=${id}`)
      .then((res) => {
        if (res.data.status) {
          setSong(res.data.data);
          setIsFavorite(res.data.data.is_favorite);
        } else {
          setError(res.data.message || 'Song not found');
        }
      })
      .catch((err) => {
        console.error("Error loading song details:", err);
        setError('Failed to load song details');
      })
      .finally(() => setLoading(false));
  }, [id]);

  // Auto-navigate to new song when player advances to next track
  useEffect(() => {
    if (currentTrack && id && String(currentTrack.song_id) !== String(id)) {
      navigate(`/song/${currentTrack.song_id}`, { replace: true });
    }
  }, [currentTrack?.song_id]);

  const handleToggleFavorite = async () => {
    if (!song) return;
    try {
      const res = await api.post('/favorites/toggle.php', { song_id: song.song_id });
      if (res.data.status) {
        setIsFavorite(res.data.data.is_favorite);
      }
    } catch (err) {
      console.error("Error toggling favorite:", err);
    }
  };

  const openAddToPlaylist = async () => {
    setShowPlaylistModal(true);
    setAddedToPlaylistId(null);
    try {
      const res = await api.get('/playlists/index.php');
      if (res.data.status) {
        setUserPlaylists(res.data.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddToPlaylist = async (playlistId) => {
    if (!song) return;
    try {
      const res = await api.post('/playlists/add_song.php', {
        playlist_id: playlistId,
        song_id: song.song_id
      });
      if (res.data.status) {
        setAddedToPlaylistId(playlistId);
        setTimeout(() => {
          setShowPlaylistModal(false);
          setAddedToPlaylistId(null);
        }, 800);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const formatTime = (secs) => {
    if (!secs || isNaN(secs)) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const isCurrentPlaying = currentTrack?.song_id === song?.song_id;

  const coverSrc = song?.cover_image
    ? (song.cover_image.startsWith('http') ? song.cover_image : `http://localhost/Echofy${song.cover_image}`)
    : (youtubeId && isCurrentPlaying ? `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg` : 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=600&q=80');

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div style={{
          width: '36px',
          height: '36px',
          border: '2px solid var(--border-subtle)',
          borderTopColor: 'var(--primary-color)',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
      </div>
    );
  }

  if (error || !song) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 500, fontFamily: 'Playfair Display, serif', marginBottom: '0.75rem' }}>Not Found</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontWeight: 400 }}>{error || "The requested song could not be loaded."}</p>
        <button onClick={() => navigate(-1)} className="btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
          <ArrowLeft size={15} /> Back
        </button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto', paddingBottom: '3rem', animation: 'fadeIn 0.5s ease' }}>
      {/* Back */}
      <button
        onClick={() => navigate(-1)}
        style={{
          background: 'var(--surface-hover)',
          border: '1px solid var(--border-subtle)',
          color: 'var(--text-secondary)',
          padding: '0.5rem 1rem',
          borderRadius: '100px',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          fontSize: '0.8rem',
          fontWeight: 500,
          cursor: 'pointer',
          marginBottom: '2.5rem',
          transition: 'var(--transition)',
          letterSpacing: '0.02em'
        }}
      >
        <ArrowLeft size={15} />
        <span>Back</span>
      </button>

      {/* Add to Playlist Modal */}
      {showPlaylistModal && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 200,
          backdropFilter: 'blur(8px)'
        }}>
          <div style={{
            padding: '2rem',
            borderRadius: 'var(--radius-xl)',
            width: '100%',
            maxWidth: '420px',
            maxHeight: '70vh',
            background: 'var(--surface-color)',
            border: '1px solid var(--border-subtle)',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 500, letterSpacing: '0.01em' }}>Add to Playlist</h3>
              <button onClick={() => setShowPlaylistModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={20} strokeWidth={1.5} />
              </button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              {userPlaylists.length === 0 && (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center', padding: '2rem 0' }}>
                  No playlists yet. Create one first.
                </p>
              )}
              {userPlaylists.map(pl => {
                const isAdded = addedToPlaylistId === pl.playlist_id;
                return (
                  <div
                    key={pl.playlist_id}
                    onClick={() => !isAdded && handleAddToPlaylist(pl.playlist_id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.85rem 1rem',
                      borderRadius: 'var(--radius-sm)',
                      cursor: isAdded ? 'default' : 'pointer',
                      background: isAdded ? 'rgba(var(--primary-rgb), 0.08)' : 'var(--surface-hover)',
                      border: `1px solid ${isAdded ? 'rgba(var(--primary-rgb), 0.2)' : 'var(--border-subtle)'}`,
                      transition: 'var(--transition)'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <ListMusic size={18} strokeWidth={1.5} color={isAdded ? 'var(--primary-color)' : 'var(--text-muted)'} />
                      <div>
                        <div style={{ fontWeight: 500, fontSize: '0.9rem', color: 'var(--text-main)' }}>{pl.name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 400 }}>{pl.total_songs || 0} tracks</div>
                      </div>
                    </div>
                    {isAdded && <Check size={16} color="var(--primary-color)" strokeWidth={2} />}
                  </div>
                );
              })}
            </div>

            <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid var(--border-subtle)', textAlign: 'center' }}>
              <Link
                to="/playlists"
                onClick={() => setShowPlaylistModal(false)}
                style={{ fontSize: '0.8rem', color: 'var(--primary-color)', textDecoration: 'none', fontWeight: 500 }}
              >
                Create a new playlist
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Hero */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '300px 1fr',
        gap: '3.5rem',
        alignItems: 'center',
        padding: '2.5rem',
        borderRadius: 'var(--radius-xl)',
        background: 'linear-gradient(135deg, rgba(var(--primary-rgb), 0.06) 0%, var(--card-bg) 60%)',
        border: '1px solid var(--border-subtle)'
      }}>
        {/* Holographic CD */}
        <div style={{
          position: 'relative',
          width: '100%',
          aspectRatio: '1/1',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          {/* Ambient glow underneath */}
          <div style={{
            position: 'absolute',
            width: '70%',
            height: '70%',
            borderRadius: '50%',
            background: `radial-gradient(circle, rgba(var(--primary-rgb), ${isCurrentPlaying && isPlaying ? 0.25 : 0.1}) 0%, transparent 70%)`,
            filter: 'blur(30px)',
            transition: 'all 1s ease'
          }} />

          {/* Main disc container */}
          <div style={{
            width: '92%',
            aspectRatio: '1/1',
            position: 'relative'
          }}
            className={isCurrentPlaying && isPlaying ? 'cd-float' : ''}
          >
            {/* Spinning CD */}
            <div
              className="cd-disk"
              style={{
                width: '100%',
                height: '100%',
                borderRadius: '50%',
                position: 'relative',
                background: 'conic-gradient(from 0deg, #1a1a2e, #2d1b4e, #1a2e3d, #2e1a2a, #1a2e1f, #2e2a1a, #1a1a2e)',
                boxShadow: '0 4px 40px rgba(0,0,0,0.5), inset 0 0 60px rgba(255,255,255,0.03)',
                animationPlayState: (isCurrentPlaying && isPlaying) ? 'running' : 'paused',
                overflow: 'hidden'
              }}
            >
              {/* Holographic rainbow sweep */}
              <div className="cd-hologram" style={{
                position: 'absolute',
                inset: 0,
                borderRadius: '50%',
                background: 'conic-gradient(from 0deg, rgba(255,100,100,0.12), rgba(255,200,50,0.1), rgba(50,255,100,0.1), rgba(50,150,255,0.12), rgba(200,50,255,0.1), rgba(255,100,100,0.12))',
                mixBlendMode: 'screen'
              }} />

              {/* Light sweep beam */}
              {(isCurrentPlaying && isPlaying) && (
                <div className="cd-sweep" style={{
                  position: 'absolute',
                  inset: 0,
                  borderRadius: '50%',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    position: 'absolute',
                    top: '-10%',
                    left: '45%',
                    width: '10%',
                    height: '120%',
                    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)',
                    transform: 'rotate(15deg)',
                    filter: 'blur(4px)'
                  }} />
                </div>
              )}

              {/* Data track rings */}
              {[95, 88, 81, 74, 67, 60, 55].map((size, i) => (
                <div key={size} style={{
                  position: 'absolute',
                  top: `${(100 - size) / 2}%`,
                  left: `${(100 - size) / 2}%`,
                  width: `${size}%`,
                  height: `${size}%`,
                  borderRadius: '50%',
                  border: `1px solid rgba(255,255,255,${i % 2 === 0 ? 0.04 : 0.02})`,
                }} />
              ))}

              {/* Subtle inner sheen */}
              <div style={{
                position: 'absolute',
                inset: 0,
                borderRadius: '50%',
                background: 'radial-gradient(circle at 35% 35%, rgba(255,255,255,0.08) 0%, transparent 50%)',
              }} />

              {/* Cover art label (center circle) */}
              <div style={{
                position: 'absolute',
                top: '22%',
                left: '22%',
                width: '56%',
                height: '56%',
                borderRadius: '50%',
                overflow: 'hidden',
                boxShadow: 'inset 0 0 20px rgba(0,0,0,0.3), 0 0 0 2px rgba(255,255,255,0.06)',
              }}>
                <img
                  src={coverSrc}
                  alt={song.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>

              {/* Center spindle */}
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '8%',
                height: '8%',
                borderRadius: '50%',
                background: 'var(--bg-color)',
                border: '2px solid rgba(255,255,255,0.1)',
                zIndex: 3
              }} />
            </div>

            {/* Playing: orbit particles */}
            {(isCurrentPlaying && isPlaying) && (
              <>
                {[0, 1, 2].map(i => (
                  <div key={i} className="cd-orbit" style={{
                    position: 'absolute',
                    inset: '-6px',
                    borderRadius: '50%',
                    border: '1px solid transparent',
                    animationDelay: `${i * 1.2}s`,
                    animationDuration: `${3 + i}s`
                  }}>
                    <div style={{
                      position: 'absolute',
                      top: '0',
                      left: '50%',
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      background: 'var(--primary-color)',
                      boxShadow: '0 0 8px rgba(var(--primary-rgb), 0.6)',
                      transform: 'translate(-50%, -50%)'
                    }} />
                  </div>
                ))}
              </>
            )}
          </div>
        </div>

        {/* Info & Controls */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Genre Badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{
              fontSize: '0.65rem',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              padding: '0.3rem 0.75rem',
              borderRadius: '100px',
              background: 'rgba(var(--primary-rgb), 0.1)',
              color: 'var(--primary-color)'
            }}>
              {song.genre_name || 'Music'}
            </span>
            {song.album_title && (
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 400 }}>
                {song.album_title}
              </span>
            )}
          </div>

          {/* Title & Artist */}
          <div>
            <h1 style={{
              fontSize: '2.25rem',
              fontWeight: 500,
              lineHeight: 1.15,
              letterSpacing: '-0.03em',
              fontFamily: 'Playfair Display, serif',
              marginBottom: '0.5rem'
            }}>
              {song.title}
            </h1>
            <div style={{ fontSize: '1rem', color: 'var(--text-secondary)', fontWeight: 400 }}>
              By <Link to={`/artist/${song.artist_id}`} style={{ color: 'var(--text-main)', textDecoration: 'none', fontWeight: 500 }}>
                {song.artist_name}
              </Link>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button
              onClick={() => {
                if (isCurrentPlaying) {
                  togglePlay();
                } else {
                  playTrack(song);
                }
              }}
              style={{
                padding: '0.75rem 1.75rem',
                borderRadius: '100px',
                background: 'var(--primary-color)',
                color: '#0e0e0e',
                border: 'none',
                fontWeight: 500,
                fontSize: '0.875rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                cursor: 'pointer',
                transition: 'var(--transition)',
                letterSpacing: '0.01em'
              }}
            >
              {isCurrentPlaying && isPlaying ? <Pause size={18} fill="#0e0e0e" /> : <Play size={18} fill="#0e0e0e" />}
              <span>{isCurrentPlaying && isPlaying ? 'Pause' : 'Play'}</span>
            </button>

            <button
              onClick={handleToggleFavorite}
              title={isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '50%',
                background: isFavorite ? 'rgba(229, 115, 115, 0.1)' : 'var(--surface-hover)',
                border: `1px solid ${isFavorite ? 'rgba(229, 115, 115, 0.3)' : 'var(--border-subtle)'}`,
                color: isFavorite ? '#e57373' : 'var(--text-secondary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'var(--transition)'
              }}
            >
              <Heart size={18} fill={isFavorite ? '#e57373' : 'none'} strokeWidth={1.5} />
            </button>

            <button
              onClick={openAddToPlaylist}
              title="Add to Playlist"
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '50%',
                background: 'var(--surface-hover)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-secondary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'var(--transition)'
              }}
            >
              <ListMusic size={18} strokeWidth={1.5} />
            </button>
          </div>

          {/* Progress */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 400 }}>
              <span>{isCurrentPlaying ? formatTime(currentTime) : '0:00'}</span>
              <span>{formatTime(isCurrentPlaying ? duration : song.duration)}</span>
            </div>
            <input
              type="range"
              min="0"
              max={isCurrentPlaying ? (duration || song.duration || 100) : (song.duration || 100)}
              value={isCurrentPlaying ? currentTime : 0}
              onChange={(e) => {
                if (isCurrentPlaying) {
                  seekTo(parseFloat(e.target.value));
                } else {
                  playTrack(song);
                }
              }}
              style={{ width: '100%', height: '4px', cursor: 'pointer' }}
            />
          </div>

          {/* Controls */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
              <button onClick={setIsShuffle} style={{ background: 'none', border: 'none', color: isShuffle ? 'var(--primary-color)' : 'var(--text-muted)', cursor: 'pointer' }}>
                <Shuffle size={16} strokeWidth={1.5} />
              </button>
              <button onClick={handlePrevTrack} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                <SkipBack size={20} strokeWidth={1.5} />
              </button>
              <button onClick={handleNextTrack} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                <SkipForward size={20} strokeWidth={1.5} />
              </button>
              <button onClick={setIsRepeat} style={{ background: 'none', border: 'none', color: isRepeat ? 'var(--primary-color)' : 'var(--text-muted)', cursor: 'pointer' }}>
                <Repeat size={16} strokeWidth={1.5} />
              </button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <button onClick={toggleMute} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                {isMuted ? <VolumeX size={16} strokeWidth={1.5} /> : <Volume2 size={16} strokeWidth={1.5} />}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={isMuted ? 0 : volume}
                onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                style={{ width: '80px', height: '3px' }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Queue */}
      {queue.length > 0 && (
        <div style={{ marginTop: '3rem' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
            <h3 className="section-title" style={{ fontSize: '1.25rem' }}>Up Next</h3>
            <span className="section-label">{queue.length} tracks</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            {queue.map((track, idx) => {
              const isPlayingItem = currentTrack?.song_id === track.song_id;
              const itemCover = track.cover_image
                ? (track.cover_image.startsWith('http') ? track.cover_image : `http://localhost/Echofy${track.cover_image}`)
                : 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=150&q=80';

              return (
                <div
                  key={track.song_id || idx}
                  onClick={() => playTrack(track, queue)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.75rem 1rem',
                    borderRadius: 'var(--radius-sm)',
                    cursor: 'pointer',
                    background: isPlayingItem ? 'rgba(var(--primary-rgb), 0.06)' : 'transparent',
                    border: `1px solid ${isPlayingItem ? 'rgba(var(--primary-rgb), 0.15)' : 'transparent'}`,
                    transition: 'var(--transition)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <span style={{
                      fontSize: '0.8rem',
                      color: isPlayingItem ? 'var(--primary-color)' : 'var(--text-muted)',
                      fontWeight: 500,
                      width: '24px',
                      textAlign: 'center'
                    }}>
                      {idx + 1}
                    </span>

                    <img
                      src={itemCover}
                      alt={track.title}
                      style={{ width: '40px', height: '40px', borderRadius: '6px', objectFit: 'cover' }}
                    />

                    <div>
                      <div style={{
                        fontWeight: 500,
                        color: isPlayingItem ? 'var(--primary-color)' : 'var(--text-main)',
                        fontSize: '0.9rem',
                        letterSpacing: '0.01em'
                      }}>
                        {track.title}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 400 }}>
                        {track.artist_name || 'Unknown'}
                      </div>
                    </div>
                  </div>

                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: 400 }}>
                    <Clock size={13} strokeWidth={1.5} />
                    <span>{formatTime(track.duration)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
