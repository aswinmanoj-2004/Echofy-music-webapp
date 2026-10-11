import React, { useEffect, useState, useRef } from 'react';
import api from '../../services/api';
import SongCard from '../../components/music/SongCard';
import ArtistCard from '../../components/music/ArtistCard';
import AlbumCard from '../../components/music/AlbumCard';
import { Play, Pause, TrendingUp, Clock, Sparkles, Disc3, Mic2 } from 'lucide-react';
import { usePlayer } from '../../context/PlayerContext';
import { Link } from 'react-router-dom';

/* ── List Row Component ── */
function ListRow({ song, index, isCurrent, isPlaying, queue }) {
  const { playTrack, togglePlay } = usePlayer();
  const [hovered, setHovered] = React.useState(false);

  const coverSrc = song.cover_image
    ? (song.cover_image.startsWith('http') ? song.cover_image : `http://localhost/Echofy${song.cover_image}`)
    : 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=300&q=80';

  const handleClick = () => {
    if (isCurrent) {
      togglePlay();
    } else {
      playTrack(song, queue);
    }
  };

  return (
    <div
      onClick={handleClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'grid',
        gridTemplateColumns: '36px 48px 1fr auto',
        alignItems: 'center',
        gap: '1rem',
        padding: '0.65rem 1rem',
        borderRadius: 'var(--radius-sm)',
        cursor: 'pointer',
        background: hovered
          ? 'rgba(var(--primary-rgb), 0.05)'
          : isCurrent ? 'rgba(var(--primary-rgb), 0.08)' : 'transparent',
        transition: 'background 0.2s ease',
      }}
    >
      {/* Track number / play icon */}
      <div style={{
        textAlign: 'center',
        fontSize: '0.8rem',
        fontWeight: 500,
        color: isCurrent ? 'var(--primary-color)' : 'var(--text-muted)',
        minWidth: '36px'
      }}>
        {hovered || isCurrent ? (
          isCurrent && isPlaying ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '2px', height: '16px' }}>
              {[0, 1, 2].map(i => (
                <div key={i} className="eq-bar" style={{
                  width: '3px', borderRadius: '1.5px',
                  background: 'var(--primary-color)',
                  animationDelay: `${i * 0.15}s`
                }} />
              ))}
            </div>
          ) : (
            <Play size={14} fill="var(--primary-color)" color="var(--primary-color)" />
          )
        ) : (
          index
        )}
      </div>

      {/* Cover art */}
      <Link to={`/song/${song.song_id}`} onClick={e => e.stopPropagation()}>
        <img
          src={coverSrc}
          alt={song.title}
          style={{
            width: '48px', height: '48px',
            borderRadius: '6px',
            objectFit: 'cover',
            boxShadow: 'var(--shadow-sm)'
          }}
        />
      </Link>

      {/* Song info */}
      <Link to={`/song/${song.song_id}`} onClick={e => e.stopPropagation()} style={{ textDecoration: 'none', overflow: 'hidden' }}>
        <div style={{
          fontWeight: 500,
          fontSize: '0.9rem',
          color: isCurrent ? 'var(--primary-color)' : 'var(--text-main)',
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
        }}>
          {song.title}
        </div>
        <div style={{
          fontSize: '0.8rem',
          color: 'var(--text-muted)',
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          marginTop: '0.15rem'
        }}>
          {song.artist_name}
          {song.genre_name && <span style={{ color: 'var(--text-muted)', opacity: 0.7 }}> · {song.genre_name}</span>}
        </div>
      </Link>

      {/* Play button */}
      <div style={{
        opacity: hovered ? 1 : 0,
        transition: 'opacity 0.2s ease'
      }}>
        <button
          onClick={(e) => { e.stopPropagation(); handleClick(); }}
          style={{
            width: '32px', height: '32px', borderRadius: '50%',
            background: 'var(--primary-color)', border: 'none',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', color: '#0e0e0e'
          }}
        >
          {isCurrent && isPlaying ? <Pause size={13} fill="#0e0e0e" /> : <Play size={13} fill="#0e0e0e" style={{ marginLeft: '1px' }} />}
        </button>
      </div>
    </div>
  );
}

/* Scroll reveal hook */
function useScrollReveal() {
  const ref = useRef(null);
  const [revealed, setRevealed] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setRevealed(true); obs.disconnect(); } },
      { threshold: 0.12 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return { ref, revealed };
}

function Reveal({ children, className = '', delay = 0 }) {
  const { ref, revealed } = useScrollReveal();
  return (
    <div ref={ref} className={`scroll-reveal ${revealed ? 'revealed' : ''} ${className}`} style={{ transitionDelay: `${delay}s` }}>
      {children}
    </div>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good Morning';
  if (h < 18) return 'Good Afternoon';
  return 'Good Evening';
}

export default function Home() {
  const [trendingSongs, setTrendingSongs] = useState([]);
  const [latestSongs, setLatestSongs] = useState([]);
  const [popularArtists, setPopularArtists] = useState([]);
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(true);

  const { playTrack, currentTrack, isPlaying, togglePlay } = usePlayer();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resTrending, resLatest, resArtists, resAlbums] = await Promise.all([
          api.get('/songs/index.php?trending=1&limit=10'),
          api.get('/songs/index.php?latest=1&limit=10'),
          api.get('/artists/index.php?limit=10'),
          api.get('/albums/index.php')
        ]);
        if (resTrending.data.status) setTrendingSongs(resTrending.data.data);
        if (resLatest.data.status) setLatestSongs(resLatest.data.data);
        if (resArtists.data.status) setPopularArtists(resArtists.data.data);
        if (resAlbums.data.status) setAlbums(resAlbums.data.data);
      } catch (err) {
        console.error("Home feed fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const featuredSong = trendingSongs.length > 0 ? trendingSongs[0] : null;
  const isFeaturedPlaying = currentTrack?.song_id === featuredSong?.song_id && isPlaying;

  const coverUrl = (img) => {
    if (!img) return 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=600&q=80';
    if (img.startsWith('http')) return img;
    return `http://localhost/Echofy${img}`;
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div style={{
          width: '36px', height: '36px',
          border: '2px solid var(--border-subtle)',
          borderTopColor: 'var(--primary-color)',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '3.5rem', animation: 'fadeIn 0.4s ease' }}>

      {/* ── Greeting + Featured Hero ── */}
      <div style={{ position: 'relative', overflow: 'hidden' }}>
        {/* Background gradient orbs */}
        <div style={{
          position: 'absolute', top: '-60px', right: '-60px',
          width: '300px', height: '300px', borderRadius: '50%',
          background: `radial-gradient(circle, rgba(var(--primary-rgb), 0.08) 0%, transparent 70%)`,
          filter: 'blur(50px)', pointerEvents: 'none'
        }} />
        <div style={{
          position: 'absolute', bottom: '-40px', left: '-40px',
          width: '200px', height: '200px', borderRadius: '50%',
          background: `radial-gradient(circle, rgba(var(--primary-rgb), 0.05) 0%, transparent 70%)`,
          filter: 'blur(40px)', pointerEvents: 'none'
        }} />

        {/* Greeting */}
        <Reveal>
          <div style={{ marginBottom: '2rem', position: 'relative', zIndex: 2 }}>
            <span className="section-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Sparkles size={13} /> Discover
            </span>
            <h1 style={{
              fontSize: '2.5rem', fontWeight: 500,
              fontFamily: 'Playfair Display, serif',
              letterSpacing: '-0.02em', marginTop: '0.5rem'
            }}>
              {getGreeting()}
            </h1>
          </div>
        </Reveal>

        {/* Featured Card */}
        {featuredSong && (
          <Reveal delay={0.1}>
            <div style={{
              position: 'relative', zIndex: 2,
              padding: '2.5rem',
              borderRadius: 'var(--radius-xl)',
              background: 'linear-gradient(135deg, rgba(var(--primary-rgb), 0.1) 0%, var(--card-bg) 60%)',
              border: '1px solid var(--border-subtle)',
              display: 'grid',
              gridTemplateColumns: '180px 1fr',
              gap: '2.5rem',
              alignItems: 'center',
              overflow: 'hidden'
            }}>
              {/* Featured cover with floating animation */}
              <div className="hero-float" style={{ position: 'relative' }}>
                <img
                  src={coverUrl(featuredSong.cover_image)}
                  alt={featuredSong.title}
                  style={{
                    width: '180px', height: '180px',
                    borderRadius: 'var(--radius-lg)',
                    objectFit: 'cover',
                    boxShadow: 'var(--shadow-lg)'
                  }}
                />
                {/* Play overlay */}
                <button
                  onClick={() => isFeaturedPlaying ? togglePlay() : playTrack(featuredSong, trendingSongs)}
                  style={{
                    position: 'absolute', bottom: '-12px', right: '-12px',
                    width: '48px', height: '48px', borderRadius: '50%',
                    background: 'var(--primary-color)', border: '3px solid var(--bg-color)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#0e0e0e', cursor: 'pointer',
                    boxShadow: '0 4px 20px rgba(var(--primary-rgb), 0.4)',
                    transition: 'transform 0.2s ease'
                  }}
                  onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
                  onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                >
                  {isFeaturedPlaying ? <Pause size={18} fill="#0e0e0e" /> : <Play size={18} fill="#0e0e0e" style={{ marginLeft: '2px' }} />}
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <span style={{
                  fontSize: '0.6rem', fontWeight: 600,
                  color: 'var(--primary-color)',
                  letterSpacing: '0.15em', textTransform: 'uppercase',
                  display: 'flex', alignItems: 'center', gap: '0.4rem'
                }}>
                  <TrendingUp size={12} /> Featured Track
                </span>
                <h2 style={{
                  fontSize: '2rem', fontWeight: 500, lineHeight: 1.15,
                  letterSpacing: '-0.02em', fontFamily: 'Playfair Display, serif'
                }}>
                  {featuredSong.title}
                </h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', fontWeight: 400 }}>
                  {featuredSong.artist_name}
                  {featuredSong.genre_name && <span style={{ color: 'var(--text-muted)' }}> · {featuredSong.genre_name}</span>}
                </p>
                <button
                  onClick={() => isFeaturedPlaying ? togglePlay() : playTrack(featuredSong, trendingSongs)}
                  className="btn-primary"
                  style={{ padding: '0.7rem 1.75rem', fontSize: '0.85rem', width: 'fit-content', marginTop: '0.25rem' }}
                >
                  {isFeaturedPlaying ? <><Pause size={14} fill="#0e0e0e" /> Playing</> : <><Play size={14} fill="#0e0e0e" /> Listen Now</>}
                </button>
              </div>
            </div>
          </Reveal>
        )}
      </div>

      {/* ── Quick Stats Bar ── */}
      <Reveal delay={0.15}>
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem',
          padding: '0'
        }}>
          {[
            { icon: <TrendingUp size={18} />, label: 'Trending', value: `${trendingSongs.length} tracks` },
            { icon: <Disc3 size={18} />, label: 'New Releases', value: `${latestSongs.length} tracks` },
            { icon: <Mic2 size={18} />, label: 'Artists', value: `${popularArtists.length} artists` },
            { icon: <Clock size={18} />, label: 'Albums', value: `${albums.length} albums` },
          ].map((stat, i) => (
            <div key={i} className="glass-card" style={{
              padding: '1.25rem 1.5rem',
              borderRadius: 'var(--radius-md)',
              display: 'flex', alignItems: 'center', gap: '1rem'
            }}>
              <div style={{
                width: '40px', height: '40px', borderRadius: '10px',
                background: 'rgba(var(--primary-rgb), 0.08)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--primary-color)', flexShrink: 0
              }}>
                {stat.icon}
              </div>
              <div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 500, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                  {stat.label}
                </div>
                <div style={{ fontSize: '1rem', fontWeight: 500, color: 'var(--text-main)', marginTop: '0.1rem' }}>
                  {stat.value}
                </div>
              </div>
            </div>
          ))}
        </div>
      </Reveal>

      {/* ── Trending Section ── */}
      {trendingSongs.length > 0 && (
        <Reveal delay={0.1}>
          <section style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{
                  width: '32px', height: '32px', borderRadius: '8px',
                  background: 'rgba(var(--primary-rgb), 0.1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'var(--primary-color)'
                }}>
                  <TrendingUp size={16} />
                </div>
                <h2 className="section-title" style={{ fontSize: '1.5rem' }}>Trending Now</h2>
              </div>
              <span className="section-label">This week</span>
            </div>

            {/* Horizontal scroll with custom styling */}
            <div style={{
              display: 'flex', gap: '1rem',
              overflowX: 'auto', paddingBottom: '0.5rem',
              scrollSnapType: 'x mandatory'
            }}>
              {trendingSongs.map((song, i) => (
                <div key={song.song_id} style={{ scrollSnapAlign: 'start', flexShrink: 0 }}>
                  <SongCard song={song} queue={trendingSongs} />
                </div>
              ))}
            </div>
          </section>
        </Reveal>
      )}

      {/* ── Artists Section ── */}
      {popularArtists.length > 0 && (
        <Reveal delay={0.1}>
          <section style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{
                  width: '32px', height: '32px', borderRadius: '8px',
                  background: 'rgba(var(--primary-rgb), 0.1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'var(--primary-color)'
                }}>
                  <Mic2 size={16} />
                </div>
                <h2 className="section-title" style={{ fontSize: '1.5rem' }}>Popular Artists</h2>
              </div>
              <span className="section-label">Top creators</span>
            </div>

            <div style={{
              display: 'flex', gap: '1rem',
              overflowX: 'auto', paddingBottom: '0.5rem',
              scrollSnapType: 'x mandatory'
            }}>
              {popularArtists.map((artist) => (
                <div key={artist.artist_id} style={{ scrollSnapAlign: 'start', flexShrink: 0 }}>
                  <ArtistCard artist={artist} />
                </div>
              ))}
            </div>
          </section>
        </Reveal>
      )}

      {/* ── New Releases (List View) ── */}
      {latestSongs.length > 0 && (
        <Reveal delay={0.1}>
          <section style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{
                  width: '32px', height: '32px', borderRadius: '8px',
                  background: 'rgba(var(--primary-rgb), 0.1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'var(--primary-color)'
                }}>
                  <Sparkles size={16} />
                </div>
                <h2 className="section-title" style={{ fontSize: '1.5rem' }}>New Releases</h2>
              </div>
              <span className="section-label">Just dropped</span>
            </div>

            {/* List view */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              {latestSongs.map((song, i) => {
                const isCurrentSong = currentTrack?.song_id === song.song_id;
                return (
                  <ListRow
                    key={song.song_id}
                    song={song}
                    index={i + 1}
                    isCurrent={isCurrentSong}
                    isPlaying={isCurrentSong && isPlaying}
                    queue={latestSongs}
                  />
                );
              })}
            </div>
          </section>
        </Reveal>
      )}

      {/* ── Albums ── */}
      {albums.length > 0 && (
        <Reveal delay={0.1}>
          <section style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{
                  width: '32px', height: '32px', borderRadius: '8px',
                  background: 'rgba(var(--primary-rgb), 0.1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'var(--primary-color)'
                }}>
                  <Disc3 size={16} />
                </div>
                <h2 className="section-title" style={{ fontSize: '1.5rem' }}>Albums</h2>
              </div>
              <span className="section-label">Collections</span>
            </div>

            <div style={{
              display: 'flex', gap: '1rem',
              overflowX: 'auto', paddingBottom: '0.5rem',
              scrollSnapType: 'x mandatory'
            }}>
              {albums.map((album) => (
                <div key={album.album_id} style={{ scrollSnapAlign: 'start', flexShrink: 0 }}>
                  <AlbumCard album={album} />
                </div>
              ))}
            </div>
          </section>
        </Reveal>
      )}
    </div>
  );
}
