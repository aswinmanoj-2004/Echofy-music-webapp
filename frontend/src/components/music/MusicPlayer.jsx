import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePlayer } from '../../context/PlayerContext';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Volume2,
  VolumeX,
  Video,
  Maximize2
} from 'lucide-react';

export default function MusicPlayer() {
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
    youtubeId,
    togglePlay,
    handleNextTrack,
    handlePrevTrack,
    seekTo,
    handleVolumeChange,
    toggleMute,
    setIsShuffle,
    setIsRepeat,
  } = usePlayer();

  const [showVideoModal, setShowVideoModal] = useState(false);

  if (!currentTrack) return null;

  const formatTime = (secs) => {
    if (!secs || isNaN(secs)) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const coverSrc = currentTrack.cover_image
    ? (currentTrack.cover_image.startsWith('http') ? currentTrack.cover_image : `http://localhost/Echofy${currentTrack.cover_image}`)
    : (youtubeId ? `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg` : 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=300&q=80');

  const goToSongDetails = () => {
    if (currentTrack?.song_id) {
      navigate(`/song/${currentTrack.song_id}`);
    }
  };

  return (
    <>
      {/* YouTube Player */}
      <div style={{
        position: 'fixed',
        bottom: showVideoModal ? '94px' : '-9999px',
        right: showVideoModal ? '20px' : '-9999px',
        width: showVideoModal ? '340px' : '200px',
        height: showVideoModal ? '191px' : '200px',
        opacity: showVideoModal ? 1 : 0.01,
        pointerEvents: showVideoModal ? 'auto' : 'none',
        zIndex: 150,
        borderRadius: 'var(--radius-md)',
        overflow: 'hidden',
        boxShadow: 'var(--shadow-lg)',
        border: '1px solid var(--border-color)',
        background: '#000',
        transition: 'var(--transition)',
        visibility: youtubeId ? 'visible' : 'hidden'
      }}>
        <div id="echofy-yt-player" style={{ width: '100%', height: '100%' }}></div>
      </div>

      {/* Player Bar */}
      <div style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: 'var(--player-height)',
        background: 'var(--surface-color)',
        borderTop: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 2rem',
        zIndex: 100
      }}>
        {/* Track Info */}
        <div
          onClick={goToSongDetails}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            minWidth: '240px',
            maxWidth: '300px',
            cursor: 'pointer',
            padding: '0.4rem',
            borderRadius: 'var(--radius-sm)',
            transition: 'var(--transition)'
          }}
          className="player-track-info-hover"
        >
          <img
            src={coverSrc}
            alt={currentTrack.title}
            style={{
              width: '50px',
              height: '50px',
              borderRadius: 'var(--radius-sm)',
              objectFit: 'cover'
            }}
          />
          <div style={{ overflow: 'hidden' }}>
            <div style={{
              fontWeight: 500,
              fontSize: '0.9rem',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              letterSpacing: '0.01em'
            }}>
              {youtubeId && <Video size={14} color="#e57373" />}
              <span>{currentTrack.title}</span>
            </div>
            <div style={{
              fontSize: '0.8rem',
              color: 'var(--text-muted)',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              fontWeight: 400
            }}>
              {currentTrack.artist_name || 'Unknown Artist'}
            </div>
          </div>
        </div>

        {/* Controls */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', flex: 1, maxWidth: '560px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <button onClick={setIsShuffle} style={{ background: 'none', border: 'none', color: isShuffle ? 'var(--primary-color)' : 'var(--text-muted)', cursor: 'pointer' }}>
              <Shuffle size={16} strokeWidth={1.5} />
            </button>

            <button onClick={handlePrevTrack} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
              <SkipBack size={18} strokeWidth={1.5} />
            </button>

            <button
              onClick={togglePlay}
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                background: 'var(--primary-color)',
                color: '#0e0e0e',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'var(--transition)'
              }}
            >
              {isPlaying ? <Pause size={18} fill="#0e0e0e" /> : <Play size={18} fill="#0e0e0e" style={{ marginLeft: '2px' }} />}
            </button>

            <button onClick={handleNextTrack} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
              <SkipForward size={18} strokeWidth={1.5} />
            </button>

            <button onClick={setIsRepeat} style={{ background: 'none', border: 'none', color: isRepeat ? 'var(--primary-color)' : 'var(--text-muted)', cursor: 'pointer' }}>
              <Repeat size={16} strokeWidth={1.5} />
            </button>
          </div>

          {/* Progress */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', width: '100%' }}>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', minWidth: '35px', textAlign: 'right', fontWeight: 400 }}>
              {formatTime(currentTime)}
            </span>

            <input
              type="range"
              min="0"
              max={duration || 100}
              value={currentTime || 0}
              onChange={(e) => seekTo(parseFloat(e.target.value))}
              style={{ flex: 1, height: '3px', borderRadius: '2px' }}
            />

            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', minWidth: '35px', fontWeight: 400 }}>
              {formatTime(duration)}
            </span>
          </div>
        </div>

        {/* Volume & Extras */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: '180px', justifyContent: 'flex-end' }}>
          {youtubeId && (
            <button
              onClick={() => setShowVideoModal(!showVideoModal)}
              style={{
                background: showVideoModal ? 'rgba(var(--primary-rgb), 0.1)' : 'transparent',
                border: '1px solid var(--border-subtle)',
                color: showVideoModal ? 'var(--primary-color)' : 'var(--text-secondary)',
                padding: '0.35rem 0.75rem',
                borderRadius: '100px',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                fontSize: '0.7rem',
                fontWeight: 500,
                cursor: 'pointer',
                letterSpacing: '0.02em'
              }}
            >
              <Video size={12} />
              <span>{showVideoModal ? 'Hide' : 'Video'}</span>
            </button>
          )}

          <button
            onClick={goToSongDetails}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              padding: '0.25rem',
              transition: 'var(--transition)'
            }}
          >
            <Maximize2 size={15} strokeWidth={1.5} />
          </button>

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
    </>
  );
}
