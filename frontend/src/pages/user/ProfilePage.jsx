import React, { useState, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Mail, User, Lock, Camera, Save, Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react';
import api from '../../services/api';

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const fileInputRef = useRef(null);

  // Edit name state
  const [editName, setEditName] = useState(user?.name || '');
  const [nameSaving, setNameSaving] = useState(false);
  const [nameMsg, setNameMsg] = useState('');
  const [nameError, setNameError] = useState('');

  // Change password state
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [pwSaving, setPwSaving] = useState(false);
  const [pwMsg, setPwMsg] = useState('');
  const [pwError, setPwError] = useState('');

  // Avatar upload state
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarMsg, setAvatarMsg] = useState('');
  const [avatarError, setAvatarError] = useState('');

  if (!user) return <div style={{ color: 'var(--text-muted)', padding: '3rem' }}>Please log in to view your profile.</div>;

  const avatarSrc = user.profile_picture
    ? (user.profile_picture.startsWith('http') ? user.profile_picture : `http://localhost/Echofy${user.profile_picture}`)
    : null;

  // --- Handlers ---

  const handleSaveName = async (e) => {
    e.preventDefault();
    setNameSaving(true);
    setNameMsg('');
    setNameError('');
    try {
      const res = await api.post('/auth/update_profile.php', { name: editName, email: user.email });
      if (res.data.status) {
        updateUser(res.data.data.user);
        setNameMsg('Name updated successfully');
        setTimeout(() => setNameMsg(''), 3000);
      } else {
        setNameError(res.data.message || 'Update failed');
      }
    } catch (err) {
      setNameError(err.response?.data?.message || 'Failed to update name');
    } finally {
      setNameSaving(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPwSaving(true);
    setPwMsg('');
    setPwError('');
    try {
      const res = await api.post('/auth/change_password.php', {
        current_password: currentPassword,
        new_password: newPassword
      });
      if (res.data.status) {
        setPwMsg('Password changed successfully');
        setCurrentPassword('');
        setNewPassword('');
        setShowPasswordSection(false);
        setTimeout(() => setPwMsg(''), 3000);
      } else {
        setPwError(res.data.message || 'Failed to change password');
      }
    } catch (err) {
      setPwError(err.response?.data?.message || 'Failed to change password');
    } finally {
      setPwSaving(false);
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setAvatarUploading(true);
    setAvatarMsg('');
    setAvatarError('');
    const formData = new FormData();
    formData.append('profile_picture', file);
    try {
      const res = await api.post('/auth/upload_avatar.php', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.data.status) {
        updateUser({ profile_picture: res.data.data.profile_picture });
        setAvatarMsg('Profile picture updated');
        setTimeout(() => setAvatarMsg(''), 3000);
      } else {
        setAvatarError(res.data.message || 'Upload failed');
      }
    } catch (err) {
      setAvatarError(err.response?.data?.message || 'Failed to upload image');
    } finally {
      setAvatarUploading(false);
      e.target.value = '';
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '680px', animation: 'fadeIn 0.5s ease' }}>
      <span className="section-label">Account</span>
      <h1 style={{
        fontSize: '2.5rem',
        fontWeight: 500,
        fontFamily: 'Playfair Display, serif',
        letterSpacing: '-0.02em',
        marginTop: '-0.5rem'
      }}>
        Profile
      </h1>

      {/* Avatar Section */}
      <div style={{
        padding: '2rem',
        borderRadius: 'var(--radius-xl)',
        background: 'var(--card-bg)',
        border: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        gap: '2rem'
      }}>
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <div style={{
            width: '110px',
            height: '110px',
            borderRadius: '50%',
            overflow: 'hidden',
            background: avatarSrc ? 'var(--surface-hover)' : 'var(--primary-color)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {avatarSrc ? (
              <img src={avatarSrc} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <span style={{ fontSize: '2.5rem', fontWeight: 500, fontFamily: 'Playfair Display, serif', color: '#0e0e0e' }}>
                {user.name.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={avatarUploading}
            title="Change profile picture"
            style={{
              position: 'absolute',
              bottom: '2px',
              right: '2px',
              width: '34px',
              height: '34px',
              borderRadius: '50%',
              background: 'var(--primary-color)',
              border: '2px solid var(--bg-color)',
              color: '#0e0e0e',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'var(--transition)'
            }}
          >
            <Camera size={15} strokeWidth={2} />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleAvatarChange}
            style={{ display: 'none' }}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', flex: 1 }}>
          <h2 style={{
            fontSize: '1.5rem',
            fontWeight: 500,
            fontFamily: 'Playfair Display, serif',
            letterSpacing: '-0.01em'
          }}>
            {user.name}
          </h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            <Mail size={13} strokeWidth={1.5} /> {user.email}
          </div>
          <span className="badge badge-primary" style={{ alignSelf: 'flex-start', marginTop: '0.25rem' }}>
            {user.role === 'artist' ? 'Artist' : 'Listener'}
          </span>
        </div>
      </div>

      {/* Messages */}
      {avatarMsg && <StatusMessage type="success" text={avatarMsg} />}
      {avatarError && <StatusMessage type="error" text={avatarError} />}

      {/* Edit Name */}
      <div style={{
        padding: '2rem',
        borderRadius: 'var(--radius-xl)',
        background: 'var(--card-bg)',
        border: '1px solid var(--border-subtle)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem' }}>
          <User size={18} strokeWidth={1.5} color="var(--primary-color)" />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 500, letterSpacing: '0.01em' }}>Display Name</h3>
        </div>
        <form onSubmit={handleSaveName} style={{ display: 'flex', gap: '0.75rem' }}>
          <input
            type="text"
            className="input-field"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            placeholder="Your display name"
            required
            style={{ flex: 1 }}
          />
          <button type="submit" className="btn-primary" disabled={nameSaving} style={{ flexShrink: 0 }}>
            <Save size={15} /> {nameSaving ? 'Saving...' : 'Save'}
          </button>
        </form>
        {nameMsg && <StatusMessage type="success" text={nameMsg} />}
        {nameError && <StatusMessage type="error" text={nameError} />}
      </div>

      {/* Change Password */}
      <div style={{
        padding: '2rem',
        borderRadius: 'var(--radius-xl)',
        background: 'var(--card-bg)',
        border: '1px solid var(--border-subtle)'
      }}>
        <div
          onClick={() => setShowPasswordSection(!showPasswordSection)}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Lock size={18} strokeWidth={1.5} color="var(--primary-color)" />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 500, letterSpacing: '0.01em' }}>Change Password</h3>
          </div>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 400 }}>
            {showPasswordSection ? 'Hide' : 'Show'}
          </span>
        </div>

        {showPasswordSection && (
          <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1.25rem' }}>
            <div style={{ position: 'relative' }}>
              <input
                type={showCurrentPw ? 'text' : 'password'}
                className="input-field"
                placeholder="Current password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                style={{ paddingRight: '2.5rem' }}
              />
              <button
                type="button"
                onClick={() => setShowCurrentPw(!showCurrentPw)}
                style={{
                  position: 'absolute',
                  right: '0.75rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  padding: '0.25rem'
                }}
              >
                {showCurrentPw ? <EyeOff size={16} strokeWidth={1.5} /> : <Eye size={16} strokeWidth={1.5} />}
              </button>
            </div>

            <div style={{ position: 'relative' }}>
              <input
                type={showNewPw ? 'text' : 'password'}
                className="input-field"
                placeholder="New password (min 6 characters)"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={6}
                style={{ paddingRight: '2.5rem' }}
              />
              <button
                type="button"
                onClick={() => setShowNewPw(!showNewPw)}
                style={{
                  position: 'absolute',
                  right: '0.75rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  padding: '0.25rem'
                }}
              >
                {showNewPw ? <EyeOff size={16} strokeWidth={1.5} /> : <Eye size={16} strokeWidth={1.5} />}
              </button>
            </div>

            <button type="submit" className="btn-primary" disabled={pwSaving} style={{ alignSelf: 'flex-start' }}>
              <Lock size={15} /> {pwSaving ? 'Changing...' : 'Change Password'}
            </button>

            {pwMsg && <StatusMessage type="success" text={pwMsg} />}
            {pwError && <StatusMessage type="error" text={pwError} />}
          </form>
        )}
      </div>
    </div>
  );
}

function StatusMessage({ type, text }) {
  const color = type === 'success' ? 'var(--primary-color)' : '#e57373';
  const bg = type === 'success' ? 'rgba(var(--primary-rgb), 0.08)' : 'rgba(229, 115, 115, 0.08)';
  const border = type === 'success' ? 'rgba(var(--primary-rgb), 0.2)' : 'rgba(229, 115, 115, 0.2)';
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      padding: '0.7rem 1rem',
      borderRadius: 'var(--radius-sm)',
      background: bg,
      border: `1px solid ${border}`,
      color,
      fontSize: '0.85rem',
      fontWeight: 500,
      animation: 'fadeIn 0.3s ease'
    }}>
      {type === 'success' ? <CheckCircle size={16} strokeWidth={1.5} /> : <AlertCircle size={16} strokeWidth={1.5} />}
      {text}
    </div>
  );
}
