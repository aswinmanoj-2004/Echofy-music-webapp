import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { Upload, CheckCircle, Music2, Link2, Loader2, Play, Clock, User } from 'lucide-react';

export default function UploadSong() {
  const [activeTab, setActiveTab] = useState('file'); // 'file' or 'url'
  const [title, setTitle] = useState('');
  const [genreId, setGenreId] = useState('');
  const [albumId, setAlbumId] = useState('');
  const [songFile, setSongFile] = useState(null);
  const [coverImage, setCoverImage] = useState(null);
  const [genres, setGenres] = useState([]);
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // URL import state
  const [videoUrl, setVideoUrl] = useState('');
  const [fetchingMeta, setFetchingMeta] = useState(false);
  const [videoMeta, setVideoMeta] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    api.get('/genres/index.php').then((res) => {
      if (res.data.status) setGenres(res.data.data);
    });

    api.get('/auth/me.php').then((res) => {
      if (res.data.status && res.data.data.user.artist_id) {
        const artId = res.data.data.user.artist_id;
        api.get(`/albums/index.php?artist_id=${artId}`).then((resAlb) => {
          if (resAlb.data.status) setAlbums(resAlb.data.data);
        });
      }
    });
  }, []);

  // Format seconds to mm:ss
  const formatDuration = (seconds) => {
    if (!seconds) return '0:00';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  // Fetch YouTube metadata
  const handleFetchMeta = async () => {
    if (!videoUrl.trim()) {
      setError('Please enter a YouTube URL');
      return;
    }

    setError('');
    setVideoMeta(null);
    setFetchingMeta(true);

    try {
      const res = await api.post('/songs/upload_url.php', {
        action: 'fetch_metadata',
        url: videoUrl,
      });

      if (res.data.status) {
        setVideoMeta(res.data.data);
        if (!title.trim()) {
          setTitle(res.data.data.title);
        }
      } else {
        setError(res.data.message || 'Failed to fetch video info');
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Error fetching video info';
      setError(msg);
    } finally {
      setFetchingMeta(false);
    }
  };

  // Handle file upload submit
  const handleFileSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!songFile) {
      setError('Please select an audio file to upload');
      return;
    }

    if (!title.trim()) {
      setError('Please enter a song title');
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append('title', title);
    formData.append('song_file', songFile);
    if (genreId) formData.append('genre_id', genreId);
    if (albumId) formData.append('album_id', albumId);
    if (coverImage) formData.append('cover_image', coverImage);

    try {
      const res = await api.post('/songs/upload.php', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.data.status) {
        setMessage('Track published successfully!');
        setTimeout(() => navigate('/artist/dashboard'), 1500);
      } else {
        setError(res.data.message || 'Upload failed');
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Error uploading track';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  // Handle URL import submit
  const handleUrlSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!videoMeta) {
      setError('Please fetch the video info first');
      return;
    }

    if (!title.trim()) {
      setError('Please enter a song title');
      return;
    }

    setLoading(true);

    try {
      const res = await api.post('/songs/upload_url.php', {
        action: 'upload',
        url: videoUrl,
        title: title,
        genre_id: genreId || null,
        album_id: albumId || null,
        duration: videoMeta.duration || 0,
      });

      if (res.data.status) {
        setMessage('Track imported from YouTube successfully!');
        setTimeout(() => navigate('/artist/dashboard'), 1500);
      } else {
        setError(res.data.message || 'Import failed');
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Error importing track';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const tabStyle = (tab) => ({
    flex: 1,
    padding: '0.75rem 1rem',
    fontSize: '0.85rem',
    fontWeight: activeTab === tab ? 500 : 400,
    color: activeTab === tab ? 'var(--primary-color)' : 'var(--text-muted)',
    background: activeTab === tab ? 'rgba(var(--primary-rgb), 0.06)' : 'transparent',
    border: 'none',
    borderBottom: activeTab === tab ? '2px solid var(--primary-color)' : '2px solid transparent',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    letterSpacing: '0.01em',
  });

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', animation: 'fadeIn 0.5s ease' }}>
      {/* Header */}
      <span className="section-label">Artist</span>
      <h1 style={{
        fontSize: '2.25rem',
        fontWeight: 500,
        fontFamily: 'Playfair Display, serif',
        letterSpacing: '-0.02em',
        marginTop: '0.5rem',
        marginBottom: '0.5rem'
      }}>
        Upload Track
      </h1>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 400, marginBottom: '2.5rem' }}>
        Upload a file or import from YouTube
      </p>

      <div style={{
        padding: '2.5rem',
        borderRadius: 'var(--radius-xl)',
        background: 'var(--card-bg)',
        border: '1px solid var(--border-subtle)'
      }}>
        {/* Tab Toggle */}
        <div style={{
          display: 'flex',
          borderBottom: '1px solid var(--border-subtle)',
          marginBottom: '2rem',
          margin: '-0.5rem -0.5rem 2rem -0.5rem',
        }}>
          <button type="button" style={tabStyle('file')} onClick={() => { setActiveTab('file'); setError(''); setMessage(''); }}>
            <Upload size={16} strokeWidth={1.5} /> File Upload
          </button>
          <button type="button" style={tabStyle('url')} onClick={() => { setActiveTab('url'); setError(''); setMessage(''); }}>
            <Link2 size={16} strokeWidth={1.5} /> URL Import
          </button>
        </div>

        {/* Messages */}
        {message && (
          <div style={{
            background: 'rgba(var(--primary-rgb), 0.08)',
            border: '1px solid rgba(var(--primary-rgb), 0.2)',
            color: 'var(--primary-color)',
            padding: '0.85rem 1rem',
            borderRadius: 'var(--radius-sm)',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.875rem',
            fontWeight: 500
          }}>
            <CheckCircle size={18} strokeWidth={1.5} /> {message}
          </div>
        )}

        {error && (
          <div style={{
            background: 'rgba(229, 115, 115, 0.08)',
            border: '1px solid rgba(229, 115, 115, 0.2)',
            color: '#e57373',
            padding: '0.85rem 1rem',
            borderRadius: 'var(--radius-sm)',
            marginBottom: '1.5rem',
            fontSize: '0.875rem',
            fontWeight: 500
          }}>
            {error}
          </div>
        )}

        {/* ═══ FILE UPLOAD TAB ═══ */}
        {activeTab === 'file' && (
          <form onSubmit={handleFileSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
            {/* File Upload Area */}
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, marginBottom: '0.5rem', color: 'var(--text-secondary)', letterSpacing: '0.02em' }}>
                Audio File *
              </label>
              <div style={{
                border: '1px dashed var(--border-color)',
                borderRadius: 'var(--radius-md)',
                padding: '2rem',
                textAlign: 'center',
                background: 'var(--surface-hover)',
                transition: 'var(--transition)',
                cursor: 'pointer',
                position: 'relative'
              }}>
                <input
                  type="file"
                  accept="audio/*"
                  onChange={(e) => setSongFile(e.target.files[0])}
                  required
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    opacity: 0,
                    cursor: 'pointer'
                  }}
                />
                {songFile ? (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '50%',
                      background: 'rgba(var(--primary-rgb), 0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Music2 size={22} strokeWidth={1.5} color="var(--primary-color)" />
                    </div>
                    <div>
                      <div style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-main)' }}>{songFile.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                        {(songFile.size / (1024 * 1024)).toFixed(2)} MB
                      </div>
                    </div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '50%',
                      background: 'var(--surface-elevated)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Upload size={20} strokeWidth={1.5} color="var(--text-muted)" />
                    </div>
                    <div>
                      <div style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-secondary)' }}>
                        Click to select audio file
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                        MP3, WAV, OGG, M4A, FLAC — Max 100MB
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Title */}
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, marginBottom: '0.5rem', color: 'var(--text-secondary)', letterSpacing: '0.02em' }}>
                Track Title *
              </label>
              <input
                type="text"
                className="input-field"
                placeholder="e.g. Synthwave Dreams"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            {/* Genre & Album */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, marginBottom: '0.5rem', color: 'var(--text-secondary)', letterSpacing: '0.02em' }}>
                  Genre
                </label>
                <select
                  className="input-field"
                  value={genreId}
                  onChange={(e) => setGenreId(e.target.value)}
                >
                  <option value="">Select Genre</option>
                  {genres.map((g) => (
                    <option key={g.genre_id} value={g.genre_id}>{g.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, marginBottom: '0.5rem', color: 'var(--text-secondary)', letterSpacing: '0.02em' }}>
                  Album <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(Optional)</span>
                </label>
                <select
                  className="input-field"
                  value={albumId}
                  onChange={(e) => setAlbumId(e.target.value)}
                >
                  <option value="">Single Track (No Album)</option>
                  {albums.map((al) => (
                    <option key={al.album_id} value={al.album_id}>{al.title}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Cover Art */}
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, marginBottom: '0.5rem', color: 'var(--text-secondary)', letterSpacing: '0.02em' }}>
                Cover Art <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(Optional)</span>
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setCoverImage(e.target.files[0])}
                className="input-field"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
              style={{ width: '100%', justifyContent: 'center', padding: '0.85rem', marginTop: '0.5rem' }}
            >
              {loading ? 'Uploading...' : 'Publish Track'}
            </button>
          </form>
        )}

        {/* ═══ URL IMPORT TAB ═══ */}
        {activeTab === 'url' && (
          <form onSubmit={handleUrlSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
            {/* URL Input */}
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, marginBottom: '0.5rem', color: 'var(--text-secondary)', letterSpacing: '0.02em' }}>
                YouTube URL *
              </label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  type="url"
                  className="input-field"
                  placeholder="https://www.youtube.com/watch?v=..."
                  value={videoUrl}
                  onChange={(e) => { setVideoUrl(e.target.value); setVideoMeta(null); }}
                  style={{ flex: 1 }}
                  required
                />
                <button
                  type="button"
                  onClick={handleFetchMeta}
                  disabled={fetchingMeta || !videoUrl.trim()}
                  style={{
                    padding: '0 1.25rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-color)',
                    background: 'var(--surface-hover)',
                    color: 'var(--text-secondary)',
                    fontSize: '0.8rem',
                    fontWeight: 500,
                    cursor: fetchingMeta || !videoUrl.trim() ? 'not-allowed' : 'pointer',
                    opacity: fetchingMeta || !videoUrl.trim() ? 0.5 : 1,
                    transition: 'var(--transition)',
                    whiteSpace: 'nowrap',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                  }}
                >
                  {fetchingMeta ? <Loader2 size={15} className="animate-spin" /> : <Link2 size={15} />}
                  {fetchingMeta ? 'Fetching...' : 'Fetch'}
                </button>
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>
                Paste a YouTube video URL — audio will be extracted automatically
              </p>
            </div>

            {/* Video Preview Card */}
            {videoMeta && (
              <div style={{
                display: 'flex',
                gap: '1rem',
                padding: '1rem',
                borderRadius: 'var(--radius-md)',
                background: 'var(--surface-hover)',
                border: '1px solid var(--border-subtle)',
                animation: 'fadeIn 0.3s ease',
              }}>
                {/* Thumbnail */}
                {videoMeta.thumbnail && (
                  <div style={{
                    width: '140px',
                    minWidth: '140px',
                    height: '80px',
                    borderRadius: 'var(--radius-sm)',
                    overflow: 'hidden',
                    background: 'var(--surface-elevated)',
                    position: 'relative',
                  }}>
                    <img
                      src={videoMeta.thumbnail}
                      alt={videoMeta.title}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    <div style={{
                      position: 'absolute',
                      inset: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: 'rgba(0,0,0,0.2)',
                    }}>
                      <Play size={20} color="#fff" fill="#fff" />
                    </div>
                  </div>
                )}

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    color: 'var(--text-main)',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    lineHeight: '1.4',
                  }}>
                    {videoMeta.title}
                  </div>
                  <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      <Clock size={13} /> {formatDuration(videoMeta.duration)}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      <User size={13} /> {videoMeta.uploader}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Title */}
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, marginBottom: '0.5rem', color: 'var(--text-secondary)', letterSpacing: '0.02em' }}>
                Track Title *
              </label>
              <input
                type="text"
                className="input-field"
                placeholder="e.g. Synthwave Dreams"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            {/* Genre & Album */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, marginBottom: '0.5rem', color: 'var(--text-secondary)', letterSpacing: '0.02em' }}>
                  Genre
                </label>
                <select
                  className="input-field"
                  value={genreId}
                  onChange={(e) => setGenreId(e.target.value)}
                >
                  <option value="">Select Genre</option>
                  {genres.map((g) => (
                    <option key={g.genre_id} value={g.genre_id}>{g.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, marginBottom: '0.5rem', color: 'var(--text-secondary)', letterSpacing: '0.02em' }}>
                  Album <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(Optional)</span>
                </label>
                <select
                  className="input-field"
                  value={albumId}
                  onChange={(e) => setAlbumId(e.target.value)}
                >
                  <option value="">Single Track (No Album)</option>
                  {albums.map((al) => (
                    <option key={al.album_id} value={al.album_id}>{al.title}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="btn-primary"
              disabled={loading || !videoMeta}
              style={{
                width: '100%',
                justifyContent: 'center',
                padding: '0.85rem',
                marginTop: '0.5rem',
                opacity: !videoMeta ? 0.5 : 1,
              }}
            >
              {loading ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Loader2 size={16} className="animate-spin" /> Importing audio...
                </span>
              ) : 'Import Track'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
