import React, { useEffect, useMemo, useState } from 'react';
import { DOG_STATUSES, ROLES } from '../../constants';
import { watchOrgDogs } from '../../services';

export default function StaffDashboard({ session, dogs = [], organizations = [], setPage }) {
  const profile = session.profile;
  const user = session.user;

  const isVet = profile?.role === 'veterinarian';
  const org = useMemo(() => organizations.find(o => o.id === profile?.works_at), [organizations, profile?.works_at]);
  const orgType = org?.type || (isVet ? 'hospital' : 'agency');

  const [orgDogs, setOrgDogs] = useState([]);
  const [viewAllActive, setViewAllActive] = useState(false);
  useEffect(() => {
    if (!profile?.works_at) return;
    return watchOrgDogs(profile.works_at, orgType, setOrgDogs);
  }, [profile?.works_at, orgType]);

  const activeDogs = useMemo(() => {
    if (isVet) return orgDogs.filter(d => d.status === 'in_treatment');
    return orgDogs.filter(d => d.status === 'adoptable');
  }, [orgDogs, isVet]);

  const readyToLeaveDogs = useMemo(() => {
    if (isVet) return orgDogs.filter(d => d.status === 'fit_for_discharge');
    return [];
  }, [orgDogs, isVet]);

  const displayedActiveDogs = activeDogs.slice(0, 3);

  if (viewAllActive) {
    return (
      <div className="staff-dashboard">
        <div style={{ marginBottom: '24px' }}>
          <button className="link" onClick={() => setViewAllActive(false)} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
            ← Back to Dashboard
          </button>
        </div>
        <div style={{ background: '#fff', padding: '24px', borderRadius: '6px', border: '1px solid var(--line)' }}>
          <h3 style={{ margin: '0 0 16px 0' }}>
            {isVet ? '🩺 All Active Patients' : '🏡 All Shelter Dogs'}
            <span style={{ fontWeight: 'normal', fontSize: '14px', color: 'var(--muted)', marginLeft: '10px' }}>
              ({activeDogs.length} active)
            </span>
          </h3>
          <div className="dog-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
            {activeDogs.map(d => (
              <article className="dog-card" key={d.id} style={{ background: '#f7f5f0' }}>
                {d.social_photos && d.social_photos.length > 0 ? (
                  <img src={d.social_photos[0]} alt={d.name} />
                ) : (
                  <div className="dog-placeholder">🐾</div>
                )}
                <span className={`status ${d.status}`}>{DOG_STATUSES[d.status] || d.status}</span>
                <div style={{ padding: '16px' }}>
                  {d.tag && <small style={{ color: 'var(--orange)', fontWeight: 'bold' }}>{d.tag}</small>}
                  <h3>{d.name}</h3>
                  <p>{d.breed || 'Breed pending'} · {d.gender || ''}</p>
                  <button className="link" onClick={() => setPage(`dog:${d.id}`)}>
                    {isVet ? 'Add medical record →' : 'View record →'}
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="staff-dashboard">
      <div className="staff-header" style={{ marginBottom: '24px' }}>
        <p className="eyebrow">— WORKSPACE PORTAL</p>
        <h2>Welcome back, {profile?.full_name || user?.displayName || 'Team Member'}</h2>
        <p className="lead" style={{ fontSize: '15px' }}>
          Logged in as <strong>{ROLES[profile?.role] || 'Staff'}</strong> at <strong>{org?.name || 'Partner Organisation'}</strong>.
        </p>
      </div>

      {/* Profile & Organization Card */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '32px' }}>
        <div style={{ background: '#fff', padding: '24px', borderRadius: '6px', border: '1px solid var(--line)' }}>
          <h3 style={{ margin: '0 0 14px 0', fontFamily: 'Fraunces, serif' }}>👤 Your Staff Profile</h3>
          <p style={{ margin: '6px 0', fontSize: '14px' }}><strong>Name:</strong> {profile?.full_name || user?.displayName}</p>
          <p style={{ margin: '6px 0', fontSize: '14px' }}><strong>Email:</strong> {user?.email}</p>
          <p style={{ margin: '6px 0', fontSize: '14px' }}><strong>Role:</strong> {ROLES[profile?.role]}</p>
          <p style={{ margin: '6px 0', fontSize: '14px' }}><strong>Specialization / Title:</strong> {profile?.title || (isVet ? 'General Vet' : 'Staff Member')}</p>
        </div>

        <div style={{ background: '#fff', padding: '24px', borderRadius: '6px', border: '1px solid var(--line)' }}>
          <h3 style={{ margin: '0 0 14px 0', fontFamily: 'Fraunces, serif' }}>🏢 Assigned Organisation</h3>
          <p style={{ margin: '6px 0', fontSize: '14px' }}><strong>Organisation:</strong> {org?.name || 'Assigned Organisation'}</p>
          <p style={{ margin: '6px 0', fontSize: '14px' }}><strong>Type:</strong> {org?.type ? (org.type === 'hospital' ? 'Veterinary Hospital / Clinic' : 'Adoption Agency') : 'Partner'}</p>
          <p style={{ margin: '6px 0', fontSize: '14px' }}><strong>Contact Email:</strong> {org?.email || 'N/A'}</p>
          <p style={{ margin: '6px 0', fontSize: '14px' }}><strong>Address:</strong> {org?.address || 'N/A'}</p>
        </div>
      </div>

      {/* Active Patients / Dogs */}
      <div style={{ background: '#fff', padding: '24px', borderRadius: '6px', border: '1px solid var(--line)', marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ margin: 0 }}>
            {isVet ? '🩺 Your Active Patients' : '🏡 Shelter Dogs'}
            <span style={{ fontWeight: 'normal', fontSize: '14px', color: 'var(--muted)', marginLeft: '10px' }}>
              ({activeDogs.length} active)
            </span>
          </h3>
          {activeDogs.length > 3 && (
            <button className="outline" onClick={() => setViewAllActive(true)} style={{ padding: '6px 12px', fontSize: '13px' }}>
              View all
            </button>
          )}
        </div>

        {activeDogs.length > 0 ? (
          <div className="dog-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
            {displayedActiveDogs.map(d => (
              <article className="dog-card" key={d.id} style={{ background: '#f7f5f0' }}>
                {d.social_photos && d.social_photos.length > 0 ? (
                  <img src={d.social_photos[0]} alt={d.name} />
                ) : (
                  <div className="dog-placeholder">🐾</div>
                )}
                <span className={`status ${d.status}`}>{DOG_STATUSES[d.status] || d.status}</span>
                <div style={{ padding: '16px' }}>
                  {d.tag && <small style={{ color: 'var(--orange)', fontWeight: 'bold' }}>{d.tag}</small>}
                  <h3>{d.name}</h3>
                  <p>{d.breed || 'Breed pending'} · {d.gender || ''}</p>
                  <button className="link" onClick={() => setPage(`dog:${d.id}`)}>
                    {isVet ? 'Add medical record →' : 'View record →'}
                  </button>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="empty">
            {isVet ? 'No dogs currently in treatment at your hospital.' : 'No dogs currently in your shelter.'}
          </div>
        )}
      </div>

      {isVet && (
        <div style={{ background: '#fff', padding: '24px', borderRadius: '6px', border: '1px solid var(--line)', marginBottom: '24px' }}>
          <h3 style={{ margin: '0 0 16px 0' }}>
            🏡 Awaiting Admin Action (Ready to Leave)
            <span style={{ fontWeight: 'normal', fontSize: '14px', color: 'var(--muted)', marginLeft: '10px' }}>
              ({readyToLeaveDogs.length} dogs)
            </span>
          </h3>

          {readyToLeaveDogs.length > 0 ? (
            <div className="dog-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
              {readyToLeaveDogs.map(d => (
                <article className="dog-card" key={d.id} style={{ background: '#f7f5f0' }}>
                  {d.social_photos && d.social_photos.length > 0 ? (
                    <img src={d.social_photos[0]} alt={d.name} />
                  ) : (
                    <div className="dog-placeholder">🐾</div>
                  )}
                  <span className={`status ${d.status}`}>{DOG_STATUSES[d.status] || d.status}</span>
                  <div style={{ padding: '16px' }}>
                    {d.tag && <small style={{ color: 'var(--orange)', fontWeight: 'bold' }}>{d.tag}</small>}
                    <h3>{d.name}</h3>
                    <p>{d.breed || 'Breed pending'} · {d.gender || ''}</p>
                    <button className="link" onClick={() => setPage(`dog:${d.id}`)}>
                      View record →
                    </button>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="empty">
              No dogs waiting for administrative release.
            </div>
          )}
        </div>
      )}

      {/* Quick Actions */}
      <div style={{ background: '#fff', padding: '24px', borderRadius: '6px', border: '1px solid var(--line)' }}>
        <h3 style={{ margin: '0 0 16px 0' }}>{isVet ? '🩺 Medical Workstation' : '🏡 Care Workstation'}</h3>
        <p style={{ color: 'var(--muted)', fontSize: '14px', marginBottom: '20px' }}>
          {isVet
            ? 'Access all dog records in the network, add treatment notes, and manage patient care.'
            : 'Access shelter dog listings, track community reports, and update adoption availability.'}
        </p>

        <div className="actions" style={{ gap: '12px' }}>
          <button className="primary" onClick={() => setPage('discover')}>
            Explore All Dogs ({dogs.length}) →
          </button>
        </div>
      </div>
    </div>
  );
}
