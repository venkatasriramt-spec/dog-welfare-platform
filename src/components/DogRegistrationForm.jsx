import React, { useState, useRef } from 'react';
import { BREED_OPTIONS, GENDER_OPTIONS, emptyDogForm } from '../constants';
import { registerDog, uploadImage } from '../services';

export default function DogRegistrationForm({ onDogRegistered, contextLabel }) {
  const [form, setForm] = useState({ ...emptyDogForm });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [mediaFiles, setMediaFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);

  const set = (key, value) => setForm(prev => ({ ...prev, [key]: value }));

  const handleMediaChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length) {
      setMediaFiles(files);
      const urls = files.map(file => URL.createObjectURL(file));
      setPreviewUrls(urls);
    }
  };

  const isSubmitting = useRef(false);

  const submit = async e => {
    e.preventDefault();
    if (isSubmitting.current) return;
    isSubmitting.current = true;
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const social_photos = [];
      const videos = [];
      if (mediaFiles.length) {
        for (const file of mediaFiles) {
          const url = await uploadImage(file, 'dog_photos');
          if (file.type.startsWith('video/')) {
            videos.push(url);
          } else {
            social_photos.push(url);
          }
        }
      }

      const result = await registerDog({
        name: form.name,
        breed: form.breed,
        estimated_age: form.estimated_age,
        gender: form.gender,
        location_found: form.location_found,
        description: form.description,
        condition_notes: form.condition_notes,
        social_photos: social_photos,
        videos: videos,
        is_vaccinated: form.is_vaccinated,
        is_neutered: form.is_neutered,
      });

      const tag = result?.data?.tag || 'Registered';
      setSuccess(`Dog registered successfully! Tag: ${tag}`);
      setForm({ ...emptyDogForm });
      setMediaFiles([]);
      setPreviewUrls([]);
      if (onDogRegistered) onDogRegistered(result?.data);
    } catch (err) {
      setError(err.message || 'Failed to register dog.');
    } finally {
      setLoading(false);
      isSubmitting.current = false;
    }
  };

  return (
    <div className="dog-registration-form">
      <h3>+ {contextLabel || 'Register New Dog'}</h3>
      <p style={{ color: 'var(--muted)', fontSize: '14px', marginBottom: '20px' }}>
        Fill in the details below to add a dog to the system. All fields marked with * are required.
      </p>

      <form onSubmit={submit}>
        <div className="form-grid">
          <label>
            Dog name / Identifier *
            <input
              required
              value={form.name}
              onChange={e => set('name', e.target.value)}
              placeholder="e.g. Bruno, Spotted Dog near Park"
            />
          </label>

          <label>
            Breed
            <select value={form.breed} onChange={e => set('breed', e.target.value)}>
              {BREED_OPTIONS.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
          </label>

          <label>
            Estimated Age
            <input
              value={form.estimated_age}
              onChange={e => set('estimated_age', e.target.value)}
              placeholder="e.g. 2 years, 6 months, Puppy"
            />
          </label>

          <label>
            Gender
            <select value={form.gender} onChange={e => set('gender', e.target.value)}>
              {GENDER_OPTIONS.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </label>
        </div>

        <label>
          Location found / Origin *
          <input
            required
            value={form.location_found}
            onChange={e => set('location_found', e.target.value)}
            placeholder="e.g. HSR Layout Sector 2, near bus stop"
          />
        </label>

        <label>
          Description / Notes
          <textarea
            value={form.description}
            onChange={e => set('description', e.target.value)}
            placeholder="Describe the dog's appearance, temperament, or any distinguishing features..."
          />
        </label>

        <label>
          Condition / Admission Notes
          <textarea
            value={form.condition_notes}
            onChange={e => set('condition_notes', e.target.value)}
            placeholder="Initial health assessment, injuries observed, reason for admission..."
          />
        </label>

        <div className="form-grid" style={{ marginTop: '12px' }}>
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={form.is_vaccinated}
              onChange={e => set('is_vaccinated', e.target.checked)}
            />
            Vaccinated (Rabies / 7-in-1)
          </label>
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={form.is_neutered}
              onChange={e => set('is_neutered', e.target.checked)}
            />
            Neutered / Spayed
          </label>
        </div>

        <label style={{ marginTop: '16px' }}>
          Upload Photos & Videos (Optional)
          <input type="file" multiple accept="image/*,video/*" onChange={handleMediaChange} style={{ padding: '8px' }} />
        </label>

        {previewUrls.length > 0 && (
          <div style={{ marginBottom: '15px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {previewUrls.map((url, i) => (
              mediaFiles[i]?.type.startsWith('video/') ? (
                <video key={url} src={url} style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '5px', border: '1px solid var(--line)' }} muted />
              ) : (
                <img key={url} src={url} alt="Preview" style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '5px', border: '1px solid var(--line)' }} />
              )
            ))}
          </div>
        )}

        {error && <p className="form-error">{error}</p>}
        {success && <div className="setup-link" style={{ color: '#45623d', background: '#e0ecd8' }}><b>{success}</b></div>}

        <button className="primary" type="submit" disabled={loading} style={{ marginTop: '20px' }}>
          {loading ? 'Registering...' : 'Register Dog →'}
        </button>
      </form>
    </div>
  );
}
