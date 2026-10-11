import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Music2, User, Mail, Lock, KeyRound, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otpCode, setOtpCode] = useState('');
  
  // Real-time verification state
  const [codeSent, setCodeSent] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [sendingCode, setSendingCode] = useState(false);
  
  const [error, setError] = useState('');
  const [infoMsg, setInfoMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [debugOtp, setDebugOtp] = useState('');

  const { register, sendVerificationCode, verifyCode } = useAuth();
  const navigate = useNavigate();

  // Send real-time OTP code
  const handleSendCode = async () => {
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address first');
      return;
    }

    setError('');
    setInfoMsg('');
    setSendingCode(true);

    try {
      const res = await sendVerificationCode(email, 'register', 'listener');
      if (res.success) {
        setCodeSent(true);
        setInfoMsg(`A 6-digit verification code has been sent to ${email}`);
        if (res.debugCode) {
          setDebugOtp(res.debugCode);
        }
      } else {
        setError(res.message || 'Failed to send verification code');
      }
    } catch (err) {
      setError('An error occurred while sending verification code');
    } finally {
      setSendingCode(false);
    }
  };

  // Real-time code verification
  const handleVerifyOtp = async (codeToVerify) => {
    const code = codeToVerify || otpCode;
    if (code.length !== 6) {
      setError('Please enter the complete 6-digit verification code');
      return;
    }

    setError('');
    setVerifying(true);

    try {
      const res = await verifyCode(email, code, 'register');
      if (res.success) {
        setIsVerified(true);
        setInfoMsg('✓ Email address verified successfully!');
      } else {
        setError(res.message || 'Invalid verification code');
      }
    } catch (err) {
      setError('Failed to verify code');
    } finally {
      setVerifying(false);
    }
  };

  const handleOtpChange = (e) => {
    const val = e.target.value.replace(/\D/g, '');
    setOtpCode(val);
    if (val.length === 6) {
      handleVerifyOtp(val);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (!isVerified) {
      setError('Please verify your email address before creating an account');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const res = await register(name, email, password, 'listener', otpCode);
      if (res.success) {
        navigate('/home');
      } else {
        setError(res.message || 'Registration failed');
      }
    } catch (err) {
      setError('Failed to complete registration');
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
      <div className="glass-card" style={{ width: '100%', maxWidth: '480px', padding: '2.5rem', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border-subtle)' }}>
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
          <h2 style={{ fontSize: '1.85rem', fontWeight: 500, fontFamily: 'Playfair Display, serif', letterSpacing: '-0.02em' }}>Create Listener Account</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.3rem' }}>
            Verify your email in real-time to start streaming
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

        {infoMsg && (
          <div style={{
            background: `rgba(var(--color-success-rgb), ${isVerified ? 0.15 : 0.1})`,
            border: '1px solid var(--color-success)',
            color: 'var(--color-success)',
            padding: '0.85rem',
            borderRadius: 'var(--radius-sm)',
            marginBottom: '1.25rem',
            fontSize: '0.85rem',
            textAlign: 'center',
            fontWeight: 500,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem'
          }}>
            {isVerified && <CheckCircle2 size={18} />}
            <span>{infoMsg}</span>
          </div>
        )}

        {/* Debug code helper for local dev testing */}
        {debugOtp && !isVerified && (
          <div style={{
            background: 'rgba(var(--primary-rgb), 0.08)',
            border: '1px dashed var(--primary-color)',
            color: 'var(--primary-color)',
            padding: '0.6rem 0.8rem',
            borderRadius: 'var(--radius-sm)',
            marginBottom: '1.25rem',
            fontSize: '0.8rem',
            textAlign: 'center',
            fontWeight: 600
          }}>
            Dev Verification Code: <span style={{ fontSize: '1.1rem', letterSpacing: '2px' }}>{debugOtp}</span>
          </div>
        )}

        <form onSubmit={handleRegisterSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Email & Real-time OTP Verification Section */}
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '0.5rem', color: 'var(--text-muted)' }}>
              Email Address *
            </label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <div style={{ position: 'relative', flex: 1 }}>
                <Mail size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="email"
                  className="input-field"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (isVerified) setIsVerified(false);
                  }}
                  disabled={isVerified}
                  style={{ paddingLeft: '2.6rem' }}
                  required
                />
              </div>

              {!isVerified && (
                <button
                  type="button"
                  onClick={handleSendCode}
                  disabled={sendingCode || !email}
                  style={{
                    padding: '0 1rem',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--primary-color)',
                    background: 'rgba(var(--primary-rgb), 0.1)',
                    color: 'var(--primary-color)',
                    fontWeight: 500,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.3rem'
                  }}
                >
                  {sendingCode ? 'Sending...' : (codeSent ? 'Resend' : 'Send OTP')}
                </button>
              )}
            </div>
          </div>

          {/* Real-time 6-Digit OTP Box */}
          {codeSent && !isVerified && (
            <div style={{
              background: 'var(--card-bg)',
              padding: '1.25rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-color)'
            }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '0.6rem', color: 'var(--primary-color)', textAlign: 'center' }}>
                Enter 6-Digit Verification Code
              </label>
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                <div style={{ position: 'relative', flex: 1 }}>
                  <KeyRound size={20} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--primary-color)' }} />
                  <input
                    type="text"
                    className="input-field"
                    placeholder="123456"
                    maxLength={6}
                    value={otpCode}
                    onChange={handleOtpChange}
                    style={{
                      paddingLeft: '2.8rem',
                      letterSpacing: '6px',
                      fontSize: '1.15rem',
                      fontWeight: 700
                    }}
                    autoFocus
                    required
                  />
                </div>

                <button
                  type="button"
                  onClick={() => handleVerifyOtp()}
                  disabled={verifying || otpCode.length !== 6}
                  style={{
                    padding: '0.75rem 1.2rem',
                    borderRadius: 'var(--radius-sm)',
                    background: 'var(--primary-color)',
                    color: '#0e0e0e',
                    fontWeight: 600,
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '0.85rem'
                  }}
                >
                  {verifying ? 'Verifying...' : 'Verify'}
                </button>
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem', textAlign: 'center' }}>
                Code verifies automatically as soon as 6 digits are typed
              </p>
            </div>
          )}

          {/* Account Details Form */}
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '0.5rem', color: 'var(--text-muted)' }}>
              Full Name *
            </label>
            <div style={{ position: 'relative' }}>
              <User size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="text"
                className="input-field"
                placeholder="e.g. Alex Johnson"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{ paddingLeft: '2.6rem' }}
                required
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '0.5rem', color: 'var(--text-muted)' }}>
              Password *
            </label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="password"
                className="input-field"
                placeholder="At least 6 characters"
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
            disabled={loading || !isVerified}
            style={{
              width: '100%',
              justifyContent: 'center',
              marginTop: '0.5rem',
              padding: '0.9rem',
              fontSize: '1rem',
              opacity: isVerified ? 1 : 0.6
            }}
          >
            {loading ? 'Creating Account...' : (
              <>
                <span>{isVerified ? 'Complete Registration' : 'Verify Email First'}</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '2rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border-subtle)', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          Already have a Listener account?{' '}
          <Link to="/login" style={{ color: 'var(--primary-color)', fontWeight: 600, textDecoration: 'none' }}>
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
