import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Home,
  Search,
  Heart,
  Clock,
  ListMusic,
  Disc,
  Upload,
  LayoutDashboard,
  Music2,
  LogOut,
  User,
  Settings
} from 'lucide-react';

export default function Sidebar() {
  const { user, isArtist, logout } = useAuth();

  return (
    <aside style={{
      width: 'var(--sidebar-width)',
      height: '100vh',
      background: 'var(--surface-color)',
      borderRight: '1px solid var(--border-subtle)',
      display: 'flex',
      flexDirection: 'column',
      padding: '2rem 1.25rem',
      flexShrink: 0
    }}>
      {/* Brand */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.85rem',
        padding: '0 0.75rem 2rem 0.75rem',
        borderBottom: '1px solid var(--border-subtle)'
      }}>
        <div style={{
          width: '36px',
          height: '36px',
          borderRadius: '10px',
          background: 'linear-gradient(135deg, var(--primary-color) 0%, var(--primary-hover) 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#0e0e0e'
        }}>
          <Music2 size={20} strokeWidth={2} />
        </div>
        <span style={{
          fontSize: '1.25rem',
          fontWeight: 600,
          letterSpacing: '-0.02em',
          color: 'var(--text-main)'
        }}>
          Echofy
        </span>
      </div>

      {/* Main Navigation */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', marginTop: '1.5rem' }}>
        <div style={{
          fontSize: '0.65rem',
          fontWeight: 600,
          color: 'var(--text-muted)',
          padding: '0 0.75rem 0.75rem',
          letterSpacing: '0.1em',
          textTransform: 'uppercase'
        }}>
          Browse
        </div>

        <NavLink to="/home" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <Home size={18} strokeWidth={1.5} />
          <span>Home</span>
        </NavLink>

        <NavLink to="/search" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <Search size={18} strokeWidth={1.5} />
          <span>Search</span>
        </NavLink>

        <NavLink to="/favorites" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <Heart size={18} strokeWidth={1.5} />
          <span>Liked Songs</span>
        </NavLink>

        <NavLink to="/playlists" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <ListMusic size={18} strokeWidth={1.5} />
          <span>Playlists</span>
        </NavLink>

        <NavLink to="/recent" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <Clock size={18} strokeWidth={1.5} />
          <span>Recently Played</span>
        </NavLink>
      </div>

      {/* Artist Section */}
      {isArtist && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', marginTop: '2rem' }}>
          <div style={{
            fontSize: '0.65rem',
            fontWeight: 600,
            color: 'var(--text-muted)',
            padding: '0 0.75rem 0.75rem',
            letterSpacing: '0.1em',
            textTransform: 'uppercase'
          }}>
            Artist
          </div>

          <NavLink to="/artist/dashboard" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <LayoutDashboard size={18} strokeWidth={1.5} />
            <span>Dashboard</span>
          </NavLink>

          <NavLink to="/artist/upload" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <Upload size={18} strokeWidth={1.5} />
            <span>Upload</span>
          </NavLink>

          <NavLink to="/artist/albums" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <Disc size={18} strokeWidth={1.5} />
            <span>Albums</span>
          </NavLink>
        </div>
      )}

      {/* Footer */}
      <div style={{
        marginTop: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.25rem',
        paddingTop: '1.5rem',
        borderTop: '1px solid var(--border-subtle)'
      }}>
        <NavLink to="/profile" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <User size={18} strokeWidth={1.5} />
          <span>Profile</span>
        </NavLink>

        <NavLink to="/settings" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <Settings size={18} strokeWidth={1.5} />
          <span>Settings</span>
        </NavLink>

        {user && (
          <button
            onClick={logout}
            className="nav-item"
            style={{
              border: 'none',
              width: '100%',
              textAlign: 'left',
              color: 'var(--color-error)',
              cursor: 'pointer',
              marginTop: '0.5rem'
            }}
          >
            <LogOut size={18} strokeWidth={1.5} />
            <span>Log Out</span>
          </button>
        )}
      </div>
    </aside>
  );
}
