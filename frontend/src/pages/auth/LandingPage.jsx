import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Music2,
  Play,
  Mic2,
  ArrowRight,
  Headphones,
  ListMusic,
  Heart,
  Check,
  Sparkles,
  Radio,
  Disc3
} from 'lucide-react';

/* Scroll reveal hook */
function useScrollReveal() {
  const ref = useRef(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setRevealed(true); observer.disconnect(); } },
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return { ref, revealed };
}

function Reveal({ children, className = '', delay = 0 }) {
  const { ref, revealed } = useScrollReveal();
  return (
    <div
      ref={ref}
      className={`scroll-reveal ${revealed ? 'revealed' : ''} ${className}`}
      style={{ transitionDelay: `${delay}s` }}
    >
      {children}
    </div>
  );
}

export default function LandingPage() {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg-color)',
      color: 'var(--text-main)',
      fontFamily: "'Inter', sans-serif",
      overflowX: 'hidden'
    }}>

      {/* ── Header ─── */}
      <header style={{
        padding: '1.25rem 3rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        background: 'rgba(14,14,14,0.8)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--border-subtle)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: '36px', height: '36px', borderRadius: '10px',
            background: 'var(--primary-color)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0e0e0e'
          }}>
            <Music2 size={18} strokeWidth={2} />
          </div>
          <span style={{ fontSize: '1.25rem', fontWeight: 600, letterSpacing: '-0.02em' }}>Echofy</span>
        </div>

        <nav style={{ display: 'flex', gap: '2rem', alignItems: 'center', fontSize: '0.875rem' }}>
          <a href="#features" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Features</a>
          <a href="#experience" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Experience</a>
          <a href="#artists" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>For Artists</a>
        </nav>

        <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
          <Link to="/login" className="btn-secondary" style={{ padding: '0.55rem 1.25rem', fontSize: '0.8rem' }}>Sign In</Link>
          <Link to="/register" className="btn-primary" style={{ padding: '0.55rem 1.25rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span>Get Started</span><ArrowRight size={14} />
          </Link>
        </div>
      </header>

      {/* ── Hero Section ─── */}
      <section style={{
        position: 'relative',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        padding: '6rem 3rem',
        overflow: 'hidden'
      }}>
        {/* Parallax background orbs */}
        <div className="parallax-orb" style={{
          width: '500px', height: '500px',
          background: 'rgba(var(--primary-rgb), 0.06)',
          top: '-100px', right: '-100px',
          transform: `translateY(${scrollY * 0.15}px)`
        }} />
        <div className="parallax-orb" style={{
          width: '350px', height: '350px',
          background: 'rgba(var(--primary-rgb), 0.04)',
          bottom: '-50px', left: '-50px',
          transform: `translateY(${scrollY * -0.1}px)`
        }} />

        <div style={{
          maxWidth: '1200px', margin: '0 auto', width: '100%',
          display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5rem', alignItems: 'center',
          position: 'relative', zIndex: 2
        }}>
          {/* Left: Text */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <Reveal>
              <span style={{
                fontSize: '0.65rem', fontWeight: 600, color: 'var(--primary-color)',
                letterSpacing: '0.15em', textTransform: 'uppercase',
                display: 'flex', alignItems: 'center', gap: '0.5rem'
              }}>
                <Sparkles size={14} />
                Music Streaming Platform
              </span>
            </Reveal>

            <Reveal delay={0.1}>
              <h1 style={{
                fontSize: '4.5rem', fontWeight: 500, lineHeight: 1.05,
                letterSpacing: '-0.03em', fontFamily: 'Playfair Display, serif'
              }}>
                Feel Every
                <br />
                <span style={{ fontStyle: 'italic', color: 'var(--primary-color)' }}>Frequency.</span>
              </h1>
            </Reveal>

            <Reveal delay={0.2}>
              <p style={{
                fontSize: '1.05rem', color: 'var(--text-secondary)',
                lineHeight: 1.7, maxWidth: '460px'
              }}>
                Stream high-fidelity audio, curate playlists, and discover independent artists — all in one beautifully minimal space.
              </p>
            </Reveal>

            <Reveal delay={0.3}>
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                <Link to="/register" className="btn-primary" style={{ padding: '0.85rem 2rem', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Play size={16} fill="#0e0e0e" /><span>Start Listening</span>
                </Link>
                <Link to="/artist/register" className="btn-secondary" style={{ padding: '0.85rem 2rem', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Mic2 size={16} /><span>Join as Artist</span>
                </Link>
              </div>
            </Reveal>

            <Reveal delay={0.4}>
              <div style={{
                display: 'flex', gap: '2rem', paddingTop: '1.75rem',
                borderTop: '1px solid var(--border-subtle)'
              }}>
                {['Free Forever', 'HD Audio', 'No Ads'].map((label) => (
                  <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    <Check size={14} strokeWidth={2} color="var(--primary-color)" />
                    <span>{label}</span>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>

          {/* Right: Animated Visual */}
          <div style={{ position: 'relative', display: 'flex', justifyContent: 'center' }}>
            <div className="hero-float" style={{ position: 'relative' }}>
              {/* Main disc */}
              <div className="hero-glow" style={{
                width: '380px', height: '380px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--surface-hover) 0%, var(--surface-color) 100%)',
                border: '1px solid var(--border-subtle)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                position: 'relative'
              }}>
                {/* Concentric rings */}
                {[280, 220, 160].map((size, i) => (
                  <div key={size} style={{
                    position: 'absolute',
                    width: `${size}px`, height: `${size}px`,
                    borderRadius: '50%',
                    border: '1px solid var(--border-subtle)',
                    opacity: 0.5 - i * 0.1
                  }} />
                ))}

                {/* Center */}
                <div style={{
                  width: '80px', height: '80px', borderRadius: '50%',
                  background: 'var(--primary-color)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#0e0e0e', position: 'relative', zIndex: 2
                }}>
                  <Disc3 size={36} strokeWidth={1.5} />
                  {/* Pulse ring */}
                  <div className="pulse-ring" style={{
                    position: 'absolute', inset: '-8px',
                    borderRadius: '50%', border: '2px solid var(--primary-color)'
                  }} />
                </div>
              </div>

              {/* Floating mini card */}
              <div style={{
                position: 'absolute', bottom: '-20px', left: '-30px',
                background: 'var(--surface-color)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '0.85rem 1.1rem',
                display: 'flex', alignItems: 'center', gap: '0.75rem',
                boxShadow: 'var(--shadow-lg)',
                animation: 'heroFloat 6s ease-in-out infinite 1s'
              }}>
                <div style={{
                  width: '36px', height: '36px', borderRadius: '8px',
                  background: 'rgba(var(--primary-rgb), 0.15)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'var(--primary-color)'
                }}>
                  <Radio size={16} />
                </div>
                <div>
                  <div style={{ fontWeight: 500, fontSize: '0.8rem' }}>Now Playing</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Live Stream</div>
                </div>
                {/* Mini equalizer */}
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: '2px', height: '20px', marginLeft: '0.5rem' }}>
                  {[0, 1, 2, 3].map(i => (
                    <div key={i} className="eq-bar" style={{
                      width: '3px', background: 'var(--primary-color)', borderRadius: '2px',
                      animationDelay: `${i * 0.15}s`
                    }} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Genre Marquee ── */}
      <div className="section-divider" />
      <div style={{ padding: '1.5rem 0', overflow: 'hidden', borderBottom: '1px solid var(--border-subtle)' }}>
        <div className="marquee-track" style={{ gap: '3rem' }}>
          {[...Array(2)].map((_, setIdx) => (
            <React.Fragment key={setIdx}>
              {['Synthwave', 'Electronic', 'Hip Hop', 'Acoustic', 'Lo-Fi', 'Jazz', 'Indie', 'R&B', 'Classical', 'Devotional'].map((g) => (
                <span key={`${setIdx}-${g}`} style={{
                  color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 400,
                  letterSpacing: '0.05em', whiteSpace: 'nowrap',
                  display: 'flex', alignItems: 'center', gap: '3rem'
                }}>
                  {g}
                  <span style={{ color: 'var(--primary-color)', opacity: 0.3 }}>◆</span>
                </span>
              ))}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* ─── Features Section ─── */}
      <section id="features" style={{ padding: '7rem 3rem', maxWidth: '1100px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <Reveal>
            <span className="section-label">What we offer</span>
          </Reveal>
          <Reveal delay={0.1}>
            <h2 className="section-title" style={{ fontSize: '2.25rem', marginTop: '0.75rem' }}>
              Built for music lovers & creators
            </h2>
          </Reveal>
          <Reveal delay={0.2}>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', maxWidth: '500px', margin: '0.75rem auto 0' }}>
              Everything you need for seamless listening, track management, and music distribution.
            </p>
          </Reveal>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }}>
          {[
            { icon: <Headphones size={22} strokeWidth={1.5} />, title: 'Lossless HD Audio', desc: 'Crisp, high-fidelity sound with zero compression latency and instant buffering.' },
            { icon: <Radio size={22} strokeWidth={1.5} />, title: 'YouTube Stream Sync', desc: 'Paste YouTube links to stream audio directly with background playback support.' },
            { icon: <Mic2 size={22} strokeWidth={1.5} />, title: 'Artist Studio Portal', desc: 'Upload tracks, add cover art, organize albums, and grow your listener fanbase.' },
            { icon: <ListMusic size={22} strokeWidth={1.5} />, title: 'Smart Playlists', desc: 'Create custom playlists, save favorites, and access your recently played history.' }
          ].map((feature, i) => (
            <Reveal key={i} delay={i * 0.1}>
              <div className="glass-card card-lift gradient-border" style={{
                padding: '2.25rem', borderRadius: 'var(--radius-lg)',
                display: 'flex', flexDirection: 'column', gap: '1.25rem'
              }}>
                <div style={{
                  width: '48px', height: '48px', borderRadius: '12px',
                  background: 'rgba(var(--primary-rgb), 0.08)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'var(--primary-color)'
                }}>
                  {feature.icon}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 500 }}>{feature.title}</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', lineHeight: 1.6 }}>
                    {feature.desc}
                  </p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ─── Player Experience ─── */}
      <section id="experience" style={{ padding: '0 3rem 7rem', maxWidth: '1100px', margin: '0 auto' }}>
        <Reveal>
          <div style={{
            borderRadius: 'var(--radius-xl)', padding: '3rem',
            background: 'var(--card-bg)', border: '1px solid var(--border-subtle)',
            display: 'flex', flexDirection: 'column', gap: '2rem'
          }}>
            <div style={{ textAlign: 'center' }}>
              <span className="section-label">Interactive Preview</span>
              <h2 className="section-title" style={{ fontSize: '1.75rem', marginTop: '0.5rem' }}>The Player Experience</h2>
            </div>

            <div style={{
              background: 'var(--surface-hover)', borderRadius: 'var(--radius-lg)',
              padding: '1.25rem 1.75rem', border: '1px solid var(--border-subtle)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '2rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{
                  width: '50px', height: '50px', borderRadius: '8px',
                  background: 'linear-gradient(135deg, var(--primary-color), rgba(var(--primary-rgb), 0.5))',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0e0e0e'
                }}>
                  <Music2 size={20} />
                </div>
                <div>
                  <div style={{ fontWeight: 500, fontSize: '0.9rem' }}>Neon Lights</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>The Midnight Echo</div>
                </div>
              </div>

              <div style={{ flex: 1, maxWidth: '360px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{
                  width: '40px', height: '40px', borderRadius: '50%',
                  background: 'var(--primary-color)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0e0e0e',
                  cursor: 'pointer', transition: 'transform 0.2s'
                }}>
                  <Play size={16} fill="#0e0e0e" style={{ marginLeft: '2px' }} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', width: '100%' }}>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>1:42</span>
                  <div style={{ flex: 1, height: '3px', background: 'var(--border-color)', borderRadius: '2px', position: 'relative' }}>
                    <div style={{ width: '45%', height: '100%', background: 'var(--primary-color)', borderRadius: '2px' }} />
                  </div>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>3:45</span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Heart size={16} strokeWidth={1.5} color="var(--primary-color)" fill="var(--primary-color)" style={{ cursor: 'pointer' }} />
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ── Artist CTA ─── */}
      <section id="artists" style={{ padding: '0 3rem 7rem', maxWidth: '1100px', margin: '0 auto' }}>
        <Reveal>
          <div style={{
            borderRadius: 'var(--radius-xl)', padding: '4rem 3rem',
            background: 'linear-gradient(135deg, rgba(var(--primary-rgb), 0.06) 0%, var(--card-bg) 100%)',
            border: '1px solid var(--border-subtle)',
            textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.25rem',
            position: 'relative', overflow: 'hidden'
          }}>
            {/* Decorative orbs */}
            <div className="parallax-orb" style={{
              width: '200px', height: '200px',
              background: 'rgba(var(--primary-rgb), 0.08)',
              top: '-60px', right: '-60px', filter: 'blur(40px)'
            }} />
            <div className="parallax-orb" style={{
              width: '150px', height: '150px',
              background: 'rgba(var(--primary-rgb), 0.05)',
              bottom: '-40px', left: '-40px', filter: 'blur(40px)'
            }} />

            <span className="section-label" style={{ position: 'relative', zIndex: 2 }}>For Artists</span>
            <h2 className="section-title" style={{ fontSize: '2.25rem', position: 'relative', zIndex: 2 }}>
              Share your music with the world
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', maxWidth: '520px', lineHeight: 1.7, position: 'relative', zIndex: 2 }}>
              Upload your tracks, build your audience, and manage your catalog — all from one elegant studio.
            </p>

            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem', position: 'relative', zIndex: 2 }}>
              <Link to="/artist/register" className="btn-primary" style={{ padding: '0.85rem 2rem', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span>Open Artist Studio</span><ArrowRight size={15} />
              </Link>
              <Link to="/login" className="btn-secondary" style={{ padding: '0.85rem 2rem', fontSize: '0.9rem' }}>
                Sign In
              </Link>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ─── Footer ─── */}
      <footer style={{
        padding: '2.5rem 3rem', borderTop: '1px solid var(--border-subtle)',
        color: 'var(--text-muted)', fontSize: '0.8rem'
      }}>
        <div style={{
          maxWidth: '1100px', margin: '0 auto',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{
              width: '28px', height: '28px', borderRadius: '8px',
              background: 'var(--primary-color)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0e0e0e'
            }}>
              <Music2 size={14} strokeWidth={2} />
            </div>
            <span style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-main)' }}>Echofy</span>
          </div>
          <span>© 2026 Echofy. Built for artists and listeners.</span>
        </div>
      </footer>
    </div>
  );
}
