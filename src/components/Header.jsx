import React from 'react';

export default function Header({ page, setPage, session }) {
  const selected = page === 'report' || page.startsWith('dog:') ? 'discover' : page;

  return (
    <header>
      <button className="brand" onClick={() => setPage('home')}>
        <span className="brand-mark" aria-hidden="true">
          <svg viewBox="0 0 32 32" role="img">
            <path d="M16 4.5c1.8 0 3.2 1.7 3.2 3.8S17.8 12 16 12s-3.2-1.7-3.2-3.7S14.2 4.5 16 4.5Zm-7.1 4.3c1.6 0 2.8 1.5 2.8 3.3s-1.2 3.3-2.8 3.3-2.9-1.5-2.9-3.3 1.3-3.3 2.9-3.3Zm14.2 0c1.6 0 2.9 1.5 2.9 3.3s-1.3 3.3-2.9 3.3-2.8-1.5-2.8-3.3 1.2-3.3 2.8-3.3ZM16 14.3c4.9 0 8.8 3.9 8.8 8.1 0 2.8-2.3 5.1-5.2 5.1-1.5 0-2.7-.6-3.6-1.8-.9 1.2-2.1 1.8-3.6 1.8-2.9 0-5.2-2.3-5.2-5.1 0-4.2 3.9-8.1 8.8-8.1Z" />
          </svg>
        </span>
        <span>PawPath</span>
      </button>
      <nav>
        {['home', 'about', 'discover'].map(item => (
          <button
            className={selected === item ? 'active' : ''}
            key={item}
            onClick={() => setPage(item)}
          >
            {item[0].toUpperCase() + item.slice(1)}
          </button>
        ))}
        <button
          className={selected === 'apply' ? 'active' : ''}
          onClick={() => setPage('apply')}
        >
          Join PawPath
        </button>
      </nav>
      {session?.user ? (
        <button className="outline" onClick={() => setPage('dashboard')}>
          Dashboard →
        </button>
      ) : (
        <button
          className={`outline ${selected === 'login' ? 'active' : ''}`}
          onClick={() => setPage('login')}
        >
          Sign in →
        </button>
      )}
    </header>
  );
}
