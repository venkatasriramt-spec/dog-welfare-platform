import React from 'react';
import Header from '../components/Header';

export default function PublicShell({ session, page, setPage, children }) {
  return (
    <div className="app-shell">
      <Header page={page} setPage={setPage} session={session} />
      <div className="route-view" key={page}>
        {children}
      </div>
      <footer>
        ✦ PawPath <span>Every dog deserves to be seen.</span>
      </footer>
    </div>
  );
}
