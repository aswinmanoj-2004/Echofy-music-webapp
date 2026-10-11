import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Play, Music, Flame, Upload, Disc, Trash2, Edit3 } from 'lucide-react';

export default function ArtistDashboard() {
  const { user } = useAuth();
  const [artistData, setArtistData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const resUser = await api.get('/auth/me.php');
      if (resUser.data.status && resUser.data.data.user.artist_id) {
        const artistId = resUser.data.data.user.artist_id;
        const resArtist = await api.get(`/artists/detail.php?id=${artistId}`);
        if (resArtist.data.status) {
          setArtistData(resArtist.data.data);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSong = async (songId) => {
    if (!window.confirm("Are you sure you want to delete this track?")) return;
    try {
      const res = await api.post(`/songs/delete.php?id=${songId}`);
      if (res.data.status) {
        fetchDashboard();
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div>Loading Artist Dashboard...</div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '2.25rem', fontWeight: 500, fontFamily: 'Playfair Display, serif' }}>Artist Studio</h1>
          <p style={{ color: 'var(--text-muted)' }}>Manage your tracks, albums, and streaming analytics</p>
        </div>

        <Link to="/artist/upload" className="btn-primary">
          <Upload size={18} /> Upload New Track
        </Link>
      </div>

      {/* Metrics Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem' }}>
        <div className="glass-card" style={{ padding: '1.5rem', borderRadius: 'var(--radius-md)' }}>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600 }}>Total Streams</div>
          <div style={{ fontSize: '2.2rem', fontWeight: 500, fontFamily: 'Playfair Display, serif', color: 'var(--primary-color)', marginTop: '0.25rem' }}>
            {artistData?.total_plays?.toLocaleString() || 0}
          </div>
        </div>

        <div className="glass-card" style={{ padding: '1.5rem', borderRadius: 'var(--radius-md)' }}>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600 }}>Published Tracks</div>
          <div style={{ fontSize: '2.2rem', fontWeight: 500, fontFamily: 'Playfair Display, serif', marginTop: '0.25rem' }}>
            {artistData?.songs?.length || 0}
          </div>
        </div>

        <div className="glass-card" style={{ padding: '1.5rem', borderRadius: 'var(--radius-md)' }}>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600 }}>Albums</div>
          <div style={{ fontSize: '2.2rem', fontWeight: 500, fontFamily: 'Playfair Display, serif', marginTop: '0.25rem' }}>
            {artistData?.albums?.length || 0}
          </div>
        </div>
      </div>

      {/* Manage Tracks Table */}
      <div className="glass-card" style={{ padding: '2rem', borderRadius: 'var(--radius-lg)' }}>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 500, fontFamily: 'Playfair Display, serif', marginBottom: '1.25rem' }}>Your Published Songs</h2>

        {artistData?.songs?.length === 0 ? (
          <p style={{ color: 'var(--text-muted)' }}>No tracks uploaded yet. Click Upload New Track to publish your music!</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                <th style={{ padding: '0.75rem 0' }}>TITLE</th>
                <th style={{ padding: '0.75rem 0' }}>GENRE</th>
                <th style={{ padding: '0.75rem 0' }}>STREAMS</th>
                <th style={{ padding: '0.75rem 0' }}>LIKES</th>
                <th style={{ padding: '0.75rem 0', textAlign: 'right' }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {artistData?.songs?.map((song) => (
                <tr key={song.song_id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '1rem 0', fontWeight: 600 }}>{song.title}</td>
                  <td style={{ padding: '1rem 0', color: 'var(--text-muted)' }}>{song.genre_name || 'Single'}</td>
                  <td style={{ padding: '1rem 0' }}>{song.play_count}</td>
                  <td style={{ padding: '1rem 0' }}>{song.like_count}</td>
                  <td style={{ padding: '1rem 0', textAlign: 'right' }}>
                    <button
                      onClick={() => handleDeleteSong(song.song_id)}
                      style={{ background: 'none', border: 'none', color: 'var(--color-error)', cursor: 'pointer' }}
                      title="Delete Track"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
