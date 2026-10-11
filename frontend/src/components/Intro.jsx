import { useState, useEffect } from 'react';

export default function Intro({ onDone }) {
  const [phase, setPhase] = useState(0); // 0: logo, 1: text, 2: waves, 3: fade out
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 600),
      setTimeout(() => setPhase(2), 1400),
      setTimeout(() => {
        setIsFading(true);
        setTimeout(() => onDone(), 800);
      }, 3200),
    ];
    return () => timers.forEach(clearTimeout);
  }, [onDone]);

  const skipIntro = () => {
    setIsFading(true);
    setTimeout(() => onDone(), 500);
  };

  return (
    <div
      className={`intro-overlay ${isFading ? 'intro-fade-out' : 'intro-fade-in'}`}
    >
      {/* Background gradient orbs */}
      <div className="intro-orb intro-orb-1" />
      <div className="intro-orb intro-orb-2" />
      <div className="intro-orb intro-orb-3" />

      <div className="intro-content">
        {/* Animated logo mark */}
        <div className={`intro-logo-mark ${phase >= 0 ? 'intro-visible' : ''}`}>
          <svg viewBox="0 0 120 120" width="80" height="80" fill="none">
            <circle cx="60" cy="60" r="50" stroke="var(--primary-color)" strokeWidth="2" className="intro-ring-1" />
            <circle cx="60" cy="60" r="35" stroke="var(--primary-color)" strokeWidth="2" className="intro-ring-2" />
            <circle cx="60" cy="60" r="20" stroke="var(--primary-color)" strokeWidth="2" className="intro-ring-3" />
            <circle cx="60" cy="60" r="8" fill="var(--primary-color)" className="intro-center-dot" />
          </svg>
        </div>

        {/* Brand name */}
        <h1 className={`intro-brand ${phase >= 1 ? 'intro-visible' : ''}`}>
          <span className="intro-brand-e">E</span>
          <span className="intro-brand-rest">chofy</span>
        </h1>

        {/* Tagline */}
        <p className={`intro-tagline ${phase >= 2 ? 'intro-visible' : ''}`}>
          Feel Every Frequency
        </p>

        {/* Sound wave bars */}
        <div className={`intro-waves ${phase >= 2 ? 'intro-visible' : ''}`}>
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="intro-wave-bar"
              style={{ animationDelay: `${i * 0.08}s` }}
            />
          ))}
        </div>
      </div>

      {/* Skip button */}
      <button className="intro-skip" onClick={skipIntro}>
        Skip
      </button>
    </div>
  );
}
