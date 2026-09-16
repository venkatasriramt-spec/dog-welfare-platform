import React, { useState, useRef } from 'react';
import { BREED_OPTIONS, GENDER_OPTIONS } from '../constants';
import { updateDogRecord, uploadImage } from '../services';

export default function EditProfileForm({ dog, onUpdated }) {
  const [name, setName] = useState(dog.name || '');
  const [estimatedAge, setEstimatedAge] = useState(dog.estimated_age || '');
  const [breed, setBreed] = useState(dog.breed || '');
  const [gender, setGender] = useState(dog.gender || '');

  const [socialPhotos, setSocialPhotos] = useState(dog.social_photos || []);
  const [videos, setVideos] = useState(dog.videos || []);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fileInputRef = useRef(null);
  const isSubmitting = useRef(false);

  const handleMediaChange = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    setLoading(true);
    setError('');
    try {
      const newPhotos = [...socialPhotos];
      const newVideos = [...videos];

      for (const file of files) {
        // We reuse uploadImage, which supports any file type based on file.type
        const url = await uploadImage(file, 'dog_photos');
        if (file.type.startsWith('video/')) {
          newVideos.push(url);
        } else {
          newPhotos.push(url);
        }
      }

      setSocialPhotos(newPhotos);
      setVideos(newVideos);
    } catch (err) {
      setError(err.message || 'Failed to upload media.');
    } finally {
      setLoading(false);
      // reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const removePhoto = (index) => {
    setSocialPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const removeVideo = (index) => {
    setVideos(prev => prev.filter((_, i) => i !== index));
  };

  const submit = async (e) => {
    e.preventDefault();
    if (isSubmitting.current) return;
    isSubmitting.current = true;
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await updateDogRecord({
        dogId: dog.id,
        name,
        estimated_age: estimatedAge,
        breed,
        gender,
        social_photos: socialPhotos,
        videos: videos,
        timeline_entry: {
          type: 'general',
          notes: 'Profile metadata and media updated by owner.'
        }
      });
      setSuccess('Profile updated successfully!');
      if (onUpdated) onUpdated();
    } catch (err) {
      setError(err.message || 'Failed to update profile.');
    } finally {
      setLoading(false);
      isSubmitting.current = false;
    }
  };

  return (
    <form onSubmit={submit} className="edit-profile-form">
      <div className="form-grid">
        <label>
          Dog Name
          <input required value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Bruno" />
        </label>
        <label>
          Estimated Age
          <input value={estimatedAge} onChange={e => setEstimatedAge(e.target.value)} placeholder="e.g. 2 years, 6 months" />
        </label>
        <label>
          Breed
          <select value={breed} onChange={e => setBreed(e.target.value)}>
            {BREED_OPTIONS.map(b => <option key={b} value={b}>{b}</option>)}
          </select>
        </label>
        <label>
          Gender
          <select value={gender} onChange={e => setGender(e.target.value)}>
            {GENDER_OPTIONS.map(g => <option key={g} value={g}>{g}</option>)}
          </select>
        </label>
      </div>

      <div style={{ marginTop: '20px' }}>
        <h4 style={{ marginBottom: '10px' }}>Media Gallery</h4>
        <p style={{ fontSize: '13px', color: 'var(--muted)', marginBottom: '16px' }}>
          Add or remove images and videos. Deleting them here will permanently remove them from the database and storage.
        </p>

        <label className="button outline" style={{ display: 'inline-block', cursor: 'pointer', marginBottom: '16px' }}>
          {loading ? 'Uploading...' : '📁 Upload Photos & Videos'}
          <input 
            type="file" 
            multiple 
            accept="image/*,video/*" 
            style={{ display: 'none' }} 
            ref={fileInputRef}
            onChange={handleMediaChange} 
            disabled={loading}
          />
        </label>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          {socialPhotos.map((url, i) => (
            <div key={url} style={{ position: 'relative', width: '100px', height: '100px' }}>
              <img src={url} alt="Dog photo" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '4px' }} />
              <button 
                type="button" 
                onClick={() => removePhoto(i)}
                style={{ position: 'absolute', top: '4px', right: '4px', background: 'rgba(0,0,0,0.6)', color: 'white', border: 'none', borderRadius: '50%', width: '20px', height: '20px', fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                ✕
              </button>
            </div>
          ))}
          {videos.map((url, i) => (
            <div key={url} style={{ position: 'relative', width: '100px', height: '100px' }}>
              <video src={url} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '4px' }} muted />
              <button 
                type="button" 
                onClick={() => removeVideo(i)}
                style={{ position: 'absolute', top: '4px', right: '4px', background: 'rgba(0,0,0,0.6)', color: 'white', border: 'none', borderRadius: '50%', width: '20px', height: '20px', fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                ✕
              </button>
              <span style={{ position: 'absolute', bottom: '4px', left: '4px', background: 'rgba(0,0,0,0.6)', color: 'white', fontSize: '10px', padding: '2px 4px', borderRadius: '2px' }}>
                VIDEO
              </span>
            </div>
          ))}
        </div>
      </div>

      {error && <p className="form-error" style={{ marginTop: '16px' }}>{error}</p>}
      {success && <div className="setup-link" style={{ color: '#45623d', background: '#e0ecd8', marginTop: '16px' }}><b>{success}</b></div>}

      <button className="primary" type="submit" disabled={loading} style={{ marginTop: '24px' }}>
        {loading ? 'Saving...' : 'Save Profile →'}
      </button>
    </form>
  );
}
