import React, { useMemo } from 'react';
import MedicalRecordForm from '../components/MedicalRecordForm';
import { DOG_STATUSES } from '../constants';
import ParticleBackground from '../components/ParticleBackground';

export default function DogProfile({ dog, setPage, session, organizations = [], isWorkspace }) {
  const role = session?.profile?.role;
  const canEdit = ['platform_admin', 'hospital_admin', 'veterinarian', 'agency_admin', 'agency_employee'].includes(role);

  // Resolve organization names from IDs
  const hospitalName = useMemo(() => {
    if (!dog?.hospital_id) return null;
    const org = organizations.find(o => o.id === dog.hospital_id);
    return org?.name || 'Hospital';
  }, [dog?.hospital_id, organizations]);

  const agencyName = useMemo(() => {
    if (!dog?.agency_id) return null;
    const org = organizations.find(o => o.id === dog.agency_id);
    return org?.name || 'Agency';
  }, [dog?.agency_id, organizations]);

  const hospitalHistory = useMemo(() => {
    if (!dog?.hospital_history?.length) return [];
    return dog.hospital_history.map(hId => {
      const org = organizations.find(o => o.id === hId);
      return org?.name || hId;
    });
  }, [dog?.hospital_history, organizations]);

  const statusLabel = DOG_STATUSES[dog?.status] || dog?.status || 'Unknown';

  const formatDate = dateStr => {
    if (!dateStr) return '';
    try {
      return new Date(dateStr).toLocaleDateString('en-IN', {
        day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
      });
    } catch { return dateStr; }
  };

  return (
    <>
      {!isWorkspace && <ParticleBackground mode="subtle" colorScheme="warm" particleCount={40} />}
      <section className={isWorkspace ? "workspace-page profile-page" : "profile-page"}>
        <button className="back" onClick={() => setPage('discover')}>
          ← Back to discover
        </button>
        {dog ? (
          <div className="dog-profile-full">
            {/* Header Section */}
            <div className="dog-profile-header">
              {dog.social_photos && dog.social_photos.length > 0 ? (
                <img src={dog.social_photos[0]} alt={dog.name} className="dog-profile-art" style={{ objectFit: 'cover' }} />
              ) : (
                <div className="dog-profile-art">🐾</div>
              )}
              <div className="dog-profile-info">
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                  <span className={`status ${dog.status}`}>{statusLabel}</span>
                  {dog.tag && <span className="dog-tag">{dog.tag}</span>}
                </div>
                <h1>{dog.name}</h1>
                {dog.description && <p className="lead">{dog.description}</p>}
              </div>
            </div>

            {/* Identity & Details Grid */}
            <div className="dog-details-grid">
              <div className="detail-card">
                <h3>🏷️ Identity</h3>
                <dl className="detail-list">
                  <div><dt>Tag ID</dt><dd>{dog.tag || 'Not assigned'}</dd></div>
                  <div><dt>Breed</dt><dd>{dog.breed || 'Pending assessment'}</dd></div>
                  <div><dt>Estimated Age</dt><dd>{dog.estimated_age || 'Unknown'}</dd></div>
                  <div><dt>Gender</dt><dd>{dog.gender || 'Unknown'}</dd></div>
                  <div><dt>Location Found</dt><dd>{dog.location_found || dog.location || 'N/A'}</dd></div>
                </dl>
              </div>

              <div className="detail-card">
                <h3>🩺 Medical Status</h3>
                <dl className="detail-list">
                  <div>
                    <dt>Vaccination</dt>
                    <dd>{dog.medical_status?.is_vaccinated ? '✅ Vaccinated' : '❌ Not vaccinated'}</dd>
                  </div>
                  <div>
                    <dt>Neutered / Spayed</dt>
                    <dd>{dog.medical_status?.is_neutered ? '✅ Neutered' : '❌ Not neutered'}</dd>
                  </div>
                  <div>
                    <dt>Current Status</dt>
                    <dd><strong>{statusLabel}</strong></dd>
                  </div>
                </dl>
              </div>

              <div className="detail-card">
                <h3>📍 Provenance</h3>
                <dl className="detail-list">
                  <div><dt>Reported / Registered by</dt><dd>{dog.registered_by_name || 'Unknown'}</dd></div>
                  {hospitalName && <div><dt>Current Hospital</dt><dd>{hospitalName}</dd></div>}
                  {agencyName && <div><dt>Managing Agency</dt><dd>{agencyName}</dd></div>}
                  {hospitalHistory.length > 0 && (
                    <div>
                      <dt>Hospital History</dt>
                      <dd>{hospitalHistory.join(' → ')}</dd>
                    </div>
                  )}
                </dl>
              </div>
            </div>

            {/* Treatment Timeline */}
            {dog.treatment_timeline?.length > 0 && (
              <div className="timeline-section">
                <h3>📋 Treatment Timeline</h3>
                <div className="timeline">
                  {dog.treatment_timeline.map((entry, idx) => (
                    <div className="timeline-entry" key={idx}>
                      <div className="timeline-dot" />
                      <div className="timeline-content">
                        <div className="timeline-header">
                          <span className={`timeline-type ${entry.type}`}>
                            {entry.type === 'admission' ? '🏥 Admission' :
                             entry.type === 'treatment' ? '💊 Treatment' :
                             entry.type === 'transfer' ? '🏡 Transfer' :
                             entry.type === 'discharge' ? '🌳 Discharge' :
                             entry.type === 'adoption' ? '❤️ Adoption' :
                             '📝 Update'}
                          </span>
                          <small>{formatDate(entry.date)}</small>
                        </div>
                        {entry.diagnosis && <p><strong>Diagnosis:</strong> {entry.diagnosis}</p>}
                        {entry.prescription && <p><strong>Prescription:</strong> {entry.prescription}</p>}
                        {entry.notes && <p>{entry.notes}</p>}
                        <small style={{ color: 'var(--muted)' }}>— {entry.recorded_by_name || 'Staff'}</small>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Panel (role-based) */}
            {canEdit && (
              <div className="action-panel">
                <h3>⚡ Actions</h3>
                <MedicalRecordForm
                  dog={dog}
                  organizations={organizations}
                  session={session}
                />
              </div>
            )}
          </div>
        ) : (
          <div className="empty">Dog record not found.</div>
        )}
      </section>
    </>
  );
}
