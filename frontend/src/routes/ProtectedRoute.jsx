import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, requireArtist = false }) {
  const { user, loading, isArtist } = useAuth();

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        height: '100vh',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--primary-color)'
      }}>
        Loading Echofy...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/landing" replace />;
  }

  if (requireArtist && !isArtist) {
    return <Navigate to="/home" replace />;
  }

  return children;
}
