import React, { useState, useMemo, useEffect } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { uploadImage, deleteImage } from '../services';
import ParticleBackground from '../components/ParticleBackground';
import { useMediaViewer } from '../contexts/MediaViewerContext';

export default function OrgProfile({ session, organizations = [], setPage, orgId, isWorkspace }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [loading, setLoading] = useState(false);
  const { openMedia } = useMediaViewer();

  const org = useMemo(() => organizations.find(o => o.id === orgId), [organizations, orgId]);

  const role = session?.profile?.role;
  const userOrgId = session?.profile?.works_at;

  const canEdit = useMemo(() => {
    if (role === 'platform_admin') return true;
    if (userOrgId === orgId && (role === 'hospital_admin' || role === 'agency_admin')) return true;
    return false;
  }, [role, userOrgId, orgId]);

  useEffect(() => {
    if (isEditing && org) {
      setEditForm({
        phone: org.phone || '',
        email: org.email || '',
        address: org.address || '',
        description: org.description || '',
        website: org.website || '',
        operating_hours: org.operating_hours || '',
        services_offered: org.services_offered?.join(', ') || '',
        facebook: org.social_media?.facebook || '',
        instagram: org.social_media?.instagram || '',
        emergency_contact: org.emergency_contact || '',
        capacity: org.capacity || '',
        logoFile: null,
        existingLogo: org.logo_url || null,
        existingMedia: org.media_urls || [],
        newMediaFiles: []
      });
    }
  }, [isEditing, org]);

  const removeExistingMedia = (index) => {
    const updated = [...editForm.existingMedia];
    updated.splice(index, 1);
    setEditForm({ ...editForm, existingMedia: updated });
  };

  const removeNewMedia = (index) => {
    const updated = [...editForm.newMediaFiles];
    updated.splice(index, 1);
    setEditForm({ ...editForm, newMediaFiles: updated });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (!canEdit) {
        throw new Error('You do not have permission to edit this organization.');
      }
      const urlsToDelete = [];
      let logo_url = editForm.existingLogo;
      if (editForm.logoFile) {
        logo_url = await uploadImage(editForm.logoFile, `organization_media/${org.id}`);
        if (org.logo_url) urlsToDelete.push(org.logo_url);
      } else if (!editForm.existingLogo && org.logo_url) {
        urlsToDelete.push(org.logo_url);
        logo_url = null;
      }

      const deletedMediaUrls = org.media_urls?.filter(url => !editForm.existingMedia.includes(url)) || [];
      urlsToDelete.push(...deletedMediaUrls);

      let newMediaUrls = [...editForm.existingMedia];
      if (editForm.newMediaFiles && editForm.newMediaFiles.length > 0) {
        for (const file of editForm.newMediaFiles) {
          const url = await uploadImage(file, `organization_media/${org.id}`);
          newMediaUrls.push(url);
        }
      }

      const servicesArr = editForm.services_offered.split(',').map(s => s.trim()).filter(s => s);

      await updateDoc(doc(db, 'Organizations', org.id), {
        phone: editForm.phone.trim(),
        email: editForm.email.trim(),
        address: editForm.address.trim(),
        description: editForm.description.trim(),
        website: editForm.website.trim(),
        operating_hours: editForm.operating_hours.trim(),
        services_offered: servicesArr,
        social_media: {
          facebook: editForm.facebook.trim(),
          instagram: editForm.instagram.trim()
        },
        emergency_contact: editForm.emergency_contact.trim(),
        capacity: Number(editForm.capacity) || 0,
        logo_url,
        media_urls: newMediaUrls
      });

      for (const url of urlsToDelete) {
        await deleteImage(url).catch(console.error);
      }

      setIsEditing(false);
    } catch (err) {
      alert("Failed to update organization: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!org) {
    return (
      <section className={isWorkspace ? "workspace-page" : "page"}>
        <div style={{ textAlign: 'center', marginTop: '40px' }}>Organization not found.</div>
      </section>
    );
  }

  const defaultIcon = org.type === 'hospital' ? '🏥' : '🏡';
  const label = org.type === 'hospital' ? 'VETERINARY HOSPITAL' : 'ADOPTION AGENCY';

  return (
    <>
      {!isWorkspace && <ParticleBackground mode="subtle" colorScheme="warm" particleCount={40} />}
      <section className={isWorkspace ? "workspace-page profile-page" : "profile-page"}>
        <button className="back" onClick={() => setPage('partners')}>
          ← Back to partners
        </button>

        <div className="dog-profile-full" style={{ marginTop: '20px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', background: '#fff', border: '1px solid var(--line)', borderRadius: '12px', padding: '32px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                {org.logo_url ? (
                  <img src={org.logo_url} alt="Logo" onClick={() => openMedia([org.logo_url], 0)} style={{ width: '80px', height: '80px', borderRadius: '12px', objectFit: 'contain', background: 'var(--soft)', cursor: 'pointer', border: '1px solid var(--line)' }} />
                ) : (
                  <i style={{ fontStyle: 'normal', fontSize: '36px', background: 'var(--soft)', width: '80px', height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '12px', border: '1px solid var(--line)' }}>{defaultIcon}</i>
                )}
                <div>
                  <h1 style={{ margin: '0 0 8px', fontSize: '28px', color: 'var(--ink)' }}>{org.name}</h1>
                  <span style={{ fontSize: '12px', background: '#f1eee7', padding: '6px 10px', borderRadius: '15px', color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    {label}
                  </span>
                </div>
              </div>
              {canEdit && !isEditing && (
                <button className="outline" onClick={() => setIsEditing(true)} style={{ padding: '8px 16px' }}>
                  Edit Profile
                </button>
              )}
            </div>

            {isEditing ? (
              <form onSubmit={handleSave} style={{ background: '#fbfaf5', padding: '24px', borderRadius: '8px', border: '1px solid var(--line)', marginTop: '16px' }}>
                <h4 style={{ marginTop: 0, marginBottom: '20px', fontSize: '18px', color: 'var(--ink)' }}>Edit Organization Profile</h4>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--ink)', marginBottom: '6px' }}>Email Address</label>
                    <input type="email" value={editForm.email} onChange={e => setEditForm({ ...editForm, email: e.target.value })} required style={{ width: '100%', padding: '10px', border: '1px solid var(--line)', borderRadius: '4px' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--ink)', marginBottom: '6px' }}>Phone Number</label>
                    <input type="text" value={editForm.phone} onChange={e => setEditForm({ ...editForm, phone: e.target.value })} required style={{ width: '100%', padding: '10px', border: '1px solid var(--line)', borderRadius: '4px' }} />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--ink)', marginBottom: '6px' }}>Website</label>
                    <input type="url" placeholder="https://" value={editForm.website} onChange={e => setEditForm({ ...editForm, website: e.target.value })} style={{ width: '100%', padding: '10px', border: '1px solid var(--line)', borderRadius: '4px' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--ink)', marginBottom: '6px' }}>Operating Hours</label>
                    <input type="text" placeholder="Mon-Fri: 9am - 5pm" value={editForm.operating_hours} onChange={e => setEditForm({ ...editForm, operating_hours: e.target.value })} style={{ width: '100%', padding: '10px', border: '1px solid var(--line)', borderRadius: '4px' }} />
                  </div>
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--ink)', marginBottom: '6px' }}>Services Offered (comma separated)</label>
                  <input type="text" placeholder="Spay/Neuter, Vaccinations, Trauma" value={editForm.services_offered} onChange={e => setEditForm({ ...editForm, services_offered: e.target.value })} style={{ width: '100%', padding: '10px', border: '1px solid var(--line)', borderRadius: '4px' }} />
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--ink)', marginBottom: '6px' }}>About / Description</label>
                  <textarea value={editForm.description} onChange={e => setEditForm({ ...editForm, description: e.target.value })} rows={4} style={{ width: '100%', padding: '10px', border: '1px solid var(--line)', borderRadius: '4px', resize: 'vertical' }} />
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--ink)', marginBottom: '6px' }}>Physical Address</label>
                  <textarea value={editForm.address} onChange={e => setEditForm({ ...editForm, address: e.target.value })} required rows={2} style={{ width: '100%', padding: '10px', border: '1px solid var(--line)', borderRadius: '4px', resize: 'vertical' }} />
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--ink)', marginBottom: '12px' }}>Organization Logo</label>
                  <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                    {(editForm.logoFile || editForm.existingLogo) ? (
                      <div style={{ position: 'relative', width: '80px', height: '80px', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--line)' }}>
                        <img src={editForm.logoFile ? URL.createObjectURL(editForm.logoFile) : editForm.existingLogo} style={{ width: '100%', height: '100%', objectFit: 'contain', background: 'white' }} alt="Logo Preview" />
                        <button type="button" onClick={() => setEditForm({ ...editForm, logoFile: null, existingLogo: null })} style={{ position: 'absolute', top: '4px', right: '4px', background: 'rgba(0,0,0,0.6)', color: 'white', border: 'none', borderRadius: '50%', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 10, fontSize: '12px' }}>×</button>
                      </div>
                    ) : (
                      <div style={{ position: 'relative', display: 'inline-block' }}>
                        <input type="file" accept="image/*" onChange={e => setEditForm({ ...editForm, logoFile: e.target.files[0] })} style={{ opacity: 0, position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, cursor: 'pointer', zIndex: 2 }} />
                        <button type="button" className="outline" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: '30px' }}>
                          <span style={{ fontSize: '14px' }}>🖼️</span> Upload Logo
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div style={{ marginBottom: '24px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--ink)', marginBottom: '12px' }}>Upload Media Gallery (Photos/Videos)</label>
                  <div style={{ position: 'relative', display: 'inline-block', marginBottom: '16px' }}>
                    <input type="file" accept="image/*,video/*" multiple onChange={e => setEditForm({ ...editForm, newMediaFiles: [...editForm.newMediaFiles, ...Array.from(e.target.files)] })} style={{ opacity: 0, position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, cursor: 'pointer', zIndex: 2 }} />
                    <button type="button" className="outline" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: '30px' }}>
                      <span style={{ fontSize: '16px' }}>📁</span> Upload Photos & Videos
                    </button>
                  </div>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                    {editForm.existingMedia?.map((url, i) => (
                      <div key={`existing-${i}`} style={{ position: 'relative', width: '120px', height: '120px', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--line)' }}>
                        {url.includes('.mp4') || url.includes('.mov') || url.includes('.webm') || url.includes('video') ? (
                          <video src={url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <img src={url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Gallery" />
                        )}
                        <button type="button" onClick={() => removeExistingMedia(i)} style={{ position: 'absolute', top: '4px', right: '4px', background: 'rgba(0,0,0,0.6)', color: 'white', border: 'none', borderRadius: '50%', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 10 }}>×</button>
                      </div>
                    ))}

                    {editForm.newMediaFiles?.map((file, i) => {
                      const isVideo = file.type.startsWith('video/');
                      const objectUrl = URL.createObjectURL(file);
                      return (
                        <div key={`new-${i}`} style={{ position: 'relative', width: '120px', height: '120px', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--line)' }}>
                          {isVideo ? (
                            <video src={objectUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          ) : (
                            <img src={objectUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="New Gallery" />
                          )}
                          <button type="button" onClick={() => removeNewMedia(i)} style={{ position: 'absolute', top: '4px', right: '4px', background: 'rgba(0,0,0,0.6)', color: 'white', border: 'none', borderRadius: '50%', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 10 }}>×</button>
                          <span style={{ position: 'absolute', bottom: '4px', left: '4px', background: 'rgba(0,0,0,0.7)', color: 'white', fontSize: '10px', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold' }}>NEW</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                  <button type="submit" className="primary" disabled={loading} style={{ padding: '12px 24px' }}>{loading ? 'Saving...' : 'Save Profile'}</button>
                  <button type="button" className="outline" onClick={() => setIsEditing(false)} style={{ padding: '12px 24px' }}>Cancel</button>
                </div>
              </form>
            ) : (
              <>
                {org.description && (
                  <p style={{ fontSize: '15px', lineHeight: '1.7', color: 'var(--ink)', margin: 0, paddingBottom: '16px', borderBottom: '1px solid var(--line)' }}>
                    {org.description}
                  </p>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', background: 'var(--soft)', padding: '24px', borderRadius: '12px', fontSize: '14px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                      <span style={{ fontSize: '20px' }}>✉️</span>
                      <span>{org.email || '—'}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                      <span style={{ fontSize: '20px' }}>📞</span>
                      <span>{org.phone || '—'}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                      <span style={{ fontSize: '20px', marginTop: '2px' }}>📍</span>
                      <span style={{ lineHeight: '1.5' }}>{org.address || '—'}</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                      <span style={{ fontSize: '20px' }}>🌐</span>
                      {org.website ? <a href={org.website} target="_blank" rel="noreferrer" style={{ color: 'var(--orange)', textDecoration: 'none', fontWeight: 600 }}>Visit Website</a> : <span>—</span>}
                    </div>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                      <span style={{ fontSize: '20px' }}>🕒</span>
                      <span>{org.operating_hours || '—'}</span>
                    </div>
                  </div>
                </div>

                {org.services_offered && org.services_offered.length > 0 && (
                  <div style={{ marginTop: '8px' }}>
                    <h4 style={{ fontSize: '14px', color: 'var(--ink)', marginBottom: '12px' }}>Services Offered</h4>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                      {org.services_offered.map((s, i) => (
                        <span key={i} style={{ background: '#e3ece1', color: '#2a5a27', padding: '6px 14px', borderRadius: '20px', fontSize: '13px', fontWeight: 600 }}>
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {org.media_urls && org.media_urls.length > 0 && (
                  <div style={{ marginTop: '16px' }}>
                    <h4 style={{ fontSize: '14px', color: 'var(--ink)', marginBottom: '16px' }}>Media Gallery</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '12px' }}>
                      {org.media_urls.map((url, i) => {
                        const mediaItems = org.media_urls.map(u => ({
                          url: u,
                          type: u.includes('.mp4') || u.includes('.mov') || u.includes('.webm') || u.includes('video') ? 'video' : 'image'
                        }));
                        return url.includes('.mp4') || url.includes('.mov') || url.includes('.webm') || url.includes('video') ? (
                          <video key={i} src={url} controls onClick={(e) => { e.preventDefault(); openMedia(mediaItems, i); }} style={{ width: '100%', height: '160px', objectFit: 'cover', borderRadius: '8px', cursor: 'pointer' }} />
                        ) : (
                          <img key={i} src={url} alt={`Media ${i}`} onClick={() => openMedia(mediaItems, i)} style={{ width: '100%', height: '160px', objectFit: 'cover', borderRadius: '8px', cursor: 'pointer', border: '1px solid var(--line)' }} />
                        );
                      })}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
