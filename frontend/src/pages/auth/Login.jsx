import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Music2, Lock, Mail, ArrowRight } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await login(email, password, 'listener');
      if (res.success && res.user) {
        navigate('/home');
      } else {
        setError(res.message || 'Invalid email or password');
      }
    } catch (err) {
      setError('An unexpected error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg-color)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      color: 'var(--text-main)'
    }}>
      <div className="glass-card" style={{ width: '100%', maxWidth: '440px', padding: '2.5rem', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border-subtle)' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: '54px',
            height: '54px',
            borderRadius: '50%',
            background: 'var(--primary-color)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#0e0e0e',
            margin: '0 auto 1.25rem auto',
            boxShadow: '0 0 25px rgba(var(--primary-rgb), 0.3)'
          }}>
            <Music2 size={30} strokeWidth={2.5} />
          </div>
          <h2 style={{ fontSize: '1.85rem', fontWeight: 500, fontFamily: 'Playfair Display, serif', letterSpacing: '-0.02em' }}>Listener Sign In</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.3rem' }}>
            Log in to listen to your favorite tracks
          </p>
        </div>

        {error && (
          <div style={{
            background: 'rgba(var(--color-error-rgb), 0.12)',
            border: '1px solid var(--color-error)',
            color: 'var(--color-error)',
            padding: '0.85rem',
            borderRadius: 'var(--radius-sm)',
            marginBottom: '1.25rem',
            fontSize: '0.85rem',
            textAlign: 'center'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '0.5rem', color: 'var(--text-muted)' }}>
              Email Address
            </label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="email"
                className="input-field"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ paddingLeft: '2.6rem' }}
                required
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '0.5rem', color: 'var(--text-muted)' }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="password"
                className="input-field"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ paddingLeft: '2.6rem' }}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn-primary"
            disabled={loading}
            style={{ width: '100%', justifyContent: 'center', marginTop: '0.5rem', padding: '0.9rem', fontSize: '1rem' }}
          >
            {loading ? 'Signing in...' : (
              <>
                <span>Sign In</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '2rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border-subtle)', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          Don't have a Listener account?{' '}
          <Link to="/register" style={{ color: 'var(--primary-color)', fontWeight: 600, textDecoration: 'none' }}>
            Create Account
          </Link>
        </div>

        <div style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.85rem' }}>
          <span style={{ color: 'var(--text-muted)' }}>Are you an Artist? </span>
          <Link to="/artist/login" style={{ color: 'var(--primary-color)', fontWeight: 600, textDecoration: 'none' }}>
            Artist Studio Login →
          </Link>
        </div>
      </div>
    </div>
  );
}
