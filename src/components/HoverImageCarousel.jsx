import React, { useState, useEffect, useRef } from 'react';

export default function HoverImageCarousel({ images, alt, className = '' }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const intervalRef = useRef(null);

  // Filter out any invalid images just in case
  const validImages = Array.isArray(images) ? images.filter(Boolean) : [];

  useEffect(() => {
    if (isHovered && validImages.length > 1) {
      intervalRef.current = setInterval(() => {
        setCurrentIndex(prev => (prev + 1) % validImages.length);
      }, 1500); // 1.5s per image
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setCurrentIndex(0); // reset to first image when hover ends
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isHovered, validImages.length]);

  if (validImages.length === 0) {
    return <div className={`dog-placeholder ${className}`}>🐾</div>;
  }

  return (
    <div 
      className={`hover-carousel-container ${className}`} 
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ position: 'relative', width: '100%', height: '225px', overflow: 'hidden' }}
    >
      {validImages.map((src, i) => (
        <img 
          key={i}
          src={src} 
          alt={alt || 'Dog'} 
          loading="lazy"
          style={{ 
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%', 
            height: '100%', 
            objectFit: 'cover',
            opacity: i === currentIndex ? 1 : 0,
            transition: 'opacity 0.3s ease-in-out',
            zIndex: i === currentIndex ? 1 : 0
          }} 
        />
      ))}
      {/* Show tiny dots at the bottom if multiple images and hovered */}
      {isHovered && validImages.length > 1 && (
        <div style={{
          position: 'absolute',
          bottom: '8px',
          left: '0',
          width: '100%',
          display: 'flex',
          justifyContent: 'center',
          gap: '4px',
          zIndex: 10
        }}>
          {validImages.map((_, i) => (
            <div 
              key={i}
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                backgroundColor: i === currentIndex ? '#fff' : 'rgba(255,255,255,0.5)',
                transition: 'background-color 0.3s'
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
