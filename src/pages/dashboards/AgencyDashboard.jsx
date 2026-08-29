import React, { useEffect, useMemo, useState } from 'react';
import DogRegistrationForm from '../../components/DogRegistrationForm';
import StaffManager from '../../components/StaffManager';
import { DOG_STATUSES } from '../../constants';
import { watchOrgDogs } from '../../services';

export default function AgencyDashboard({ session, dogs = [], organizations = [], setPage }) {
  const [tab, setTab] = useState('overview');
  const [showAddForm, setShowAddForm] = useState(false);
  const userOrgId = session.profile?.works_at;
  const currentOrg = useMemo(() => organizations.find(o => o.id === userOrgId), [organizations, userOrgId]);

  // Dogs belonging to this agency
  const [orgDogs, setOrgDogs] = useState([]);
  useEffect(() => {
    if (!userOrgId) return;
    return watchOrgDogs(userOrgId, 'agency', setOrgDogs);
  }, [userOrgId]);

  const adoptableDogs = useMemo(() => orgDogs.filter(d => d.status === 'adoptable'), [orgDogs]);
  const adoptedDogs = useMemo(() => orgDogs.filter(d => d.status === 'adopted'), [orgDogs]);

  return (
    <div className="agency-dashboard">
      <div className="agency-header" style={{ marginBottom: '24px' }}>
        <p className="eyebrow">— ADOPTION AGENCY WORKSPACE</p>
        <h2>{currentOrg?.name || 'Rescue & Adoption Agency'}</h2>
        <p className="lead" style={{ fontSize: '15px' }}>
          Manage shelter dogs, onboard adoption coordinators & staff, and process adoptions.
        </p>
      </div>

      {/* Sub-navigation tabs */}
      <div className="tabs" style={{ marginTop: '20px', marginBottom: '30px' }}>
        <button className={tab === 'overview' ? 'selected' : ''} onClick={() => setTab('overview')}>
          📊 Overview
        </button>
        <button className={tab === 'employees' ? 'selected' : ''} onClick={() => setTab('employees')}>
          👥 Staff & Employees
        </button>
        <button className={tab === 'shelter' ? 'selected' : ''} onClick={() => setTab('shelter')}>
          🏡 Shelter Dogs ({orgDogs.length})
        </button>
      </div>

      {/* Overview Tab */}
      {tab === 'overview' && (
        <div className="agency-overview">
          <div className="metrics" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
            <article>
              <b>{adoptableDogs.length}</b>
              <span>Available for Adoption</span>
            </article>
            <article>
              <b>{adoptedDogs.length}</b>
              <span>Successful Adoptions</span>
            </article>
            <article>
              <b>{orgDogs.length}</b>
              <span>Total Shelter Dogs</span>
            </article>
          </div>

          <div style={{ background: '#fff', padding: '24px', borderRadius: '6px', border: '1px solid var(--line)', marginTop: '24px' }}>
            <h3 style={{ margin: '0 0 12px 0' }}>Agency Details</h3>
            <p style={{ margin: '4px 0', color: 'var(--muted)', fontSize: '14px' }}>
              <strong>Email:</strong> {currentOrg?.email || session.user?.email}
            </p>
            <p style={{ margin: '4px 0', color: 'var(--muted)', fontSize: '14px' }}>
              <strong>Phone:</strong> {currentOrg?.phone || 'Not recorded'}
            </p>
            <p style={{ margin: '4px 0', color: 'var(--muted)', fontSize: '14px' }}>
              <strong>Address:</strong> {currentOrg?.address || 'Not recorded'}
            </p>
          </div>
        </div>
      )}

      {/* Employees Tab */}
      {tab === 'employees' && (
        <StaffManager
          organizationId={userOrgId}
          roleType="agency_admin"
          orgName={currentOrg?.name}
        />
      )}

      {/* Shelter Tab */}
      {tab === 'shelter' && (
        <div className="agency-shelter">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <h3>Shelter & Adoption Listings</h3>
              <p className="lead" style={{ fontSize: '14px', margin: 0 }}>
                Dogs managed by your shelter. Click any record to view details or process adoption.
              </p>
            </div>
            <button className="primary" onClick={() => setShowAddForm(!showAddForm)}>
              {showAddForm ? '✕ Close' : '+ Add Shelter Dog'}
            </button>
          </div>

          {showAddForm && (
            <div style={{ background: '#fff', padding: '24px', borderRadius: '6px', border: '1px solid var(--line)', marginBottom: '24px' }}>
              <DogRegistrationForm
                contextLabel="Add Dog to Shelter"
                onDogRegistered={() => setShowAddForm(false)}
              />
            </div>
          )}

          {orgDogs.length > 0 ? (
            <div className="dog-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
              {orgDogs.map(d => (
                <article className="dog-card" key={d.id} style={{ background: '#fff' }}>
                  {d.social_photos && d.social_photos.length > 0 ? (
                    <img src={d.social_photos[0]} alt={d.name} />
                  ) : (
                    <div className="dog-placeholder">🐾</div>
                  )}
                  <span className={`status ${d.status}`}>{DOG_STATUSES[d.status] || d.status}</span>
                  <div style={{ padding: '16px' }}>
                    {d.tag && <small style={{ color: 'var(--orange)', fontWeight: 'bold' }}>{d.tag}</small>}
                    <h3>{d.name}</h3>
                    <p>{d.breed || 'Breed pending'} · {d.gender || ''} · {d.estimated_age || ''}</p>
                    <button className="link" onClick={() => setPage(`dog:${d.id}`)}>
                      {d.status === 'adoptable' ? 'View adoption profile →' : 'View record →'}
                    </button>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="empty">No dogs in this shelter yet. Use "+ Add Shelter Dog" or receive transfers from hospitals.</div>
          )}
        </div>
      )}
    </div>
  );
}
