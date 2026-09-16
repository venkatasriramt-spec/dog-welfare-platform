import React, { useEffect, useState, useRef } from 'react';
import { BREED_OPTIONS, DOG_STATUSES } from '../constants';
import { processAdoption, transferDog, updateDogRecord } from '../services';
import Confetti from './Confetti';
import EditProfileForm from './EditProfileForm';

export default function MedicalRecordForm({ dog, organizations = [], session, onUpdated }) {
  const role = session?.profile?.role;
  const orgId = session?.profile?.works_at;
  const isPlatformAdmin = role === 'platform_admin';
  const isHospitalAdmin = role === 'hospital_admin' || isPlatformAdmin;
  const isVet = role === 'veterinarian';
  const isAgencyAdmin = role === 'agency_admin' || isPlatformAdmin;
  const isAgencyEmployee = role === 'agency_employee';

  const isDogInMyHospital = isPlatformAdmin || (dog.hospital_id === orgId && (dog.status === 'in_treatment' || dog.status === 'fit_for_discharge'));
  const isDogInMyAgency = isPlatformAdmin || (dog.agency_id === orgId && dog.status === 'adoptable');

  const canEditMedicalRecord = (isHospitalAdmin || isVet) && isDogInMyHospital;
  const canUpdateAgencyRecord = (isAgencyAdmin || isAgencyEmployee) && isDogInMyAgency;

  let initialTab = '';
  if (isHospitalAdmin && dog.status === 'street') initialTab = 'admit';
  else if (canEditMedicalRecord || canUpdateAgencyRecord) initialTab = 'edit_profile';
  else if (isHospitalAdmin && (dog.status === 'in_treatment' || dog.status === 'fit_for_discharge')) initialTab = 'transfer';
  else if (isAgencyAdmin && dog.status === 'adoptable') initialTab = 'adopt';

  const [tab, setTab] = useState(initialTab);
  
  useEffect(() => {
    setTab(initialTab);
  }, [initialTab]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showConfetti, setShowConfetti] = useState(false);

  // Medical record form
  const [diagnosis, setDiagnosis] = useState('');
  const [prescription, setPrescription] = useState('');
  const [notes, setNotes] = useState('');
  const [updateVaccinated, setUpdateVaccinated] = useState(dog?.medical_status?.is_vaccinated || false);
  const [updateNeutered, setUpdateNeutered] = useState(dog?.medical_status?.is_neutered || false);
  const [updateBreed, setUpdateBreed] = useState(dog?.breed || 'Unknown / Unidentified');

  // Transfer form
  const [selectedAgency, setSelectedAgency] = useState('');

  // Discharge form
  const [dischargeStatus, setDischargeStatus] = useState('community_dog');

  // Adoption form
  const [adopterName, setAdopterName] = useState('');
  const [adopterEmail, setAdopterEmail] = useState('');
  const [adopterPhone, setAdopterPhone] = useState('');
  const [adopterAddress, setAdopterAddress] = useState('');
  const [adopterNotes, setAdopterNotes] = useState('');


  const agencies = organizations.filter(o => o.type === 'agency');

  const isSubmitting = useRef(false);

  const submitRecord = async e => {
    e.preventDefault();
    if (isSubmitting.current) return;
    if (!diagnosis.trim() && !prescription.trim() && !notes.trim()) {
      setError('Please provide at least a diagnosis, prescription, or clinical note.');
      return;
    }
    isSubmitting.current = true;
    setError(''); setSuccess(''); setLoading(true); setShowConfetti(false);
    try {
      await updateDogRecord({
        dogId: dog.id,
        is_vaccinated: updateVaccinated,
        is_neutered: updateNeutered,
        breed: updateBreed,
        timeline_entry: {
          type: 'treatment',
          diagnosis,
          prescription,
          notes,
        }
      });
      setSuccess('Medical record updated successfully.');
      setDiagnosis(''); setPrescription(''); setNotes('');
      if (onUpdated) onUpdated();
    } catch (err) {
      setError(err.message || 'Failed to update record.');
    } finally {
      setLoading(false);
      isSubmitting.current = false;
    }
  };

  const submitTransfer = async e => {
    e.preventDefault();
    if (isSubmitting.current) return;
    if (!selectedAgency) { setError('Please select an agency.'); return; }
    isSubmitting.current = true;
    setError(''); setSuccess(''); setLoading(true); setShowConfetti(false);
    try {
      await transferDog(dog.id, selectedAgency);
      setSuccess('Dog transferred to adoption agency successfully.');
      if (onUpdated) onUpdated();
    } catch (err) {
      setError(err.message || 'Failed to transfer dog.');
    } finally {
      setLoading(false);
      isSubmitting.current = false;
    }
  };

  const submitDischarge = async e => {
    e.preventDefault();
    if (isSubmitting.current) return;
    isSubmitting.current = true;
    setError(''); setSuccess(''); setLoading(true); setShowConfetti(false);
    try {
      await updateDogRecord({
        dogId: dog.id,
        status: dischargeStatus,
        timeline_entry: {
          type: 'discharge',
          notes: `Discharged with status: ${DOG_STATUSES[dischargeStatus] || dischargeStatus}`,
        }
      });
      setSuccess(`Dog discharged as "${DOG_STATUSES[dischargeStatus]}".`);
      if (onUpdated) onUpdated();
    } catch (err) {
      setError(err.message || 'Failed to discharge dog.');
    } finally {
      setLoading(false);
      isSubmitting.current = false;
    }
  };

  const submitAdoption = async e => {
    e.preventDefault();
    if (isSubmitting.current) return;
    isSubmitting.current = true;
    setError(''); setSuccess(''); setLoading(true);
    try {
      await processAdoption({
        dogId: dog.id,
        adopterName,
        email: adopterEmail,
        phone: adopterPhone,
        address: adopterAddress,
        notes: adopterNotes
      });
      setSuccess('Dog marked as adopted and details recorded! 🎉');
      setShowConfetti(true);
      if (onUpdated) onUpdated();
    } catch (err) {
      setError(err.message || 'Failed to mark adoption.');
    } finally {
      setLoading(false);
      isSubmitting.current = false;
    }
  };

  const submitAdmit = async e => {
    e.preventDefault();
    if (isSubmitting.current) return;
    isSubmitting.current = true;
    setError(''); setSuccess(''); setLoading(true); setShowConfetti(false);
    try {
      await updateDogRecord({
        dogId: dog.id,
        status: 'in_treatment',
        timeline_entry: {
          type: 'admission',
          notes: 'Dog admitted to hospital for treatment.',
        }
      });
      setSuccess('Dog admitted to your hospital.');
      if (onUpdated) onUpdated();
    } catch (err) {
      setError(err.message || 'Failed to admit dog.');
    } finally {
      setLoading(false);
      isSubmitting.current = false;
    }
  };

  const submitRelease = async e => {
    e.preventDefault();
    if (isSubmitting.current) return;
    isSubmitting.current = true;
    setError(''); setSuccess(''); setLoading(true); setShowConfetti(false);
    try {
      await updateDogRecord({
        dogId: dog.id,
        status: 'fit_for_discharge',
        timeline_entry: {
          type: 'medical',
          notes: 'Marked as Fit for Discharge / Transfer by veterinarian.',
        }
      });
      setSuccess('Dog marked as fit for discharge.');
      if (onUpdated) onUpdated();
    } catch (err) {
      setError(err.message || 'Failed to update status.');
    } finally {
      setLoading(false);
      isSubmitting.current = false;
    }
  };

  return (
    <div className="medical-record-form">
      <Confetti isActive={showConfetti} />
      {/* Action tabs based on role */}
      <div className="tabs" style={{ marginTop: '10px', marginBottom: '20px' }}>
        {(isHospitalAdmin || isVet) && (
          <>
            {canEditMedicalRecord && (
              <>
                <button className={tab === 'edit_profile' ? 'selected' : ''} onClick={() => { setTab('edit_profile'); setError(''); setSuccess(''); }}>
                  ✏️ Edit Profile
                </button>
                <button className={tab === 'record' ? 'selected' : ''} onClick={() => { setTab('record'); setError(''); setSuccess(''); }}>
                  🩺 Add Medical Record
                </button>
              </>
            )}
            {isHospitalAdmin && dog.status === 'street' && (
              <button className={tab === 'admit' ? 'selected' : ''} onClick={() => { setTab('admit'); setError(''); setSuccess(''); }}>
                🏥 Admit to Hospital
              </button>
            )}
            {isHospitalAdmin && (dog.status === 'in_treatment' || dog.status === 'fit_for_discharge') && (
              <>
                <button className={tab === 'transfer' ? 'selected' : ''} onClick={() => { setTab('transfer'); setError(''); setSuccess(''); }}>
                  🏡 Transfer to Agency
                </button>
                <button className={tab === 'discharge' ? 'selected' : ''} onClick={() => { setTab('discharge'); setError(''); setSuccess(''); }}>
                  🌳 Discharge
                </button>
              </>
            )}
            {isVet && dog.status === 'in_treatment' && canEditMedicalRecord && (
              <button className={tab === 'release' ? 'selected' : ''} onClick={() => { setTab('release'); setError(''); setSuccess(''); }}>
                🩺 Mark Fit for Discharge
              </button>
            )}
          </>
        )}
        {(isAgencyAdmin || isAgencyEmployee) && (
          <>
            {canUpdateAgencyRecord && (
              <>
                <button className={tab === 'edit_profile' ? 'selected' : ''} onClick={() => { setTab('edit_profile'); setError(''); setSuccess(''); }}>
                  ✏️ Edit Profile
                </button>
                <button className={tab === 'record' ? 'selected' : ''} onClick={() => { setTab('record'); setError(''); setSuccess(''); }}>
                  📝 Update Record
                </button>
              </>
            )}
            {isAgencyAdmin && dog.status === 'adoptable' && canUpdateAgencyRecord && (
              <button className={tab === 'adopt' ? 'selected' : ''} onClick={() => { setTab('adopt'); setError(''); setSuccess(''); }}>
                ❤️ Mark as Adopted
              </button>
            )}
          </>
        )}
      </div>

      {/* Edit Profile Tab */}
      {tab === 'edit_profile' && (
        <EditProfileForm dog={dog} onUpdated={onUpdated} />
      )}

      {/* Medical Record Tab */}
      {tab === 'record' && (
        <form onSubmit={submitRecord}>
          <div className="form-grid">
            <label>
              Breed Assessment
              <select value={updateBreed} onChange={e => setUpdateBreed(e.target.value)}>
                {BREED_OPTIONS.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </label>
            <div style={{ display: 'flex', gap: '20px', alignItems: 'end', paddingBottom: '8px' }}>
              <label className="checkbox-label">
                <input type="checkbox" checked={updateVaccinated} onChange={e => setUpdateVaccinated(e.target.checked)} />
                Vaccinated
              </label>
              <label className="checkbox-label">
                <input type="checkbox" checked={updateNeutered} onChange={e => setUpdateNeutered(e.target.checked)} />
                Neutered
              </label>
            </div>
          </div>
          <label>
            Diagnosis
            <input value={diagnosis} onChange={e => setDiagnosis(e.target.value)} placeholder="e.g. Dermatitis, Fracture, Malnutrition..." />
          </label>
          <label>
            Prescription / Treatment
            <input value={prescription} onChange={e => setPrescription(e.target.value)} placeholder="e.g. Amoxicillin 250mg, Wound dressing..." />
          </label>
          <label>
            Clinical Notes
            <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Additional observations, progress notes..." />
          </label>
          <button className="primary" type="submit" disabled={loading || !!success}>{loading ? 'Saving...' : 'Save Medical Record →'}</button>
        </form>
      )}

      {/* Admit to Hospital Tab */}
      {tab === 'admit' && isHospitalAdmin && (
        <div>
          <p style={{ color: 'var(--muted)', fontSize: '14px', marginBottom: '16px' }}>
            Admitting <strong>{dog.name}</strong> (currently on street) to your hospital for treatment.
          </p>
          <button className="primary" onClick={submitAdmit} disabled={loading || !!success}>
            {loading ? 'Admitting...' : '🏥 Confirm Admission →'}
          </button>
        </div>
      )}

      {/* Medical Release Tab */}
      {tab === 'release' && isVet && (
        <div>
          <p style={{ color: 'var(--muted)', fontSize: '14px', marginBottom: '16px' }}>
            Mark <strong>{dog.name}</strong> as <strong>Fit for Discharge</strong>. This will notify the hospital administrator to formally discharge or transfer the dog.
          </p>
          <button className="primary" onClick={submitRelease} disabled={loading || !!success}>
            {loading ? 'Processing...' : '🩺 Mark Fit for Discharge →'}
          </button>
        </div>
      )}

      {/* Transfer to Agency Tab */}
      {tab === 'transfer' && isHospitalAdmin && (
        <form onSubmit={submitTransfer}>
          <p style={{ color: 'var(--muted)', fontSize: '14px', marginBottom: '16px' }}>
            Transfer <strong>{dog.name}</strong> to an adoption agency after treatment is complete.
          </p>
          <label>
            Select Adoption Agency *
            <select required value={selectedAgency} onChange={e => setSelectedAgency(e.target.value)}>
              <option value="">— Choose an agency —</option>
              {agencies.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
          </label>
          {agencies.length === 0 && (
            <p style={{ color: '#c0392b', fontSize: '13px' }}>No adoption agencies are registered yet.</p>
          )}
          <button className="primary" type="submit" disabled={loading || !selectedAgency || !!success}>
            {loading ? 'Transferring...' : '🏡 Transfer to Agency →'}
          </button>
        </form>
      )}

      {/* Discharge Tab */}
      {tab === 'discharge' && isHospitalAdmin && (
        <form onSubmit={submitDischarge}>
          <p style={{ color: 'var(--muted)', fontSize: '14px', marginBottom: '16px' }}>
            Discharge <strong>{dog.name}</strong> from the hospital and release them back to their community territory (ABC/ARV Protocol).
          </p>
          <button className="primary" type="submit" disabled={loading || !!success}>
            {loading ? 'Discharging...' : '🌳 Confirm Release to Community →'}
          </button>
        </form>
      )}

      {/* Mark as Adopted Tab */}
      {tab === 'adopt' && isAgencyAdmin && (
        <form onSubmit={submitAdoption}>
          <p style={{ color: 'var(--muted)', fontSize: '14px', marginBottom: '16px' }}>
            Enter the details of the adopter. This information is kept strictly <strong>private</strong> and is only visible to your agency and platform administrators.
          </p>
          <label>
            Adopter Name *
            <input required value={adopterName} onChange={e => setAdopterName(e.target.value)} placeholder="Full Name" />
          </label>
          <div className="form-grid">
            <label>
              Email Address
              <input type="email" value={adopterEmail} onChange={e => setAdopterEmail(e.target.value)} placeholder="email@example.com" />
            </label>
            <label>
              Phone Number
              <input type="tel" value={adopterPhone} onChange={e => setAdopterPhone(e.target.value)} placeholder="+91 98765 43210" />
            </label>
          </div>
          <label>
            Residential Address
            <textarea value={adopterAddress} onChange={e => setAdopterAddress(e.target.value)} placeholder="Full address of the new home..." />
          </label>
          <label>
            Adoption Notes
            <textarea value={adopterNotes} onChange={e => setAdopterNotes(e.target.value)} placeholder="e.g. Family has a large fenced yard, previous dog owner..." />
          </label>
          <button className="primary" type="submit" disabled={loading || !adopterName || !!success}>
            {loading ? 'Processing...' : '❤️ Finalize Adoption →'}
          </button>
        </form>
      )}

      {error && <p className="form-error" style={{ marginTop: '12px' }}>{error}</p>}
      {success && <div className="setup-link" style={{ color: '#45623d', background: '#e0ecd8', marginTop: '12px' }}><b>{success}</b></div>}
    </div>
  );
}
