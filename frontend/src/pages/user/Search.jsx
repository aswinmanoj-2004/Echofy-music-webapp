import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import SongCard from '../../components/music/SongCard';
import ArtistCard from '../../components/music/ArtistCard';
import AlbumCard from '../../components/music/AlbumCard';
import { Search as SearchIcon } from 'lucide-react';

export default function Search() {
  const [query, setQuery] = useState('');
  const [genres, setGenres] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState(null);
  const [results, setResults] = useState({ songs: [], artists: [], albums: [] });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get('/genres/index.php').then((res) => {
      if (res.data.status) setGenres(res.data.data);
    }).catch(console.error);
  }, []);

  useEffect(() => {
    const handleSearch = async () => {
      if (!query.trim() && !selectedGenre) {
        const res = await api.get('/songs/index.php?limit=20');
        if (res.data.status) {
          setResults({ songs: res.data.data, artists: [], albums: [] });
        }
        return;
      }

      setLoading(true);
      try {
        if (selectedGenre) {
          const res = await api.get(`/songs/index.php?genre_id=${selectedGenre.genre_id}`);
          if (res.data.status) {
            setResults({ songs: res.data.data, artists: [], albums: [] });
          }
        } else {
          const res = await api.get(`/search/index.php?q=${encodeURIComponent(query)}`);
          if (res.data.status) {
            setResults(res.data.data);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    const timeout = setTimeout(handleSearch, 300);
    return () => clearTimeout(timeout);
  }, [query, selectedGenre]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem', animation: 'fadeIn 0.5s ease' }}>
      {/* Header */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <h1 style={{
          fontSize: '2.5rem',
          fontWeight: 500,
          fontFamily: 'Playfair Display, serif',
          letterSpacing: '-0.02em'
        }}>
          Search
        </h1>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.85rem',
          background: 'var(--surface-hover)',
          border: '1px solid var(--border-subtle)',
          padding: '0.85rem 1.5rem',
          borderRadius: '100px',
          maxWidth: '560px',
          transition: 'var(--transition)'
        }}>
          <SearchIcon size={18} strokeWidth={1.5} color="var(--text-muted)" />
          <input
            type="text"
            placeholder="Search by track, artist, or album..."
            value={query}
            onChange={(e) => {
              setSelectedGenre(null);
              setQuery(e.target.value);
            }}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-main)',
              fontSize: '0.95rem',
              outline: 'none',
              width: '100%',
              fontFamily: 'Inter, sans-serif',
              fontWeight: 400
            }}
          />
        </div>
      </div>

      {/* Genres */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div className="section-label">Genres</div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => setSelectedGenre(null)}
            style={{
              padding: '0.5rem 1.15rem',
              borderRadius: '100px',
              border: '1px solid var(--border-subtle)',
              background: selectedGenre === null ? 'var(--primary-color)' : 'var(--surface-hover)',
              color: selectedGenre === null ? '#0e0e0e' : 'var(--text-secondary)',
              fontWeight: 500,
              fontSize: '0.8rem',
              cursor: 'pointer',
              letterSpacing: '0.02em',
              transition: 'var(--transition)'
            }}
          >
            All
          </button>
          {genres.map((g) => (
            <button
              key={g.genre_id}
              onClick={() => {
                setQuery('');
                setSelectedGenre(g);
              }}
              style={{
                padding: '0.5rem 1.15rem',
                borderRadius: '100px',
                border: '1px solid var(--border-subtle)',
                background: selectedGenre?.genre_id === g.genre_id ? 'var(--primary-color)' : 'var(--surface-hover)',
                color: selectedGenre?.genre_id === g.genre_id ? '#0e0e0e' : 'var(--text-secondary)',
                fontWeight: 500,
                fontSize: '0.8rem',
                cursor: 'pointer',
                letterSpacing: '0.02em',
                transition: 'var(--transition)'
              }}
            >
              {g.name}
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      {results.songs.length > 0 && (
        <section style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <h2 className="section-title" style={{ fontSize: '1.5rem' }}>Songs</h2>
          <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap' }}>
            {results.songs.map((song) => (
              <SongCard key={song.song_id} song={song} queue={results.songs} />
            ))}
          </div>
        </section>
      )}

      {results.artists.length > 0 && (
        <section style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <h2 className="section-title" style={{ fontSize: '1.5rem' }}>Artists</h2>
          <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap' }}>
            {results.artists.map((artist) => (
              <ArtistCard key={artist.artist_id} artist={artist} />
            ))}
          </div>
        </section>
      )}

      {results.albums.length > 0 && (
        <section style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <h2 className="section-title" style={{ fontSize: '1.5rem' }}>Albums</h2>
          <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap' }}>
            {results.albums.map((album) => (
              <AlbumCard key={album.album_id} album={album} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
