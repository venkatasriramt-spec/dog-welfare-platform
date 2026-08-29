import React, { useEffect, useRef, useState } from 'react';

/**
 * Confetti - Celebration confetti effect component
 * @param {boolean} isActive - Whether the confetti should be animating
 * @param {number} pieceCount - Number of confetti pieces
 * @param {Function} onComplete - Callback when animation completes
 */
export default function Confetti({ isActive = false, pieceCount = 50, onComplete }) {
  const [pieces, setPieces] = useState([]);
  const timeoutRef = useRef(null);
  const colors = [
    '#f2694d', // orange
    '#f8c95f', // gold
    '#a8dfcf', // mint
    '#acddef', // sky
    '#a987e7', // violet
    '#ff6961', // coral
    '#77dd77', // pastel green
    '#ffb347', // pastel orange
  ];

  useEffect(() => {
    if (!isActive) return;

    // Generate confetti pieces
    const newPieces = Array.from({ length: pieceCount }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      color: colors[Math.floor(Math.random() * colors.length)],
      shape: Math.random() > 0.5 ? 'circle' : 'square',
      size: `${Math.random() * 8 + 6}px`,
      delay: `${Math.random() * 0.3}s`,
      duration: `${2 + Math.random() * 1.5}s`,
      rotation: `${Math.random() * 360}deg`,
      endRotation: `${Math.random() * 720 + 360}deg`,
    }));

    setPieces(newPieces);

    // Clean up after animation
    timeoutRef.current = setTimeout(() => {
      setPieces([]);
      onComplete?.();
    }, 4000);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [isActive, pieceCount, onComplete]);

  if (!isActive || pieces.length === 0) return null;

  return (
    <div className="confetti-container" aria-hidden="true">
      {pieces.map((piece) => (
        <div
          key={piece.id}
          className="confetti-piece"
          style={{
            left: piece.left,
            backgroundColor: piece.color,
            width: piece.size,
            height: piece.size,
            borderRadius: piece.shape === 'circle' ? '50%' : '2px',
            animationDelay: piece.delay,
            animationDuration: piece.duration,
            transform: `rotate(${piece.rotation})`,
            '--end-rotation': piece.endRotation,
          }}
        />
      ))}
    </div>
  );
}

/**
 * SuccessRipple - A ripple effect for success states
 * @param {boolean} isActive - Whether the ripple should animate
 */
export function SuccessRipple({ isActive = false }) {
  if (!isActive) return null;

  return (
    <div className="success-ripple" aria-hidden="true" />
  );
}

/**
 * FloatingParticles - Subtle floating particles for decorative purposes
 * @param {number} count - Number of particles
 * @param {string} color - Color theme
 */
export function FloatingParticles({ count = 15, color = 'var(--orange)' }) {
  const particlesRef = useRef([]);

  useEffect(() => {
    particlesRef.current = Array.from({ length: count }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      size: `${Math.random() * 8 + 4}px`,
      delay: `${Math.random() * 4}s`,
      duration: `${8 + Math.random() * 8}s`,
      opacity: Math.random() * 0.5 + 0.1,
    }));
  }, [count]);

  return (
    <div className="floating-particles" aria-hidden="true" style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: -1 }}>
      {particlesRef.current.map((p) => (
        <div
          key={p.id}
          style={{
            position: 'absolute',
            left: p.left,
            top: p.top,
            width: p.size,
            height: p.size,
            borderRadius: '50%',
            backgroundColor: color,
            opacity: p.opacity,
            animation: `float-particle ${p.duration} ${p.delay} infinite ease-in-out`,
          }}
        />
      ))}
      <style jsx>{`
        @keyframes float-particle {
          0%, 100% { transform: translateY(0) translateX(0) scale(1); opacity: 0.1; }
          25% { transform: translateY(-30px) translateX(20px) scale(1.2); opacity: 0.4; }
          50% { transform: translateY(-60px) translateX(-10px) scale(0.8); opacity: 0.3; }
          75% { transform: translateY(-30px) translateX(-20px) scale(1.1); opacity: 0.4; }
        }
      `}</style>
    </div>
  );
}