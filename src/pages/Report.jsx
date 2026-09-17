import React, { useState, useEffect } from 'react';
import { BREED_OPTIONS, GENDER_OPTIONS } from '../constants';
import { reportDog, uploadImage, deleteImage } from '../services';import Confetti from '../components/Confetti';
import ParticleBackground from '../components/ParticleBackground';

export default function Report({ session, setPage, isWorkspace }) {
  const [form, setForm] = useState({
    name: '',
    location: '',
    description: '',
    breed: 'Unknown / Unidentified',
    estimated_age: '',
    gender: 'Unknown',
    condition_notes: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [mediaFiles, setMediaFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    return () => previewUrls.forEach(url => URL.revokeObjectURL(url));
  }, [previewUrls]);

  const handleMediaChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length) {
      setMediaFiles(files);
      const urls = files.map(file => URL.createObjectURL(file));
      setPreviewUrls(urls);
    }
  };

  const set = (key, value) => setForm(prev => ({ ...prev, [key]: value }));

  const submit = async e => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const social_photos = [];
      const videos = [];
      const uploadedUrls = [];
      try {
        if (mediaFiles.length) {
          for (const file of mediaFiles) {
            const url = await uploadImage(file, 'dog_media');
            uploadedUrls.push(url);
            if (file.type.startsWith('video/')) {
              videos.push(url);
            } else {
              social_photos.push(url);
            }
          }
        }
        await reportDog({ ...form, social_photos, videos }, session.user.uid);
        setShowSuccess(true);
      } catch (innerErr) {
        if (uploadedUrls.length > 0) {
          await Promise.allSettled(uploadedUrls.map(url => deleteImage(url)));
        }
        throw innerErr;
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (showSuccess) {
    return (
      <section className={isWorkspace ? "workspace-page" : "page"} style={{ display: 'grid', placeItems: 'center', minHeight: '70vh' }}>
        <Confetti isActive={true} />
        <div className="success-panel" style={{ textAlign: 'center' }}>
          <div className="success-icon" style={{ margin: '0 auto 20px' }}>✓</div>
          <h2>Thank you for your report</h2>
          <p className="lead">Your report has been successfully submitted. Our network of partner hospitals and agencies has been notified.</p>
          <div className="success-actions" style={{ justifyContent: 'center', marginTop: '30px' }}>
            <button className="primary" onClick={() => setPage('discover')}>View discovered dogs</button>
            <button className="outline" onClick={() => {
              setForm({ name: '', location: '', description: '', breed: 'Unknown / Unidentified', estimated_age: '', gender: 'Unknown', condition_notes: '' });
              setMediaFiles([]);
              setPreviewUrls([]);
              setShowSuccess(false);
            }}>Report another</button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <>
      {!isWorkspace && <ParticleBackground mode="subtle" colorScheme="warm" particleCount={30} />}
      <section className={isWorkspace ? "workspace-page form-page" : "page form-page"}>
        <div className="form-page-layout">
          <div className="form-page-content">
            <p className="eyebrow">— COMMUNITY REPORT</p>
            <h2>Help a dog get <em>noticed.</em></h2>
            <form onSubmit={submit}>
            <label>
              Dog name or identifying detail *
              <input required value={form.name} onChange={e => set('name', e.target.value)}
                placeholder="e.g. Brown spotted dog, Limping puppy"
              />
            </label>
            <label>
              Last seen location *
              <input required value={form.location} onChange={e => set('location', e.target.value)}
                placeholder="e.g. HSR Layout Sector 2, near park"
              />
            </label>

            <div className="form-grid">
              <label>
                Breed (if known)
                <select value={form.breed} onChange={e => set('breed', e.target.value)}>
                  {BREED_OPTIONS.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
              </label>
              <label>
                Gender
                <select value={form.gender} onChange={e => set('gender', e.target.value)}>
                  {GENDER_OPTIONS.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </label>
            </div>

            <label>
              Estimated Age
              <input value={form.estimated_age} onChange={e => set('estimated_age', e.target.value)}
                placeholder="e.g. Puppy, ~2 years, Adult"
              />
            </label>

            <label>
              What did you observe? *
              <textarea required value={form.description} onChange={e => set('description', e.target.value)}
                placeholder="Describe the dog's condition, behaviour, and any distinguishing features..."
              />
            </label>

            <label>
              Condition notes (injuries, health concerns)
              <textarea value={form.condition_notes} onChange={e => set('condition_notes', e.target.value)}
                placeholder="Any visible injuries, limping, skin issues, signs of distress..."
              />
            </label>

            <label>
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

            <button className="primary" disabled={loading}>
              {loading ? 'Submitting...' : 'Submit report →'}
            </button>
          </form>
        </div>
        
        <div className="form-page-sidebar">
          <h3>Why report a dog?</h3>
          <p>
            Your reports directly notify nearby veterinary hospitals and rescue agencies. Our network relies on community observations to find street dogs that need urgent medical attention or a safe home.
          </p>
          <h3>What happens next?</h3>
          <p>
            Once you submit, partner organisations receive an immediate notification. If a hospital or agency admits the dog, they enter the PawPath tracking system, allowing you to track their journey to recovery and adoption.
          </p>
        </div>
      </div>
      </section>
    </>
  );
}
