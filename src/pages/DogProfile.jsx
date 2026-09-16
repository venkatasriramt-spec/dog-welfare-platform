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

  const timelineEvents = useMemo(() => {
    const events = [];
    if (dog?.description) {
      events.push({
        type: 'report',
        notes: dog.description,
        date: dog?.created_at || null,
        recorded_by_name: dog?.registered_by_name || 'Community Member'
      });
    }
    if (dog?.treatment_timeline?.length > 0) {
      events.push(...dog.treatment_timeline);
    }
    return events;
  }, [dog]);

  return (
    <>
      {!isWorkspace && <ParticleBackground mode="subtle" colorScheme="warm" particleCount={40} />}
      <section className={isWorkspace ? "workspace-page profile-page" : "profile-page"}>
        <button className="back" onClick={() => setPage(isWorkspace ? 'dashboard' : 'discover')}>
          {isWorkspace ? '← Back to dashboard' : '← Back to discover'}
        </button>
        {dog ? (
          <div className="dog-profile-full">
            {/* Header Section */}
            <div className="dog-profile-hero-card">
              <div className="dog-profile-hero-image-area">
                {dog.social_photos && dog.social_photos.length > 0 ? (
                  <>
                    <div className="dog-hero-blur-bg" style={{ backgroundImage: `url(${dog.social_photos[0]})` }} />
                    <img src={dog.social_photos[0]} alt={dog.name} className="dog-hero-img" />
                  </>
                ) : (
                  <div className="dog-hero-placeholder">🐾</div>
                )}
                
                {/* Badges top-left */}
                <div className="dog-hero-badges">
                  <span className={`status ${dog.status}`}>{statusLabel}</span>
                  {dog.tag && <span className="dog-tag">{dog.tag}</span>}
                </div>

                {/* Name bottom-right */}
                <h1 className="dog-hero-name">{dog.name}</h1>
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

            {/* Media Gallery */}
            {((dog.social_photos && dog.social_photos.length > 0) || (dog.videos && dog.videos.length > 0)) && (
              <div className="media-gallery-section" style={{ marginTop: '32px' }}>
                <h3>📸 Media Gallery</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px', marginTop: '16px' }}>
                  {dog.social_photos?.map((url, idx) => (
                    <div key={idx} style={{ borderRadius: '8px', overflow: 'hidden', aspectRatio: '1/1' }}>
                      <img src={url} alt={`${dog.name} photo ${idx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" />
                    </div>
                  ))}
                  {dog.videos?.map((url, idx) => (
                    <div key={idx} style={{ borderRadius: '8px', overflow: 'hidden', aspectRatio: '1/1', position: 'relative' }}>
                      <video src={url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} controls preload="none" />
                      <span style={{ position: 'absolute', top: '8px', left: '8px', background: 'rgba(0,0,0,0.6)', color: 'white', fontSize: '12px', padding: '4px 8px', borderRadius: '4px' }}>VIDEO</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Treatment Timeline */}
            {timelineEvents.length > 0 && (
              <div className="timeline-section">
                <h3>📋 Treatment Timeline</h3>
                <div className="timeline">
                  {timelineEvents.map((entry, idx) => (
                    <div className="timeline-entry" key={idx}>
                      <div className="timeline-dot" />
                      <div className="timeline-content">
                        <div className="timeline-header">
                          <span className={`timeline-type ${entry.type}`}>
                            {entry.type === 'report' ? '🚨 Reported' :
                             entry.type === 'admission' ? '🏥 Admission' :
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
