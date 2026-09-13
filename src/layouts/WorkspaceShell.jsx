import React from 'react';
import { ROLES } from '../constants';
import { logout } from '../services';
import ParticleBackground from '../components/ParticleBackground';

export default function WorkspaceShell({ session, page, setPage, children }) {
  const role = session?.profile?.role;
  const isPlatformAdmin = role === 'platform_admin';
  const isHospitalAdmin = role === 'hospital_admin';
  const isAgencyAdmin = role === 'agency_admin';
  const isStaff = role === 'veterinarian' || role === 'agency_employee';
  const isPending = role === 'pending_partner';
  const isRejected = role === 'rejected_partner';

  const signOut = async () => {
    await logout();
    setPage('home');
  };

  return (
    <div className="app-shell workspace-shell">
      <ParticleBackground mode="dashboard" colorScheme="vibrant" particleCount={40} />
      <section className="dashboard">
        <aside>
          <button className="brand" onClick={() => setPage('dashboard')}>
            ✦ PawPath
          </button>
          <p>{ROLES[role] || 'Account'}</p>

          <nav className="sidebar-nav" style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '100%', margin: '15px 0' }}>
            <button className={page === 'dashboard' ? 'active' : ''} onClick={() => setPage('dashboard')}>
              🏠 Workspace Dashboard
            </button>
            {!isPending && !isRejected && (
              <>
                <button className={page === 'discover' || page.startsWith('dog:') ? 'active' : ''} onClick={() => setPage('discover')}>🐾 Discover dogs</button>
                {!isPlatformAdmin && !isHospitalAdmin && !isAgencyAdmin && !isStaff && (
                  <>
                    <button className={page === 'report' ? 'active' : ''} onClick={() => setPage('report')}>📍 Report a dog</button>
                    <button className={page === 'apply' ? 'active' : ''} onClick={() => setPage('apply')}>📋 Join PawPath</button>
                  </>
                )}
              </>
            )}
          </nav>

          <button onClick={signOut} style={{ marginTop: 'auto' }}>
            Sign out
          </button>
        </aside>

        <main>
          {children}
        </main>
      </section>
    </div>
  );
}
