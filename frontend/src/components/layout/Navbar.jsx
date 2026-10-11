import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Sun, Moon, Search, Upload } from 'lucide-react';

export default function Navbar() {
  const { user, isArtist } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  return (
    <header style={{
      height: '72px',
      padding: '0 3rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      background: 'var(--bg-color)',
      borderBottom: '1px solid var(--border-subtle)',
      position: 'sticky',
      top: 0,
      zIndex: 10
    }}>
      {/* Search */}
      <div
        onClick={() => navigate('/search')}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          background: 'var(--surface-hover)',
          border: '1px solid var(--border-subtle)',
          padding: '0.6rem 1.25rem',
          borderRadius: '100px',
          cursor: 'pointer',
          width: '340px',
          color: 'var(--text-muted)',
          transition: 'var(--transition)'
        }}
      >
        <Search size={16} strokeWidth={1.5} />
        <span style={{ fontSize: '0.875rem', fontWeight: 400 }}>Search music...</span>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          style={{
            background: 'var(--surface-hover)',
            border: '1px solid var(--border-subtle)',
            color: 'var(--text-secondary)',
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'var(--transition)'
          }}
        >
          {theme === 'dark' ? <Sun size={16} strokeWidth={1.5} /> : <Moon size={16} strokeWidth={1.5} />}
        </button>

        {isArtist && (
          <Link to="/artist/upload" className="btn-primary" style={{ padding: '0.55rem 1.25rem', fontSize: '0.8rem' }}>
            <Upload size={14} />
            <span>Upload</span>
          </Link>
        )}

        {/* User */}
        {user ? (
          <Link
            to="/profile"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              textDecoration: 'none',
              color: 'var(--text-main)',
              background: 'var(--surface-hover)',
              padding: '0.4rem 1rem 0.4rem 0.4rem',
              borderRadius: '100px',
              border: '1px solid var(--border-subtle)',
              transition: 'var(--transition)'
            }}
          >
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: 'var(--primary-color)',
              color: '#0e0e0e',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 600,
              fontSize: '0.85rem',
              overflow: 'hidden'
            }}>
              {user.profile_picture ? (
                <img
                  src={user.profile_picture.startsWith('http') ? user.profile_picture : `http://localhost/Echofy${user.profile_picture}`}
                  alt={user.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                user.name.charAt(0).toUpperCase()
              )}
            </div>
            <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>{user.name}</span>
          </Link>
        ) : (
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <Link to="/login" className="btn-secondary" style={{ padding: '0.55rem 1.25rem', fontSize: '0.8rem' }}>
              Log In
            </Link>
            <Link to="/register" className="btn-primary" style={{ padding: '0.55rem 1.25rem', fontSize: '0.8rem' }}>
              Sign Up
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
