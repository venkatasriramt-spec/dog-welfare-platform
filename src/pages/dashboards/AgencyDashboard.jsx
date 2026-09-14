import React, { useEffect, useMemo, useState } from 'react';
import DogRegistrationForm from '../../components/DogRegistrationForm';
import StaffManager from '../../components/StaffManager';
import { DOG_STATUSES } from '../../constants';
import { watchOrgDogs } from '../../services';

export default function AgencyDashboard({ session, dogs = [], organizations = [], setPage, currentTab = 'overview' }) {
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

  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 6;
  
  useEffect(() => {
    setSearchQuery('');
    setCurrentPage(1);
  }, [currentTab]);

  const filteredAdoptable = useMemo(() => {
    if (!searchQuery.trim()) return adoptableDogs;
    const q = searchQuery.toLowerCase();
    return adoptableDogs.filter(d => 
      `${d.name} ${d.breed || ''} ${d.tag || ''}`.toLowerCase().includes(q)
    );
  }, [adoptableDogs, searchQuery]);

  const paginatedAdoptable = useMemo(() => {
    return filteredAdoptable.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  }, [filteredAdoptable, currentPage]);

  const filteredAdopted = useMemo(() => {
    if (!searchQuery.trim()) return adoptedDogs;
    const q = searchQuery.toLowerCase();
    return adoptedDogs.filter(d => 
      `${d.name} ${d.breed || ''} ${d.tag || ''}`.toLowerCase().includes(q)
    );
  }, [adoptedDogs, searchQuery]);

  const paginatedAdopted = useMemo(() => {
    return filteredAdopted.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  }, [filteredAdopted, currentPage]);

  // Reset page to 1 when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  return (
    <div className="agency-dashboard">
      <div className="agency-header" style={{ marginBottom: '24px' }}>
        <p className="eyebrow">— ADOPTION AGENCY WORKSPACE</p>
        <h2>{currentOrg?.name || 'Rescue & Adoption Agency'}</h2>
        <p className="lead" style={{ fontSize: '15px' }}>
          Manage shelter dogs, onboard adoption coordinators & staff, and process adoptions.
        </p>
      </div>

      {/* Overview Tab */}
      {currentTab === 'overview' && (
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
      {currentTab === 'employees' && (
        <StaffManager
          organizationId={userOrgId}
          roleType="agency_admin"
          orgName={currentOrg?.name}
        />
      )}

      {/* Current Residents Tab */}
      {currentTab === 'residents' && (
        <div className="agency-shelter">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <h3>Current Residents</h3>
              <p className="lead" style={{ fontSize: '14px', margin: 0 }}>
                Dogs currently available for adoption at your agency.
              </p>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <input 
                type="text" 
                placeholder="Search dogs..." 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{ width: '200px' }}
              />
              <button className="primary" onClick={() => setShowAddForm(!showAddForm)}>
                {showAddForm ? '✕ Close' : '+ Register Walk-in Dog'}
              </button>
            </div>
          </div>

          {showAddForm && (
            <div style={{ background: '#fff', padding: '24px', borderRadius: '6px', border: '1px solid var(--line)', marginBottom: '24px' }}>
              <DogRegistrationForm
                contextLabel="Add Walk-in Dog to Agency"
                onDogRegistered={() => setShowAddForm(false)}
              />
            </div>
          )}

          {filteredAdoptable.length > 0 ? (
            <>
              <div className="dog-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                {paginatedAdoptable.map(d => (
                  <article className="dog-card" key={d.id} style={{ background: '#fff' }}>
                    {d.social_photos && d.social_photos.length > 0 ? (
                      <img src={d.social_photos[0]} alt={d.name} loading="lazy" />
                    ) : (
                      <div className="dog-placeholder">🐾</div>
                    )}
                    <span className={`status ${d.status}`}>{DOG_STATUSES[d.status] || d.status}</span>
                    <div style={{ padding: '16px' }}>
                      {d.tag && <small style={{ color: 'var(--orange)', fontWeight: 'bold' }}>{d.tag}</small>}
                      <h3>{d.name}</h3>
                      <p>{d.breed || 'Breed pending'} · {d.gender || ''} · {d.estimated_age || ''}</p>
                      <button className="link" onClick={() => setPage(`dog:${d.id}`)}>
                        View & Manage Adoption →
                      </button>
                    </div>
                  </article>
                ))}
              </div>
              {Math.ceil(filteredAdoptable.length / PAGE_SIZE) > 1 && (
                <div className="pagination" style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '24px' }}>
                  <button 
                    className="outline" 
                    disabled={currentPage === 1} 
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  >
                    ← Previous
                  </button>
                  <span style={{ padding: '8px 12px', fontSize: '14px', color: 'var(--muted)' }}>
                    Page {currentPage} of {Math.ceil(filteredAdoptable.length / PAGE_SIZE)}
                  </span>
                  <button 
                    className="outline" 
                    disabled={currentPage === Math.ceil(filteredAdoptable.length / PAGE_SIZE)} 
                    onClick={() => setCurrentPage(p => Math.min(Math.ceil(filteredAdoptable.length / PAGE_SIZE), p + 1))}
                  >
                    Next →
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="empty">
              {searchQuery ? 'No dogs match your search.' : 'No dogs currently available for adoption.'}
            </div>
          )}
        </div>
      )}

      {/* Adoption History Tab */}
      {currentTab === 'history' && (
        <div className="agency-shelter">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <h3>Adoption History</h3>
              <p className="lead" style={{ fontSize: '14px', margin: 0 }}>
                Dogs that have been successfully adopted from your agency.
              </p>
            </div>
            <input 
              type="text" 
              placeholder="Search adopted dogs..." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{ width: '250px' }}
            />
          </div>

          {filteredAdopted.length > 0 ? (
            <>
              <div className="dog-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                {paginatedAdopted.map(d => (
                  <article className="dog-card" key={d.id} style={{ background: '#fff' }}>
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
                        View Historical Record →
                      </button>
                    </div>
                  </article>
                ))}
              </div>
              {Math.ceil(filteredAdopted.length / PAGE_SIZE) > 1 && (
                <div className="pagination" style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '24px' }}>
                  <button 
                    className="outline" 
                    disabled={currentPage === 1} 
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  >
                    ← Previous
                  </button>
                  <span style={{ padding: '8px 12px', fontSize: '14px', color: 'var(--muted)' }}>
                    Page {currentPage} of {Math.ceil(filteredAdopted.length / PAGE_SIZE)}
                  </span>
                  <button 
                    className="outline" 
                    disabled={currentPage === Math.ceil(filteredAdopted.length / PAGE_SIZE)} 
                    onClick={() => setCurrentPage(p => Math.min(Math.ceil(filteredAdopted.length / PAGE_SIZE), p + 1))}
                  >
                    Next →
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="empty">
              {searchQuery ? 'No adopted dogs match your search.' : 'No adoption records found.'}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
