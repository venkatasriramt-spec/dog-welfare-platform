import React from 'react';
import { ROLES } from '../constants';
import { logout } from '../services';
import AgencyDashboard from './dashboards/AgencyDashboard';
import HospitalDashboard from './dashboards/HospitalDashboard';
import PlatformAdminView from './dashboards/PlatformAdminView';
import StaffDashboard from './dashboards/StaffDashboard';
import ParticleBackground from '../components/ParticleBackground';

export default function Dashboard({ session, dogs = [], organizations = [], applications = [], setPage }) {
  const role = session.profile?.role;
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
    <>
      <ParticleBackground mode="dashboard" colorScheme="vibrant" particleCount={40} />
      <section className="dashboard">
        <aside>
          <button className="brand" onClick={() => setPage(session.user ? 'dashboard' : 'home')}>
            ✦ PawPath
          </button>
          <p>{ROLES[role] || 'Account'}</p>

          <nav className="sidebar-nav" style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '100%', margin: '15px 0' }}>
            <button className="active" onClick={() => setPage('dashboard')}>
              🏠 Workspace Dashboard
            </button>
            {!isPending && !isRejected && (
              <>
                <button onClick={() => setPage('discover')}>🐾 Discover dogs</button>
                <button onClick={() => setPage('report')}>📍 Report a dog</button>
                {!isPlatformAdmin && !isHospitalAdmin && !isAgencyAdmin && !isStaff && (
                  <button onClick={() => setPage('apply')}>📋 Join PawPath</button>
                )}
              </>
            )}
          </nav>

          <button onClick={signOut} style={{ marginTop: 'auto' }}>
            Sign out
          </button>
        </aside>

        <main>
          <p className="eyebrow">— {ROLES[role]?.toUpperCase() || 'ACCOUNT WORKSPACE'}</p>
          <h2 style={{ marginBottom: '20px' }}>
            Hello, {session.profile?.full_name || session.user?.displayName || 'there'}.
          </h2>

          {isPlatformAdmin ? (
            <PlatformAdminView
              dogs={dogs}
              organizations={organizations}
              applications={applications}
              setPage={setPage}
            />
          ) : isHospitalAdmin ? (
            <HospitalDashboard
              session={session}
              dogs={dogs}
              organizations={organizations}
              setPage={setPage}
            />
          ) : isAgencyAdmin ? (
            <AgencyDashboard
              session={session}
              dogs={dogs}
              organizations={organizations}
              setPage={setPage}
            />
          ) : isStaff ? (
            <StaffDashboard
              session={session}
              dogs={dogs}
              organizations={organizations}
              setPage={setPage}
            />
          ) : isPending ? (
            <div style={{ background: '#fff', padding: '32px', borderRadius: '6px', border: '1px solid var(--line)' }}>
              <p className="lead" style={{ margin: 0 }}>
                Your organisation application is currently pending review by a platform administrator. We will notify you once your account has been approved and activated.
              </p>
            </div>
          ) : isRejected ? (
            <div style={{ background: '#fff', padding: '32px', borderRadius: '6px', border: '1px solid var(--line)' }}>
              <p className="lead" style={{ color: '#d32f2f', margin: 0 }}>
                Your organisation application was declined.
              </p>
              {session.profile?.reject_reason && (
                <div className="setup-link" style={{ color: '#d32f2f', background: '#ffebee', marginTop: '16px' }}>
                  <b>Reason:</b> {session.profile.reject_reason}
                </div>
              )}
              <p style={{ marginTop: '16px', color: 'var(--muted)' }}>
                If you believe this was a mistake, please contact our support team or apply again.
              </p>
            </div>
          ) : (
            <div>
              <p className="lead">Your account is active. You can report sightings, follow registered dogs, and apply to join PawPath as an organisation.</p>
              <div className="metrics" style={{ gridTemplateColumns: 'repeat(2, 1fr)', marginTop: '24px' }}>
                <article>
                  <b>{dogs.length}</b>
                  <span>Dogs in the network</span>
                </article>
                <article>
                  <b>1</b>
                  <span>Your account</span>
                </article>
              </div>
            </div>
          )}
        </main>
      </section>
    </>
  );
}
