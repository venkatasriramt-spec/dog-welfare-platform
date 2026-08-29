import React, { useEffect, useRef, useMemo } from 'react';

/**
 * ParticleBackground - A lightweight canvas-based particle system for ambient visual effects
 * Supports multiple modes: 'hero', 'subtle', 'discover', 'dashboard', 'login'
 */
export default function ParticleBackground({
  mode = 'subtle',
  className = '',
  particleCount = 60,
  colorScheme = 'default'
}) {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const particlesRef = useRef([]);

  // Color schemes for different moods
  const colors = useMemo(() => {
    const schemes = {
      default: [
        'rgba(242, 105, 77, 0.6)',    // orange
        'rgba(248, 201, 95, 0.6)',    // gold
        'rgba(168, 223, 207, 0.6)',   // mint
        'rgba(172, 221, 239, 0.6)',   // sky
        'rgba(169, 135, 231, 0.6)',   // violet
      ],
      warm: [
        'rgba(242, 105, 77, 0.7)',
        'rgba(248, 201, 95, 0.7)',
        'rgba(255, 179, 71, 0.7)',
        'rgba(255, 140, 60, 0.7)',
      ],
      cool: [
        'rgba(168, 223, 207, 0.7)',
        'rgba(172, 221, 239, 0.7)',
        'rgba(135, 206, 235, 0.7)',
        'rgba(100, 180, 210, 0.7)',
      ],
      vibrant: [
        'rgba(242, 105, 77, 0.8)',
        'rgba(248, 201, 95, 0.8)',
        'rgba(168, 223, 207, 0.8)',
        'rgba(172, 221, 239, 0.8)',
        'rgba(169, 135, 231, 0.8)',
        'rgba(255, 105, 97, 0.8)',
      ],
    };
    return schemes[colorScheme] || schemes.default;
  }, [colorScheme]);

  // Mode configurations
  const config = useMemo(() => {
    const configs = {
      hero: {
        sizeRange: [2, 6],
        speedRange: [0.15, 0.4],
        connectionDistance: 180,
        pulse: true,
        pulseSpeed: 0.002,
      },
      subtle: {
        sizeRange: [1, 3],
        speedRange: [0.05, 0.15],
        connectionDistance: 120,
        pulse: false,
      },
      discover: {
        sizeRange: [1.5, 4],
        speedRange: [0.1, 0.25],
        connectionDistance: 150,
        pulse: true,
        pulseSpeed: 0.0015,
      },
      dashboard: {
        sizeRange: [1, 3],
        speedRange: [0.08, 0.2],
        connectionDistance: 100,
        pulse: false,
      },
      login: {
        sizeRange: [2, 5],
        speedRange: [0.1, 0.3],
        connectionDistance: 160,
        pulse: true,
        pulseSpeed: 0.002,
      },
    };
    return configs[mode] || configs.subtle;
  }, [mode]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let width = 0;
    let height = 0;
    let dpr = window.devicePixelRatio || 1;
    let time = 0;

    // Resize handler
    const resize = () => {
      width = canvas.width = canvas.offsetWidth * dpr;
      height = canvas.height = canvas.offsetHeight * dpr;
      canvas.style.width = canvas.offsetWidth + 'px';
      canvas.style.height = canvas.offsetHeight + 'px';
      ctx.scale(dpr, dpr);
    };

    // Initialize particles
    const initParticles = () => {
      particlesRef.current = [];
      const count = mode === 'hero' ? particleCount * 1.5 : particleCount;

      for (let i = 0; i < count; i++) {
        particlesRef.current.push({
          x: Math.random() * canvas.offsetWidth,
          y: Math.random() * canvas.offsetHeight,
          vx: (Math.random() - 0.5) * (config.speedRange[1] - config.speedRange[0]) + config.speedRange[0],
          vy: (Math.random() - 0.5) * (config.speedRange[1] - config.speedRange[0]) + config.speedRange[0],
          size: Math.random() * (config.sizeRange[1] - config.sizeRange[0]) + config.sizeRange[0],
          baseSize: Math.random() * (config.sizeRange[1] - config.sizeRange[0]) + config.sizeRange[0],
          color: colors[Math.floor(Math.random() * colors.length)],
          phase: Math.random() * Math.PI * 2,
          pulsePhase: Math.random() * Math.PI * 2,
        });
      }
    };

    // Animation loop
    const animate = () => {
      const displayWidth = canvas.offsetWidth;
      const displayHeight = canvas.offsetHeight;

      ctx.clearRect(0, 0, displayWidth, displayHeight);
      time += 0.016; // ~60fps

      const particles = particlesRef.current;

      // Update and draw particles
      particles.forEach((p, i) => {
        // Update position
        p.x += p.vx;
        p.y += p.vy;

        // Wrap around edges
        if (p.x < -50) p.x = displayWidth + 50;
        if (p.x > displayWidth + 50) p.x = -50;
        if (p.y < -50) p.y = displayHeight + 50;
        if (p.y > displayHeight + 50) p.y = -50;

        // Pulse effect
        if (config.pulse) {
          p.size = p.baseSize + Math.sin(time * (config.pulseSpeed || 0.002) * 1000 + p.pulsePhase) * (p.baseSize * 0.3);
        }

        // Draw particle
        ctx.beginPath();
        ctx.arc(p.x, p.y, Math.max(0.5, p.size), 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();

        // Draw connections
        if (config.connectionDistance) {
          for (let j = i + 1; j < particles.length; j++) {
            const p2 = particles[j];
            const dx = p2.x - p.x;
            const dy = p2.y - p.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < config.connectionDistance) {
              const opacity = (1 - dist / config.connectionDistance) * 0.15;
              ctx.beginPath();
              ctx.moveTo(p.x, p.y);
              ctx.lineTo(p2.x, p2.y);
              ctx.strokeStyle = `rgba(242, 105, 77, ${opacity})`;
              ctx.lineWidth = 0.5;
              ctx.stroke();
            }
          }
        }
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    // Initialize
    resize();
    initParticles();
    animate();

    // Handle resize
    window.addEventListener('resize', resize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', resize);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [mode, particleCount, colorScheme, config]);

  const canvasClass = `particle-canvas particle-canvas--${mode} ${className}`.trim();

  return <canvas ref={canvasRef} className={canvasClass} aria-hidden="true" />;
}