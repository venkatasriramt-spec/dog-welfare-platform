import React, { createContext, useContext, useState, useEffect } from 'react';

const MediaViewerContext = createContext();

export function useMediaViewer() {
  return useContext(MediaViewerContext);
}

export function MediaViewerProvider({ children }) {
  const [mediaList, setMediaList] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  // items can be an array of string URLs, or an array of { url, type } objects.
  const openMedia = (items, index = 0) => {
    const formatted = items.map(item => {
      if (typeof item === 'string') {
        const type = item.includes('.mp4') || item.includes('.mov') || item.includes('.webm') || item.includes('video') ? 'video' : 'image';
        return { url: item, type };
      }
      return item;
    });
    setMediaList(formatted);
    setCurrentIndex(index);
  };

  const closeMedia = () => {
    setMediaList([]);
    setCurrentIndex(0);
  };

  const nextMedia = (e) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % mediaList.length);
  };

  const prevMedia = (e) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + mediaList.length) % mediaList.length);
  };

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (mediaList.length === 0) return;
      if (e.key === 'Escape') closeMedia();
      if (e.key === 'ArrowRight') nextMedia(e);
      if (e.key === 'ArrowLeft') prevMedia(e);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mediaList]);

  const currentMedia = mediaList[currentIndex];

  return (
    <MediaViewerContext.Provider value={{ openMedia, closeMedia }}>
      {children}
      {currentMedia && (
        <div 
          onClick={closeMedia}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '40px'
          }}
        >
          <button 
            onClick={closeMedia}
            style={{
              position: 'absolute',
              top: '20px',
              left: '20px',
              background: 'transparent',
              border: 'none',
              color: 'white',
              fontSize: '32px',
              cursor: 'pointer',
              zIndex: 10000,
              padding: '10px'
            }}
          >
            ×
          </button>

          {mediaList.length > 1 && (
            <button 
              onClick={prevMedia}
              style={{
                position: 'absolute',
                left: '20px',
                background: 'rgba(255,255,255,0.1)',
                border: 'none',
                color: 'white',
                fontSize: '32px',
                cursor: 'pointer',
                zIndex: 10000,
                padding: '10px 15px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              ‹
            </button>
          )}
          
          <div 
            onClick={e => e.stopPropagation()} 
            style={{ 
              maxWidth: '90%', 
              maxHeight: '90%', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center' 
            }}
          >
            {currentMedia.type === 'video' ? (
              <video 
                key={currentMedia.url}
                src={currentMedia.url} 
                controls 
                style={{ maxWidth: '100%', maxHeight: '90vh', objectFit: 'contain', borderRadius: '8px' }} 
              />
            ) : (
              <img 
                src={currentMedia.url} 
                alt={`Media ${currentIndex + 1}`} 
                style={{ maxWidth: '100%', maxHeight: '90vh', objectFit: 'contain', borderRadius: '8px', background: 'transparent' }} 
              />
            )}
          </div>

          {mediaList.length > 1 && (
            <button 
              onClick={nextMedia}
              style={{
                position: 'absolute',
                right: '20px',
                background: 'rgba(255,255,255,0.1)',
                border: 'none',
                color: 'white',
                fontSize: '32px',
                cursor: 'pointer',
                zIndex: 10000,
                padding: '10px 15px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              ›
            </button>
          )}

          {mediaList.length > 1 && (
            <div style={{ position: 'absolute', bottom: '20px', color: 'white', fontSize: '14px', background: 'rgba(0,0,0,0.5)', padding: '4px 12px', borderRadius: '15px' }}>
              {currentIndex + 1} / {mediaList.length}
            </div>
          )}
        </div>
      )}
    </MediaViewerContext.Provider>
  );
}
