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
            {isStaff && (
              <button className={page === 'staff_dogs' ? 'active' : ''} onClick={() => setPage('staff_dogs')}>
                {role === 'veterinarian' ? '🩺 Active Patients' : '🏡 Shelter Dogs'}
              </button>
            )}
            
            {isPlatformAdmin && (
              <>
                <button className={page === 'admin_pending' ? 'active' : ''} onClick={() => setPage('admin_pending')}>📌 Pending Requests</button>
                <button className={page === 'admin_hospitals' ? 'active' : ''} onClick={() => setPage('admin_hospitals')}>🏥 Hospitals</button>
                <button className={page === 'admin_agencies' ? 'active' : ''} onClick={() => setPage('admin_agencies')}>🏡 Adoption Agencies</button>
              </>
            )}

            {isHospitalAdmin && (
              <>
                <button className={page === 'hospital_doctors' ? 'active' : ''} onClick={() => setPage('hospital_doctors')}>👨‍⚕️ Doctors & Staff</button>
                <button className={page === 'hospital_queue' ? 'active' : ''} onClick={() => setPage('hospital_queue')}>🚨 Incoming Queue</button>
                <button className={page === 'hospital_active' ? 'active' : ''} onClick={() => setPage('hospital_active')}>🩺 Active Patients</button>
                <button className={page === 'hospital_ready' ? 'active' : ''} onClick={() => setPage('hospital_ready')}>🏡 Ready to Leave</button>
              </>
            )}

            {isAgencyAdmin && (
              <>
                <button className={page === 'agency_employees' ? 'active' : ''} onClick={() => setPage('agency_employees')}>👥 Staff & Employees</button>
                <button className={page === 'agency_residents' ? 'active' : ''} onClick={() => setPage('agency_residents')}>🏡 Current Residents</button>
                <button className={page === 'agency_history' ? 'active' : ''} onClick={() => setPage('agency_history')}>❤️ Adoption History</button>
              </>
            )}
            {!isPending && !isRejected && (
              <>
                {!isStaff && (
                  <button className={page === 'discover' || page.startsWith('dog:') ? 'active' : ''} onClick={() => setPage('discover')}>🐾 Discover dogs</button>
                )}
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
