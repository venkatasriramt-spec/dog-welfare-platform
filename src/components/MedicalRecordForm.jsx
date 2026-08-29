import React, { useState } from 'react';
import { BREED_OPTIONS, DOG_STATUSES } from '../constants';
import { transferDog, updateDogRecord } from '../services';
import Confetti from './Confetti';

export default function MedicalRecordForm({ dog, organizations = [], session, onUpdated }) {
  const [tab, setTab] = useState('record'); // 'record', 'transfer', 'discharge'
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

  const role = session?.profile?.role;
  const isHospitalStaff = role === 'hospital_admin' || role === 'veterinarian';
  const isAgencyStaff = role === 'agency_admin' || role === 'agency_employee';
  const agencies = organizations.filter(o => o.type === 'agency');

  const submitRecord = async e => {
    e.preventDefault();
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
    }
  };

  const submitTransfer = async e => {
    e.preventDefault();
    if (!selectedAgency) { setError('Please select an agency.'); return; }
    setError(''); setSuccess(''); setLoading(true); setShowConfetti(false);
    try {
      await transferDog(dog.id, selectedAgency);
      setSuccess('Dog transferred to adoption agency successfully.');
      if (onUpdated) onUpdated();
    } catch (err) {
      setError(err.message || 'Failed to transfer dog.');
    } finally {
      setLoading(false);
    }
  };

  const submitDischarge = async e => {
    e.preventDefault();
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
    }
  };

  const submitAdoption = async e => {
    e.preventDefault();
    setError(''); setSuccess(''); setLoading(true);
    try {
      await updateDogRecord({
        dogId: dog.id,
        status: 'adopted',
        timeline_entry: {
          type: 'adoption',
          notes: 'Dog has been adopted and found a forever home!',
        }
      });
      setSuccess('Dog marked as adopted! 🎉');
      setShowConfetti(true);
      if (onUpdated) onUpdated();
    } catch (err) {
      setError(err.message || 'Failed to mark adoption.');
    } finally {
      setLoading(false);
    }
  };

  const submitAdmit = async e => {
    e.preventDefault();
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
    }
  };

  return (
    <div className="medical-record-form">
      <Confetti isActive={showConfetti} />
      {/* Action tabs based on role */}
      <div className="tabs" style={{ marginTop: '10px', marginBottom: '20px' }}>
        {(isHospitalStaff || role === 'platform_admin') && (
          <>
            <button className={tab === 'record' ? 'selected' : ''} onClick={() => { setTab('record'); setError(''); setSuccess(''); }}>
              🩺 Add Medical Record
            </button>
            {dog.status === 'street' && (
              <button className={tab === 'admit' ? 'selected' : ''} onClick={() => { setTab('admit'); setError(''); setSuccess(''); }}>
                🏥 Admit to Hospital
              </button>
            )}
            {(dog.status === 'in_treatment') && (
              <>
                <button className={tab === 'transfer' ? 'selected' : ''} onClick={() => { setTab('transfer'); setError(''); setSuccess(''); }}>
                  🏡 Transfer to Agency
                </button>
                <button className={tab === 'discharge' ? 'selected' : ''} onClick={() => { setTab('discharge'); setError(''); setSuccess(''); }}>
                  🌳 Discharge
                </button>
              </>
            )}
          </>
        )}
        {isAgencyStaff && (
          <>
            <button className={tab === 'record' ? 'selected' : ''} onClick={() => { setTab('record'); setError(''); setSuccess(''); }}>
              📝 Update Record
            </button>
            {dog.status === 'adoptable' && (
              <button className={tab === 'adopt' ? 'selected' : ''} onClick={() => { setTab('adopt'); setError(''); setSuccess(''); }}>
                ❤️ Mark as Adopted
              </button>
            )}
          </>
        )}
      </div>

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
          <button className="primary" type="submit" disabled={loading}>{loading ? 'Saving...' : 'Save Medical Record →'}</button>
        </form>
      )}

      {/* Admit to Hospital Tab */}
      {tab === 'admit' && isHospitalStaff && (
        <div>
          <p style={{ color: 'var(--muted)', fontSize: '14px', marginBottom: '16px' }}>
            Admitting <strong>{dog.name}</strong> (currently on street) to your hospital for treatment.
          </p>
          <button className="primary" onClick={submitAdmit} disabled={loading}>
            {loading ? 'Admitting...' : '🏥 Confirm Admission →'}
          </button>
        </div>
      )}

      {/* Transfer to Agency Tab */}
      {tab === 'transfer' && isHospitalStaff && (
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
          <button className="primary" type="submit" disabled={loading || !selectedAgency}>
            {loading ? 'Transferring...' : '🏡 Transfer to Agency →'}
          </button>
        </form>
      )}

      {/* Discharge Tab */}
      {tab === 'discharge' && isHospitalStaff && (
        <form onSubmit={submitDischarge}>
          <p style={{ color: 'var(--muted)', fontSize: '14px', marginBottom: '16px' }}>
            Discharge <strong>{dog.name}</strong> from the hospital after treatment.
          </p>
          <label>
            Discharge Pathway *
            <select value={dischargeStatus} onChange={e => setDischargeStatus(e.target.value)}>
              <option value="community_dog">🌳 Release to Community (ABC/ARV Protocol)</option>
              <option value="adoptable">🏡 Available for Adoption</option>
            </select>
          </label>
          <button className="primary" type="submit" disabled={loading}>
            {loading ? 'Discharging...' : 'Confirm Discharge →'}
          </button>
        </form>
      )}

      {/* Mark as Adopted Tab */}
      {tab === 'adopt' && isAgencyStaff && (
        <div>
          <p style={{ color: 'var(--muted)', fontSize: '14px', marginBottom: '16px' }}>
            Mark <strong>{dog.name}</strong> as adopted. This means the dog has found a forever home!
          </p>
          <button className="primary" onClick={submitAdoption} disabled={loading}>
            {loading ? 'Updating...' : '❤️ Confirm Adoption →'}
          </button>
        </div>
      )}

      {error && <p className="form-error" style={{ marginTop: '12px' }}>{error}</p>}
      {success && <div className="setup-link" style={{ color: '#45623d', background: '#e0ecd8', marginTop: '12px' }}><b>{success}</b></div>}
    </div>
  );
}
