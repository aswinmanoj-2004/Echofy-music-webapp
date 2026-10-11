import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import AlbumCard from '../../components/music/AlbumCard';
import { Plus, Disc, CheckCircle } from 'lucide-react';

export default function ManageAlbums() {
  const [albums, setAlbums] = useState([]);
  const [title, setTitle] = useState('');
  const [coverImage, setCoverImage] = useState(null);
  const [releaseDate, setReleaseDate] = useState(new Date().toISOString().split('T')[0]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchAlbums();
  }, []);

  const fetchAlbums = async () => {
    try {
      const resUser = await api.get('/auth/me.php');
      if (resUser.data.status && resUser.data.data.user.artist_id) {
        const artId = resUser.data.data.user.artist_id;
        const res = await api.get(`/albums/index.php?artist_id=${artId}`);
        if (res.data.status) {
          setAlbums(res.data.data);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateAlbum = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    setLoading(true);
    const formData = new FormData();
    formData.append('title', title);
    formData.append('release_date', releaseDate);
    if (coverImage) formData.append('cover_image', coverImage);

    try {
      const res = await api.post('/albums/create.php', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.data.status) {
        setTitle('');
        setCoverImage(null);
        setShowModal(false);
        fetchAlbums();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '2.25rem', fontWeight: 500, fontFamily: 'Playfair Display, serif' }}>Manage Albums</h1>
          <p style={{ color: 'var(--text-muted)' }}>Create and organize your music discography</p>
        </div>

        <button onClick={() => setShowModal(true)} className="btn-primary">
          <Plus size={18} /> Create Album
        </button>
      </div>

      {showModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 200
        }}>
          <div className="glass-card" style={{ padding: '2rem', borderRadius: 'var(--radius-lg)', width: '100%', maxWidth: '420px' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 500, fontFamily: 'Playfair Display, serif', marginBottom: '1rem' }}>Create New Album</h3>
            <form onSubmit={handleCreateAlbum} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>
                  Album Title
                </label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="e.g. Neon Horizons"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>
                  Release Date
                </label>
                <input
                  type="date"
                  className="input-field"
                  value={releaseDate}
                  onChange={(e) => setReleaseDate(e.target.value)}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>
                  Album Cover Art
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setCoverImage(e.target.files[0])}
                  className="input-field"
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={loading}>
                  {loading ? 'Creating...' : 'Create Album'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap' }}>
        {albums.map((album) => (
          <AlbumCard key={album.album_id} album={album} />
        ))}
      </div>
    </div>
  );
}
