import React, { useEffect, useMemo, useState } from 'react';
import DogRegistrationForm from '../../components/DogRegistrationForm';
import StaffManager from '../../components/StaffManager';
import { DOG_STATUSES } from '../../constants';
import { watchOrgDogs } from '../../services';

export default function HospitalDashboard({ session, dogs = [], organizations = [], setPage }) {
  const [tab, setTab] = useState('overview');
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

  return (
    <div className="hospital-dashboard">
      <div className="hospital-header" style={{ marginBottom: '24px' }}>
        <p className="eyebrow">— HOSPITAL WORKSPACE</p>
        <h2>{currentOrg?.name || 'Veterinary Hospital & Clinic'}</h2>
        <p className="lead" style={{ fontSize: '15px' }}>
          Coordinate care, manage medical records, and onboard your team of veterinarians and doctors.
        </p>
      </div>

      {/* Sub-navigation tabs */}
      <div className="tabs" style={{ marginTop: '20px', marginBottom: '30px' }}>
        <button className={tab === 'overview' ? 'selected' : ''} onClick={() => setTab('overview')}>
          📊 Overview
        </button>
        <button className={tab === 'doctors' ? 'selected' : ''} onClick={() => setTab('doctors')}>
          👨‍⚕️ Doctors & Staff
        </button>
        <button className={tab === 'queue' ? 'selected' : ''} onClick={() => setTab('queue')}>
          🚨 Incoming Queue ({streetDogs.length})
        </button>
        <button className={tab === 'active' ? 'selected' : ''} onClick={() => setTab('active')}>
          🩺 Active Patients ({activePatients.length})
        </button>
        <button className={tab === 'ready' ? 'selected' : ''} onClick={() => setTab('ready')}>
          🏡 Ready to Leave ({readyToLeave.length})
        </button>
      </div>

      {/* Overview Tab */}
      {tab === 'overview' && (
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

      {/* Doctors Tab */}
      {tab === 'doctors' && (
        <StaffManager
          organizationId={userOrgId}
          roleType="hospital_admin"
          orgName={currentOrg?.name}
        />
      )}

      {/* Active Patients Tab */}
      {tab === 'active' && (
        <div className="hospital-patients">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <h3>Active Patients</h3>
              <p className="lead" style={{ fontSize: '14px', margin: 0 }}>
                Dogs currently admitted at your hospital for treatment.
              </p>
            </div>
          </div>

          {activePatients.length > 0 ? (
            <div className="dog-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
              {activePatients.map(d => (
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
                    <p>{d.breed || 'Breed pending'} · {d.gender || ''}</p>
                    <button className="link" onClick={() => setPage(`dog:${d.id}`)}>
                      View full record →
                    </button>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="empty">No active patients currently.</div>
          )}
        </div>
      )}

      {/* Ready to Leave Tab */}
      {tab === 'ready' && (
        <div className="hospital-patients">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <h3>Ready to Leave</h3>
              <p className="lead" style={{ fontSize: '14px', margin: 0 }}>
                Dogs marked as "Fit for Discharge" by a veterinarian. Awaiting administrative transfer or release.
              </p>
            </div>
          </div>

          {readyToLeave.length > 0 ? (
            <div className="dog-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
              {readyToLeave.map(d => (
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
                    <p>{d.breed || 'Breed pending'} · {d.gender || ''}</p>
                    <button className="link" onClick={() => setPage(`dog:${d.id}`)}>
                      Process Discharge / Transfer →
                    </button>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="empty">No dogs are currently waiting to leave.</div>
          )}
        </div>
      )}

      {/* Incoming Queue Tab */}
      {tab === 'queue' && (
        <div className="hospital-network">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <h3>Incoming Queue (Street Dogs)</h3>
              <p className="lead" style={{ fontSize: '14px', margin: 0 }}>
                Dogs reported by community members awaiting rescue or hospital admission.
              </p>
            </div>
            <button className="primary" onClick={() => setShowAdmitForm(!showAdmitForm)}>
              {showAdmitForm ? '✕ Close' : '+ Register Walk-in Patient'}
            </button>
          </div>

          {showAdmitForm && (
            <div style={{ background: '#fff', padding: '24px', borderRadius: '6px', border: '1px solid var(--line)', marginBottom: '24px' }}>
              <DogRegistrationForm
                contextLabel="Admit Walk-in Dog to Hospital"
                onDogRegistered={() => setShowAdmitForm(false)}
              />
            </div>
          )}

          {streetDogs.length > 0 ? (
            <div className="dog-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
              {streetDogs.map(d => (
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
          ) : (
            <div className="empty">No street dogs awaiting rescue in the network.</div>
          )}
        </div>
      )}
    </div>
  );
}
