import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../services/api';
import PlaylistCard from '../../components/music/PlaylistCard';
import SongCard from '../../components/music/SongCard';
import { Plus, Trash2, Play, Search, X, Check } from 'lucide-react';
import { usePlayer } from '../../context/PlayerContext';

export default function PlaylistPage() {
  const { id: playlistIdFromUrl } = useParams();
  const [playlists, setPlaylists] = useState([]);
  const [activePlaylist, setActivePlaylist] = useState(null);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAddSongsModal, setShowAddSongsModal] = useState(false);
  const [availableSongs, setAvailableSongs] = useState([]);
  const [addSongSearch, setAddSongSearch] = useState('');
  const [selectedSongIds, setSelectedSongIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addLoading, setAddLoading] = useState(false);

  const { playTrack } = usePlayer();

  useEffect(() => {
    fetchPlaylists();
  }, []);

  // Auto-load playlist if accessed via /playlist/:id URL
  useEffect(() => {
    if (playlistIdFromUrl && playlists.length > 0) {
      loadPlaylistDetail(playlistIdFromUrl);
    }
  }, [playlistIdFromUrl, playlists]);

  const fetchPlaylists = async () => {
    try {
      const res = await api.get('/playlists/index.php');
      if (res.data.status) {
        setPlaylists(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePlaylist = async (e) => {
    e.preventDefault();
    if (!newPlaylistName.trim()) return;
    try {
      const res = await api.post('/playlists/create.php', { name: newPlaylistName });
      if (res.data.status) {
        setNewPlaylistName('');
        setShowCreateModal(false);
        fetchPlaylists();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const loadPlaylistDetail = async (playlistId) => {
    try {
      const res = await api.get(`/playlists/index.php?id=${playlistId}`);
      if (res.data.status) {
        setActivePlaylist(res.data.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeletePlaylist = async (playlistId) => {
    if (!window.confirm("Delete this playlist?")) return;
    try {
      const res = await api.post('/playlists/delete.php', { playlist_id: playlistId });
      if (res.data.status) {
        setActivePlaylist(null);
        fetchPlaylists();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Add Songs Modal
  const openAddSongsModal = async () => {
    setShowAddSongsModal(true);
    setSelectedSongIds([]);
    setAddSongSearch('');
    try {
      const res = await api.get('/songs/index.php?limit=50');
      if (res.data.status) {
        setAvailableSongs(res.data.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const toggleSelectSong = (songId) => {
    setSelectedSongIds(prev =>
      prev.includes(songId)
        ? prev.filter(id => id !== songId)
        : [...prev, songId]
    );
  };

  const handleAddSelectedSongs = async () => {
    if (!activePlaylist || selectedSongIds.length === 0) return;
    setAddLoading(true);
    try {
      for (const songId of selectedSongIds) {
        await api.post('/playlists/add_song.php', {
          playlist_id: activePlaylist.playlist_id,
          song_id: songId
        });
      }
      setSelectedSongIds([]);
      setShowAddSongsModal(false);
      loadPlaylistDetail(activePlaylist.playlist_id);
    } catch (err) {
      console.error(err);
    } finally {
      setAddLoading(false);
    }
  };

  const handleRemoveSong = async (songId) => {
    if (!activePlaylist) return;
    try {
      await api.post('/playlists/remove_song.php', {
        playlist_id: activePlaylist.playlist_id,
        song_id: songId
      });
      loadPlaylistDetail(activePlaylist.playlist_id);
    } catch (err) {
      console.error(err);
    }
  };

  const filteredSongs = availableSongs.filter(s =>
    s.title.toLowerCase().includes(addSongSearch.toLowerCase()) ||
    (s.artist_name && s.artist_name.toLowerCase().includes(addSongSearch.toLowerCase()))
  );

  // Songs already in the active playlist
  const activePlaylistSongIds = activePlaylist?.songs?.map(s => s.song_id) || [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem', animation: 'fadeIn 0.5s ease' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <span className="section-label">Your Music</span>
          <h1 style={{
            fontSize: '2.5rem',
            fontWeight: 500,
            fontFamily: 'Playfair Display, serif',
            letterSpacing: '-0.02em'
          }}>
            Playlists
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 400 }}>
            Create and manage your collections
          </p>
        </div>

        <button onClick={() => setShowCreateModal(true)} className="btn-primary">
          <Plus size={16} /> New Playlist
        </button>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
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
            maxWidth: '400px',
            background: 'var(--surface-color)',
            border: '1px solid var(--border-subtle)'
          }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 500, marginBottom: '1.25rem', letterSpacing: '0.01em' }}>New Playlist</h3>
            <form onSubmit={handleCreatePlaylist} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <input
                type="text"
                className="input-field"
                placeholder="My Playlist"
                value={newPlaylistName}
                onChange={(e) => setNewPlaylistName(e.target.value)}
                autoFocus
                required
              />
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setShowCreateModal(false)} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Songs Modal */}
      {showAddSongsModal && (
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
            maxWidth: '520px',
            maxHeight: '80vh',
            background: 'var(--surface-color)',
            border: '1px solid var(--border-subtle)',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 500, letterSpacing: '0.01em' }}>Add Songs</h3>
              <button onClick={() => setShowAddSongsModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={20} strokeWidth={1.5} />
              </button>
            </div>

            {/* Search */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              background: 'var(--surface-hover)',
              border: '1px solid var(--border-subtle)',
              padding: '0.6rem 1rem',
              borderRadius: '100px',
              marginBottom: '1rem'
            }}>
              <Search size={15} strokeWidth={1.5} color="var(--text-muted)" />
              <input
                type="text"
                placeholder="Search songs..."
                value={addSongSearch}
                onChange={(e) => setAddSongSearch(e.target.value)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-main)',
                  fontSize: '0.85rem',
                  outline: 'none',
                  width: '100%',
                  fontFamily: 'Inter, sans-serif'
                }}
              />
            </div>

            {/* Song List */}
            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.35rem', paddingRight: '0.25rem' }}>
              {filteredSongs.map(song => {
                const isSelected = selectedSongIds.includes(song.song_id);
                const alreadyInPlaylist = activePlaylistSongIds.includes(song.song_id);

                return (
                  <div
                    key={song.song_id}
                    onClick={() => !alreadyInPlaylist && toggleSelectSong(song.song_id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.65rem 0.85rem',
                      borderRadius: 'var(--radius-sm)',
                      cursor: alreadyInPlaylist ? 'default' : 'pointer',
                      background: isSelected ? 'rgba(var(--primary-rgb), 0.08)' : 'transparent',
                      border: `1px solid ${isSelected ? 'rgba(var(--primary-rgb), 0.2)' : 'transparent'}`,
                      opacity: alreadyInPlaylist ? 0.4 : 1,
                      transition: 'var(--transition)'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '6px',
                        overflow: 'hidden',
                        flexShrink: 0,
                        background: 'var(--surface-hover)'
                      }}>
                        {song.cover_image && (
                          <img
                            src={song.cover_image.startsWith('http') ? song.cover_image : `http://localhost/Echofy${song.cover_image}`}
                            alt={song.title}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                        )}
                      </div>
                      <div>
                        <div style={{ fontWeight: 500, fontSize: '0.85rem', color: 'var(--text-main)' }}>{song.title}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 400 }}>
                          {song.artist_name || 'Unknown'}
                          {alreadyInPlaylist && ' • Already added'}
                        </div>
                      </div>
                    </div>
                    {isSelected && !alreadyInPlaylist && (
                      <Check size={16} color="var(--primary-color)" strokeWidth={2} />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Footer */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid var(--border-subtle)' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                {selectedSongIds.length} selected
              </span>
              <div style={{ display: 'flex', gap: '0.6rem' }}>
                <button onClick={() => setShowAddSongsModal(false)} className="btn-secondary">Cancel</button>
                <button
                  onClick={handleAddSelectedSongs}
                  disabled={selectedSongIds.length === 0 || addLoading}
                  className="btn-primary"
                  style={{ opacity: selectedSongIds.length === 0 ? 0.5 : 1 }}
                >
                  {addLoading ? 'Adding...' : `Add ${selectedSongIds.length > 0 ? `(${selectedSongIds.length})` : ''}`}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Playlist Grid */}
      <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap' }}>
        {playlists.map((pl) => (
          <PlaylistCard key={pl.playlist_id} playlist={pl} />
        ))}
      </div>

      {/* Active Playlist Detail */}
      {activePlaylist && (
        <div style={{
          padding: '2.5rem',
          borderRadius: 'var(--radius-xl)',
          background: 'var(--card-bg)',
          border: '1px solid var(--border-subtle)',
          marginTop: '0.5rem'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <h2 style={{
                fontSize: '1.75rem',
                fontWeight: 500,
                fontFamily: 'Playfair Display, serif',
                letterSpacing: '-0.01em'
              }}>
                {activePlaylist.name}
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 400 }}>
                {activePlaylist.songs?.length || 0} tracks
              </p>
            </div>
            <div style={{ display: 'flex', gap: '0.6rem' }}>
              <button onClick={openAddSongsModal} className="btn-primary">
                <Plus size={15} /> Add Songs
              </button>
              {activePlaylist.songs?.length > 0 && (
                <button onClick={() => playTrack(activePlaylist.songs[0], activePlaylist.songs)} className="btn-secondary">
                  <Play size={15} /> Play
                </button>
              )}
              <button onClick={() => handleDeletePlaylist(activePlaylist.playlist_id)} className="btn-secondary" style={{ color: '#e57373' }}>
                <Trash2 size={15} /> Delete
              </button>
            </div>
          </div>

          {activePlaylist.songs?.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              {activePlaylist.songs.map((song, idx) => {
                const songCover = song.cover_image
                  ? (song.cover_image.startsWith('http') ? song.cover_image : `http://localhost/Echofy${song.cover_image}`)
                  : 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=150&q=80';

                return (
                  <div
                    key={song.song_id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.65rem 0.85rem',
                      borderRadius: 'var(--radius-sm)',
                      transition: 'var(--transition)'
                    }}
                  >
                    <div
                      style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', cursor: 'pointer', flex: 1 }}
                      onClick={() => playTrack(song, activePlaylist.songs)}
                    >
                      <span style={{
                        fontSize: '0.8rem',
                        color: 'var(--text-muted)',
                        fontWeight: 500,
                        width: '24px',
                        textAlign: 'center'
                      }}>
                        {idx + 1}
                      </span>

                      <img
                        src={songCover}
                        alt={song.title}
                        style={{ width: '42px', height: '42px', borderRadius: '6px', objectFit: 'cover' }}
                      />

                      <div>
                        <div style={{ fontWeight: 500, fontSize: '0.9rem', color: 'var(--text-main)', letterSpacing: '0.01em' }}>
                          {song.title}
                        </div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 400 }}>
                          {song.artist_name || 'Unknown'}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleRemoveSong(song.song_id)}
                      title="Remove from playlist"
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--text-muted)',
                        cursor: 'pointer',
                        padding: '0.4rem',
                        borderRadius: '50%',
                        transition: 'var(--transition)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                      onMouseEnter={e => { e.currentTarget.style.color = '#e57373'; e.currentTarget.style.background = 'rgba(229,115,115,0.1)'; }}
                      onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.background = 'none'; }}
                    >
                      <X size={16} strokeWidth={1.5} />
                    </button>
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-muted)' }}>
              <p style={{ fontSize: '0.9rem', marginBottom: '1rem' }}>No songs in this playlist yet</p>
              <button onClick={openAddSongsModal} className="btn-primary">
                <Plus size={15} /> Add Songs
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
