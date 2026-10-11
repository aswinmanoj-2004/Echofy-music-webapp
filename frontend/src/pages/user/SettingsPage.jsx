import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { Sun, Moon } from 'lucide-react';

export default function SettingsPage() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem', maxWidth: '680px', animation: 'fadeIn 0.5s ease' }}>
      <h1 style={{
        fontSize: '2.5rem',
        fontWeight: 500,
        fontFamily: 'Playfair Display, serif',
        letterSpacing: '-0.02em'
      }}>
        Settings
      </h1>

      <div style={{
        padding: '2rem',
        borderRadius: 'var(--radius-xl)',
        background: 'var(--card-bg)',
        border: '1px solid var(--border-subtle)',
        display: 'flex',
        flexDirection: 'column',
        gap: '2rem'
      }}>
        {/* Theme */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 500, letterSpacing: '0.01em' }}>Theme</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 400 }}>
              Switch between dark and light mode
            </p>
          </div>
          <button onClick={toggleTheme} className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {theme === 'dark' ? <Sun size={15} strokeWidth={1.5} /> : <Moon size={15} strokeWidth={1.5} />}
            <span>{theme === 'dark' ? 'Light' : 'Dark'}</span>
          </button>
        </div>

        <div style={{ height: '1px', background: 'var(--border-subtle)' }} />

        {/* Audio Quality */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 500, letterSpacing: '0.01em' }}>Audio Quality</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 400 }}>
              High fidelity 320kbps streaming
            </p>
          </div>
          <span className="badge badge-primary">Active</span>
        </div>
      </div>
    </div>
  );
}
