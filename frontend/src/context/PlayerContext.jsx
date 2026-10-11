import React, { createContext, useContext, useState, useRef, useEffect } from 'react';
import api from '../services/api';

const PlayerContext = createContext();

export function getYouTubeId(url) {
  if (!url || typeof url !== 'string') return null;
  const str = url.trim();
  const regExp = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|shorts)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i;
  const match = str.match(regExp);
  return match ? match[1] : null;
}

export function getAudioStreamUrl(track) {
  if (!track || !track.file_path) return '';
  if (getYouTubeId(track.file_path)) return track.file_path;

  // Direct remote HTTP/HTTPS audio stream
  if (track.file_path.startsWith('http://') || track.file_path.startsWith('https://')) {
    return track.file_path;
  }

  // Use HTTP 206 Byte-Range Streamer Endpoint for local backend audio files
  const apiBase = window.location.origin.includes('localhost:5173')
    ? 'http://localhost/Echofy/backend/api'
    : '/backend/api';

  if (track.song_id) {
    return `${apiBase}/songs/stream.php?id=${track.song_id}`;
  }
  
  return `${apiBase}/songs/stream.php?file=${encodeURIComponent(track.file_path)}`;
}

export function PlayerProvider({ children }) {
  const audioRef = useRef(new Audio());
  const preloadAudioRef = useRef(new Audio());
  const ytPlayerRef = useRef(null);

  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [queue, setQueue] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [isShuffle, setIsShuffle] = useState(false);
  const [isRepeat, setIsRepeat] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [youtubeId, setYoutubeId] = useState(null);
  const [lowSpeedMode, setLowSpeedMode] = useState(true); // Enabled by default for maximum low-internet performance

  const handleNextTrackRef = useRef(null);

  // Configure HTML5 Audio elements on mount
  useEffect(() => {
    const audio = audioRef.current;
    audio.preload = 'auto';
    audio.preservesPitch = true;

    const preloadAudio = preloadAudioRef.current;
    preloadAudio.preload = 'auto';
    preloadAudio.muted = true;
  }, []);

  // Load YouTube Iframe API script on mount
  useEffect(() => {
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      if (firstScriptTag && firstScriptTag.parentNode) {
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
      } else {
        document.head.appendChild(tag);
      }
    }
  }, []);

  // Sync HTML5 volume
  useEffect(() => {
    const audio = audioRef.current;
    audio.volume = volume;
  }, [volume]);

  // Preload upcoming track in queue to guarantee zero-latency transition on slow connections
  useEffect(() => {
    if (queue.length > 0 && currentIndex >= 0) {
      const nextIdx = (currentIndex + 1) % queue.length;
      const nextTrack = queue[nextIdx];
      if (nextTrack && nextTrack.file_path && !getYouTubeId(nextTrack.file_path)) {
        const streamUrl = getAudioStreamUrl(nextTrack);
        if (preloadAudioRef.current.src !== streamUrl) {
          preloadAudioRef.current.src = streamUrl;
        }
      }
    }
  }, [queue, currentIndex]);

  // Audio HTML5 element listeners
  useEffect(() => {
    const audio = audioRef.current;

    const handleTimeUpdate = () => {
      if (!youtubeId) {
        setCurrentTime(audio.currentTime);
      }
    };

    const handleLoadedMetadata = () => {
      if (!youtubeId) {
        setDuration(audio.duration || 0);
        setIsBuffering(false);
      }
    };

    const handleWaiting = () => {
      setIsBuffering(true);
    };

    const handleCanPlay = () => {
      setIsBuffering(false);
    };

    const handleEnded = () => {
      setIsBuffering(false);
      if (handleNextTrackRef.current) {
        handleNextTrackRef.current();
      }
    };

    const handleError = (e) => {
      console.warn("Audio playback error:", e);
      setIsBuffering(false);
      setIsPlaying(false);
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('waiting', handleWaiting);
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('waiting', handleWaiting);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
    };
  }, [youtubeId]);

  // YouTube time update polling interval
  useEffect(() => {
    let interval = null;
    if (youtubeId && isPlaying) {
      interval = setInterval(() => {
        if (ytPlayerRef.current && typeof ytPlayerRef.current.getCurrentTime === 'function') {
          const curr = ytPlayerRef.current.getCurrentTime();
          const dur = ytPlayerRef.current.getDuration();
          if (typeof curr === 'number' && !isNaN(curr)) setCurrentTime(curr);
          if (typeof dur === 'number' && !isNaN(dur) && dur > 0) setDuration(dur);
        }
      }, 500);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [youtubeId, isPlaying]);

  // Helper to initialize or load video in YouTube player with low-bandwidth optimization
  const setupYouTubePlayer = (ytId) => {
    const initOrLoadYTPlayer = (id) => {
      if (ytPlayerRef.current && typeof ytPlayerRef.current.loadVideoById === 'function') {
        ytPlayerRef.current.loadVideoById({
          videoId: id,
          suggestedQuality: lowSpeedMode ? 'small' : 'medium'
        });
        ytPlayerRef.current.playVideo();
        setIsPlaying(true);
        setIsBuffering(false);
      } else {
        try {
          ytPlayerRef.current = new window.YT.Player('echofy-yt-player', {
            height: '100%',
            width: '100%',
            videoId: id,
            playerVars: {
              autoplay: 1,
              controls: 0,
              modestbranding: 1,
              rel: 0,
              playsinline: 1,
              enablejsapi: 1,
              vq: lowSpeedMode ? 'small' : 'medium'
            },
            events: {
              onReady: (event) => {
                event.target.playVideo();
                event.target.setVolume(volume * 100);
                if (typeof event.target.setPlaybackQuality === 'function') {
                  event.target.setPlaybackQuality(lowSpeedMode ? 'small' : 'medium');
                }
                setIsPlaying(true);
                setIsBuffering(false);
              },
              onStateChange: (event) => {
                if (event.data === window.YT.PlayerState.PLAYING) {
                  setIsPlaying(true);
                  setIsBuffering(false);
                  const dur = event.target.getDuration();
                  if (dur) setDuration(dur);
                } else if (event.data === window.YT.PlayerState.BUFFERING) {
                  setIsBuffering(true);
                } else if (event.data === window.YT.PlayerState.PAUSED) {
                  setIsPlaying(false);
                  setIsBuffering(false);
                } else if (event.data === window.YT.PlayerState.ENDED) {
                  setIsPlaying(false);
                  setIsBuffering(false);
                  if (handleNextTrackRef.current) {
                    handleNextTrackRef.current();
                  }
                }
              },
              onError: (event) => {
                console.warn("YouTube Player error code:", event.data);
                setIsBuffering(false);
                setIsPlaying(false);
                // Auto skip on error
                setTimeout(() => {
                  if (handleNextTrackRef.current) {
                    handleNextTrackRef.current();
                  }
                }, 1000);
              }
            }
          });
        } catch (e) {
          console.error("YouTube Player init error:", e);
          setIsBuffering(false);
        }
      }
    };

    const createPlayer = () => {
      const el = document.getElementById('echofy-yt-player');
      if (!el) {
        let retries = 0;
        const retryInterval = setInterval(() => {
          retries++;
          const retryEl = document.getElementById('echofy-yt-player');
          if (retryEl) {
            clearInterval(retryInterval);
            initOrLoadYTPlayer(ytId);
          } else if (retries > 15) {
            clearInterval(retryInterval);
            console.error("YouTube player container element not found");
            setIsBuffering(false);
          }
        }, 100);
        return;
      }
      initOrLoadYTPlayer(ytId);
    };

    if (window.YT && window.YT.Player) {
      createPlayer();
    } else {
      window.onYouTubeIframeAPIReady = () => {
        createPlayer();
      };
      const checkYt = setInterval(() => {
        if (window.YT && window.YT.Player) {
          clearInterval(checkYt);
          createPlayer();
        }
      }, 200);
    }
  };

  const playTrack = (track, newQueue = null) => {
    if (!track) return;

    if (newQueue) {
      setQueue(newQueue);
      const idx = newQueue.findIndex((t) => t.song_id === track.song_id);
      setCurrentIndex(idx !== -1 ? idx : 0);
    } else if (queue.length === 0) {
      setQueue([track]);
      setCurrentIndex(0);
    } else {
      const idx = queue.findIndex((t) => t.song_id === track.song_id);
      if (idx !== -1) {
        setCurrentIndex(idx);
      } else {
        setQueue((prev) => [...prev, track]);
        setCurrentIndex(queue.length);
      }
    }

    const ytId = getYouTubeId(track.file_path);
    setCurrentTrack(track);
    setIsBuffering(true);

    if (ytId) {
      // Pause HTML5 audio
      audioRef.current.pause();
      setYoutubeId(ytId);
      setupYouTubePlayer(ytId);
      recordRecentlyPlayed(track.song_id);
    } else {
      // Pause YouTube player if active
      if (ytPlayerRef.current && typeof ytPlayerRef.current.pauseVideo === 'function') {
        ytPlayerRef.current.pauseVideo();
      }
      setYoutubeId(null);

      const audio = audioRef.current;
      if (track.file_path) {
        const streamUrl = getAudioStreamUrl(track);
        audio.src = streamUrl;
        audio.play().then(() => {
          setIsPlaying(true);
          setIsBuffering(false);
          recordRecentlyPlayed(track.song_id);
        }).catch((err) => {
          console.error("Audio playback error:", err);
          setIsBuffering(false);
        });
      }
    }
  };

  const recordRecentlyPlayed = async (songId) => {
    try {
      await api.post('/recent/add.php', { song_id: songId });
      await api.get(`/songs/detail.php?id=${songId}`);
    } catch (e) {
      // Silent error for guest listeners
    }
  };

  const togglePlay = () => {
    if (!currentTrack) return;

    if (youtubeId && ytPlayerRef.current) {
      try {
        if (isPlaying) {
          if (typeof ytPlayerRef.current.pauseVideo === 'function') {
            ytPlayerRef.current.pauseVideo();
          }
          setIsPlaying(false);
        } else {
          if (typeof ytPlayerRef.current.playVideo === 'function') {
            ytPlayerRef.current.playVideo();
          }
          setIsPlaying(true);
        }
      } catch (e) {
        console.error("YouTube toggle play error:", e);
      }
      return;
    }

    const audio = audioRef.current;
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play().then(() => {
        setIsPlaying(true);
      }).catch((err) => {
        console.error("Audio toggle play error:", err);
      });
    }
  };

  const handleNextTrack = () => {
    if (queue.length === 0) return;
    if (isRepeat) {
      if (youtubeId && ytPlayerRef.current && typeof ytPlayerRef.current.seekTo === 'function') {
        ytPlayerRef.current.seekTo(0, true);
        ytPlayerRef.current.playVideo();
        setIsPlaying(true);
      } else {
        audioRef.current.currentTime = 0;
        audioRef.current.play();
        setIsPlaying(true);
      }
      return;
    }

    let nextIdx;
    if (isShuffle) {
      nextIdx = Math.floor(Math.random() * queue.length);
    } else {
      nextIdx = (currentIndex + 1) % queue.length;
    }

    setCurrentIndex(nextIdx);
    playTrack(queue[nextIdx]);
  };
  handleNextTrackRef.current = handleNextTrack;

  const handlePrevTrack = () => {
    if (queue.length === 0) return;
    if (!youtubeId && audioRef.current.currentTime > 3) {
      audioRef.current.currentTime = 0;
      return;
    }
    if (youtubeId && ytPlayerRef.current && typeof ytPlayerRef.current.getCurrentTime === 'function' && ytPlayerRef.current.getCurrentTime() > 3) {
      ytPlayerRef.current.seekTo(0, true);
      return;
    }
    const prevIdx = (currentIndex - 1 + queue.length) % queue.length;
    setCurrentIndex(prevIdx);
    playTrack(queue[prevIdx]);
  };

  const seekTo = (seconds) => {
    if (youtubeId && ytPlayerRef.current && typeof ytPlayerRef.current.seekTo === 'function') {
      ytPlayerRef.current.seekTo(seconds, true);
      setCurrentTime(seconds);
    } else if (audioRef.current) {
      audioRef.current.currentTime = seconds;
      setCurrentTime(seconds);
    }
  };

  const handleVolumeChange = (newVol) => {
    setVolume(newVol);
    if (audioRef.current) {
      audioRef.current.volume = newVol;
    }
    if (youtubeId && ytPlayerRef.current && typeof ytPlayerRef.current.setVolume === 'function') {
      ytPlayerRef.current.setVolume(newVol * 100);
    }
    setIsMuted(newVol === 0);
  };

  const toggleMute = () => {
    if (isMuted) {
      const targetVol = volume || 0.8;
      if (audioRef.current) audioRef.current.volume = targetVol;
      if (youtubeId && ytPlayerRef.current && typeof ytPlayerRef.current.unMute === 'function') {
        ytPlayerRef.current.unMute();
        ytPlayerRef.current.setVolume(targetVol * 100);
      }
      setIsMuted(false);
    } else {
      if (audioRef.current) audioRef.current.volume = 0;
      if (youtubeId && ytPlayerRef.current && typeof ytPlayerRef.current.mute === 'function') {
        ytPlayerRef.current.mute();
      }
      setIsMuted(true);
    }
  };

  return (
    <PlayerContext.Provider
      value={{
        currentTrack,
        isPlaying,
        isBuffering,
        currentTime,
        duration,
        volume,
        isMuted,
        queue,
        currentIndex,
        isShuffle,
        isRepeat,
        isExpanded,
        youtubeId,
        lowSpeedMode,
        toggleLowSpeedMode: () => setLowSpeedMode(!lowSpeedMode),
        playTrack,
        togglePlay,
        handleNextTrack,
        handlePrevTrack,
        seekTo,
        handleVolumeChange,
        toggleMute,
        setIsShuffle: () => setIsShuffle(!isShuffle),
        setIsRepeat: () => setIsRepeat(!isRepeat),
        setIsExpanded: (val) => setIsExpanded(val),
        setQueue,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  return useContext(PlayerContext);
}
