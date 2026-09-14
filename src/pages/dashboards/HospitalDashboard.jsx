import React, { useEffect, useMemo, useState } from 'react';
import DogRegistrationForm from '../../components/DogRegistrationForm';
import StaffManager from '../../components/StaffManager';
import { DOG_STATUSES } from '../../constants';
import { watchOrgDogs } from '../../services';

export default function HospitalDashboard({ session, dogs = [], organizations = [], setPage, currentTab = 'overview' }) {
  const [showAdmitForm, setShowAdmitForm] = useState(false);
  const userOrgId = session.profile?.works_at;
  const currentOrg = useMemo(() => organizations.find(o => o.id === userOrgId), [organizations, userOrgId]);

  // Dogs belonging to this hospital
  const [orgDogs, setOrgDogs] = useState([]);
  useEffect(() => {
    if (!userOrgId) return;
    return watchOrgDogs(userOrgId, 'hospital', setOrgDogs);
  }, [userOrgId]);

  const activePatients = useMemo(() => orgDogs.filter(d => d.status === 'in_treatment'), [orgDogs]);
  const readyToLeave = useMemo(() => orgDogs.filter(d => d.status === 'fit_for_discharge'), [orgDogs]);
  const discharged = useMemo(() => orgDogs.filter(d => d.status !== 'in_treatment' && d.status !== 'fit_for_discharge' && d.status !== 'street'), [orgDogs]);

  // Also show street dogs from the network that can be admitted
  const streetDogs = useMemo(() => dogs.filter(d => d.status === 'street'), [dogs]);

  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 6;
  
  useEffect(() => {
    setSearchQuery('');
    setCurrentPage(1);
  }, [currentTab]);

  const filteredActive = useMemo(() => {
    if (!searchQuery.trim()) return activePatients;
    const q = searchQuery.toLowerCase();
    return activePatients.filter(d => 
      `${d.name} ${d.breed || ''} ${d.tag || ''}`.toLowerCase().includes(q)
    );
  }, [activePatients, searchQuery]);

  const paginatedActive = useMemo(() => {
    return filteredActive.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  }, [filteredActive, currentPage]);

  const filteredReady = useMemo(() => {
    if (!searchQuery.trim()) return readyToLeave;
    const q = searchQuery.toLowerCase();
    return readyToLeave.filter(d => 
      `${d.name} ${d.breed || ''} ${d.tag || ''}`.toLowerCase().includes(q)
    );
  }, [readyToLeave, searchQuery]);

  const paginatedReady = useMemo(() => {
    return filteredReady.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  }, [filteredReady, currentPage]);

  const filteredQueue = useMemo(() => {
    if (!searchQuery.trim()) return streetDogs;
    const q = searchQuery.toLowerCase();
    return streetDogs.filter(d => 
      `${d.name} ${d.location || ''} ${d.registered_by_name || ''} ${d.tag || ''}`.toLowerCase().includes(q)
    );
  }, [streetDogs, searchQuery]);

  const paginatedQueue = useMemo(() => {
    return filteredQueue.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  }, [filteredQueue, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  return (
    <div className="hospital-dashboard">
      <div className="hospital-header" style={{ marginBottom: '24px' }}>
        <p className="eyebrow">— HOSPITAL WORKSPACE</p>
        <h2>{currentOrg?.name || 'Veterinary Hospital & Clinic'}</h2>
        <p className="lead" style={{ fontSize: '15px' }}>
          Coordinate care, manage medical records, and onboard your team of veterinarians and doctors.
        </p>
      </div>

      {/* Overview Tab */}
      {currentTab === 'overview' && (
        <div className="hospital-overview">
          <div className="metrics" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
            <article>
              <b>{orgDogs.length}</b>
              <span>Total Hospital Dogs</span>
            </article>
            <article>
              <b>{activePatients.length}</b>
              <span>Currently In Treatment</span>
            </article>
            <article>
              <b>{discharged.length}</b>
              <span>Discharged / Transferred</span>
            </article>
            <article>
              <b>{streetDogs.length}</b>
              <span>Street Dogs (Network)</span>
            </article>
          </div>

          <div style={{ background: '#fff', padding: '24px', borderRadius: '6px', border: '1px solid var(--line)', marginTop: '24px' }}>
            <h3 style={{ margin: '0 0 12px 0' }}>Hospital Details</h3>
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

      {currentTab === 'doctors' && (
        <StaffManager
          organizationId={userOrgId}
          roleType="hospital_admin"
          orgName={currentOrg?.name}
        />
      )}

      {currentTab === 'active' && (
        <div className="hospital-patients">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <h3>Active Patients</h3>
              <p className="lead" style={{ fontSize: '14px', margin: 0 }}>
                Dogs currently admitted at your hospital for treatment.
              </p>
            </div>
            <input 
              type="text" 
              placeholder="Search active patients..." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{ width: '250px' }}
            />
          </div>

          {filteredActive.length > 0 ? (
            <>
              <div className="dog-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                {paginatedActive.map(d => (
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
                        View full record →
                      </button>
                    </div>
                  </article>
                ))}
              </div>
              {Math.ceil(filteredActive.length / PAGE_SIZE) > 1 && (
                <div className="pagination" style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '24px' }}>
                  <button 
                    className="outline" 
                    disabled={currentPage === 1} 
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  >
                    ← Previous
                  </button>
                  <span style={{ padding: '8px 12px', fontSize: '14px', color: 'var(--muted)' }}>
                    Page {currentPage} of {Math.ceil(filteredActive.length / PAGE_SIZE)}
                  </span>
                  <button 
                    className="outline" 
                    disabled={currentPage === Math.ceil(filteredActive.length / PAGE_SIZE)} 
                    onClick={() => setCurrentPage(p => Math.min(Math.ceil(filteredActive.length / PAGE_SIZE), p + 1))}
                  >
                    Next →
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="empty">
              {searchQuery ? 'No active patients match your search.' : 'No active patients currently.'}
            </div>
          )}
        </div>
      )}

      {currentTab === 'ready' && (
        <div className="hospital-patients">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <h3>Ready to Leave</h3>
              <p className="lead" style={{ fontSize: '14px', margin: 0 }}>
                Dogs marked as "Fit for Discharge" by a veterinarian. Awaiting administrative transfer or release.
              </p>
            </div>
            <input 
              type="text" 
              placeholder="Search ready dogs..." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{ width: '250px' }}
            />
          </div>

          {filteredReady.length > 0 ? (
            <>
              <div className="dog-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                {paginatedReady.map(d => (
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
                        Process Discharge / Transfer →
                      </button>
                    </div>
                  </article>
                ))}
              </div>
              {Math.ceil(filteredReady.length / PAGE_SIZE) > 1 && (
                <div className="pagination" style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '24px' }}>
                  <button 
                    className="outline" 
                    disabled={currentPage === 1} 
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  >
                    ← Previous
                  </button>
                  <span style={{ padding: '8px 12px', fontSize: '14px', color: 'var(--muted)' }}>
                    Page {currentPage} of {Math.ceil(filteredReady.length / PAGE_SIZE)}
                  </span>
                  <button 
                    className="outline" 
                    disabled={currentPage === Math.ceil(filteredReady.length / PAGE_SIZE)} 
                    onClick={() => setCurrentPage(p => Math.min(Math.ceil(filteredReady.length / PAGE_SIZE), p + 1))}
                  >
                    Next →
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="empty">
              {searchQuery ? 'No dogs match your search.' : 'No dogs are currently waiting to leave.'}
            </div>
          )}
        </div>
      )}

      {currentTab === 'queue' && (
        <div className="hospital-network">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <h3>Incoming Queue (Street Dogs)</h3>
              <p className="lead" style={{ fontSize: '14px', margin: 0 }}>
                Dogs reported by community members awaiting rescue or hospital admission.
              </p>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <input 
                type="text" 
                placeholder="Search queue..." 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{ width: '200px' }}
              />
              <button className="primary" onClick={() => setShowAdmitForm(!showAdmitForm)}>
                {showAdmitForm ? '✕ Close' : '+ Register Walk-in Patient'}
              </button>
            </div>
          </div>

          {showAdmitForm && (
            <div style={{ background: '#fff', padding: '24px', borderRadius: '6px', border: '1px solid var(--line)', marginBottom: '24px' }}>
              <DogRegistrationForm
                contextLabel="Admit Walk-in Dog to Hospital"
                onDogRegistered={() => setShowAdmitForm(false)}
              />
            </div>
          )}

          {filteredQueue.length > 0 ? (
            <>
              <div className="dog-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                {paginatedQueue.map(d => (
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
                      <p>{d.location || 'Location unknown'}</p>
                      <p style={{ fontSize: '12px', color: 'var(--muted)' }}>
                        Reported by: {d.registered_by_name || 'Community Member'}
                      </p>
                      <button className="link" onClick={() => setPage(`dog:${d.id}`)}>
                        View & Admit →
                      </button>
                    </div>
                  </article>
                ))}
              </div>
              {Math.ceil(filteredQueue.length / PAGE_SIZE) > 1 && (
                <div className="pagination" style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '24px' }}>
                  <button 
                    className="outline" 
                    disabled={currentPage === 1} 
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  >
                    ← Previous
                  </button>
                  <span style={{ padding: '8px 12px', fontSize: '14px', color: 'var(--muted)' }}>
                    Page {currentPage} of {Math.ceil(filteredQueue.length / PAGE_SIZE)}
                  </span>
                  <button 
                    className="outline" 
                    disabled={currentPage === Math.ceil(filteredQueue.length / PAGE_SIZE)} 
                    onClick={() => setCurrentPage(p => Math.min(Math.ceil(filteredQueue.length / PAGE_SIZE), p + 1))}
                  >
                    Next →
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="empty">
              {searchQuery ? 'No street dogs match your search.' : 'No street dogs awaiting rescue in the network.'}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
