import React, { useEffect, useMemo, useState } from 'react';
import { DOG_STATUSES, ROLES } from '../../constants';
import { watchOrgDogs } from '../../services';

export default function StaffDashboard({ session, dogs = [], organizations = [], setPage, currentTab = 'overview' }) {
  const profile = session.profile;
  const user = session.user;

  const isVet = profile?.role === 'veterinarian';
  const org = useMemo(() => organizations.find(o => o.id === profile?.works_at), [organizations, profile?.works_at]);
  const orgType = org?.type || (isVet ? 'hospital' : 'agency');

  const [orgDogs, setOrgDogs] = useState([]);
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

  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 6;
  const totalPages = Math.ceil(readyToLeaveDogs.length / PAGE_SIZE) || 1;
  const paginatedReadyToLeaveDogs = readyToLeaveDogs.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [totalPages, currentPage]);

  return (
    <div className="staff-dashboard">
      <div className="staff-header" style={{ marginBottom: '24px' }}>
        <p className="eyebrow">— WORKSPACE PORTAL</p>
        <h2>Welcome back, {profile?.full_name || user?.displayName || 'Team Member'}</h2>
        <p className="lead" style={{ fontSize: '15px' }}>
          Logged in as <strong>{ROLES[profile?.role] || 'Staff'}</strong> at <strong>{org?.name || 'Partner Organisation'}</strong>.
        </p>
      </div>

      {currentTab === 'overview' && (
        <>
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
        </>
      )}

      {currentTab === 'ready' && isVet && (
        <div style={{ background: '#fff', padding: '24px', borderRadius: '6px', border: '1px solid var(--line)', marginBottom: '24px' }}>
          <h3 style={{ margin: '0 0 16px 0' }}>
            🏡 Awaiting Admin Action (Ready to Leave)
            <span style={{ fontWeight: 'normal', fontSize: '14px', color: 'var(--muted)', marginLeft: '10px' }}>
              ({readyToLeaveDogs.length} dogs)
            </span>
          </h3>

          {readyToLeaveDogs.length > 0 ? (
            <>
              <div className="dog-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                {paginatedReadyToLeaveDogs.map(d => (
                  <article className="dog-card" key={d.id} style={{ background: '#f7f5f0' }}>
                    {d.social_photos && d.social_photos.length > 0 ? (
                      <img src={d.social_photos[0]} alt={d.name} loading="lazy" />
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
              {totalPages > 1 && (
                <div className="pagination" style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '24px' }}>
                  <button 
                    className="outline" 
                    disabled={currentPage === 1} 
                    style={{ visibility: currentPage === 1 ? 'hidden' : 'visible' }}
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  >
                    ← Previous
                  </button>
                  <span style={{ padding: '8px 12px', fontSize: '14px', color: 'var(--muted)' }}>
                    Page {currentPage} of {totalPages}
                  </span>
                  <button 
                    className="outline" 
                    disabled={currentPage === totalPages} 
                    style={{ visibility: currentPage === totalPages ? 'hidden' : 'visible' }}
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  >
                    Next →
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="empty">
              No dogs waiting for administrative release.
            </div>
          )}
        </div>
      )}

    </div>
  );
}
