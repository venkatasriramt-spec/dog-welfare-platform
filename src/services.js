import { createUserWithEmailAndPassword, onAuthStateChanged, signInWithEmailAndPassword, signOut, updateProfile } from 'firebase/auth';
import { addDoc, collection, doc, getDoc, onSnapshot, orderBy, query, serverTimestamp, setDoc, where } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { getDownloadURL, ref, uploadBytes, deleteObject } from 'firebase/storage';
import { auth, db, firebaseEnabled, functions, storage } from './firebase';

const needFirebase = () => { if (!firebaseEnabled || !auth || !db) throw new Error('Firebase is not configured. Check your .env file and restart Vite.'); };
const mapDocs = snapshot => snapshot.docs.map(item => ({ id: item.id, ...item.data() }));

export function watchSession(callback) {
  if (!firebaseEnabled || !auth || !db) return () => callback({ user: null, profile: null, loading: false });

  let unsubscribeProfile = null;

  const unsubscribeAuth = onAuthStateChanged(auth, async user => {
    if (unsubscribeProfile) {
      unsubscribeProfile();
      unsubscribeProfile = null;
    }

    if (!user) {
      return callback({ user: null, profile: null, loading: false });
    }

    const profileRef = doc(db, 'Users', user.uid);
    const snap = await getDoc(profileRef);
    if (!snap.exists()) {
      await setDoc(profileRef, {
        full_name: user.displayName || (user.email ? user.email.split('@')[0] : 'User'),
        email: user.email,
        role: user.email?.trim().toLowerCase() === 'admin@pawpath.demo' ? 'platform_admin' : 'community_member',
        is_active: true,
        created_at: serverTimestamp(),
      }, { merge: true });
    }

    unsubscribeProfile = onSnapshot(profileRef, docSnap => {
      const profile = docSnap.exists() ? docSnap.data() : null;
      callback({ user, profile, loading: false });
    }, err => {
      console.warn('Profile snapshot listener error:', err);
      callback({ user, profile: null, loading: false });
    });
  });

  return () => {
    if (unsubscribeProfile) unsubscribeProfile();
    unsubscribeAuth();
  };
}


export async function registerCommunity({ name, email, password }) {
  needFirebase();
  const result = await createUserWithEmailAndPassword(auth, email.trim(), password);
  await updateProfile(result.user, { displayName: name.trim() });
  try {
    if (functions) {
      const call = httpsCallable(functions, 'createCommunityProfile');
      await call({ name: name.trim() });
    } else {
      await setDoc(doc(db, 'Users', result.user.uid), { full_name: name.trim(), email: result.user.email, role: 'community_member', is_active: true, created_at: serverTimestamp() });
    }
  } catch {
    await setDoc(doc(db, 'Users', result.user.uid), { full_name: name.trim(), email: result.user.email, role: 'community_member', is_active: true, created_at: serverTimestamp() }).catch(() => {});
  }
}


export async function registerPartner({ organization_name, type, contact_name, contact_email, password, phone, address }) {
  needFirebase();
  if (!functions) throw new Error('Cloud Functions is not available.');
  const result = await createUserWithEmailAndPassword(auth, contact_email.trim(), password);
  try {
    await updateProfile(result.user, { displayName: contact_name.trim() });
    const call = httpsCallable(functions, 'createPartnerApplication');
    await call({ organization_name, type, contact_name, phone, address });
  } catch (err) {
    await signOut(auth);
    throw err;
  }
}

export async function login({ email, password }) { needFirebase(); await signInWithEmailAndPassword(auth, email.trim(), password); }
export async function logout() { if (auth) await signOut(auth); }

export async function uploadImage(file, folder = 'dog_photos') {
  needFirebase();
  if (!storage) throw new Error('Cloud Storage is not available.');
  if (!file) return null;
  
  const ext = file.name.split('.').pop();
  const fileName = `${folder}/${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${ext}`;
  const storageRef = ref(storage, fileName);
  
  const metadata = { contentType: file.type };
  await uploadBytes(storageRef, file, metadata);
  return getDownloadURL(storageRef);
}

export async function deleteImage(url) {
  if (!url || !storage) return;
  let loggedUrl = url.substring(0, 50) + '...'; // fallback truncated url
  try {
    const match = url.match(/\/o\/(.+?)\?/);
    if (match && match[1]) {
      const filePath = decodeURIComponent(match[1]);
      loggedUrl = filePath;
      if (filePath.startsWith('dog_photos/') || filePath.startsWith('dog_media/')) {
        const fileRef = ref(storage, filePath);
        await deleteObject(fileRef);
      }
    }
  } catch (error) {
    console.warn('Failed to delete orphaned image from storage', loggedUrl, error);
  }
}

// --- Accounts & Orgs ---
export function watchDogs(callback) {
  if (!db) return () => callback([]);
  return onSnapshot(
    query(collection(db, 'Dogs'), orderBy('created_at', 'desc')),
    snap => {
      console.log('[watchDogs] Received', snap.docs.length, 'dogs');
      callback(mapDocs(snap));
    },
    err => {
      console.error('[watchDogs] Firestore error:', err.code, err.message);
      callback([]);
    }
  );
}

export function watchOrgDogs(orgId, orgType, callback) {
  if (!db || !orgId) return () => callback([]);
  const field = orgType === 'hospital' ? 'hospital_id' : 'agency_id';
  return onSnapshot(
    query(collection(db, 'Dogs'), where(field, '==', orgId)),
    snap => callback(mapDocs(snap)),
    () => callback([])
  );
}

// --- Organization watchers ---
export function watchOrganizations(callback) {
  if (!db) return () => callback([]);
  return onSnapshot(
    collection(db, 'Organizations'),
    snap => {
      console.log('[watchOrganizations] Received', snap.docs.length, 'organizations');
      callback(mapDocs(snap));
    },
    err => {
      console.error('[watchOrganizations] Firestore error:', err.code, err.message);
      callback([]);
    }
  );
}

export function watchApplications(callback) {
  if (!db) return () => callback([]);
  return onSnapshot(
    query(collection(db, 'OrganizationApplications'), where('status', '==', 'pending')),
    snap => callback(mapDocs(snap)),
    () => callback([])
  );
}

// --- Application actions ---
export async function submitApplication(data, uid) {
  needFirebase();
  return addDoc(collection(db, 'OrganizationApplications'), {
    organization_name: data.organization_name.trim(), type: data.type,
    contact_name: data.contact_name.trim(), contact_email: data.contact_email.trim().toLowerCase(),
    phone: data.phone.trim(), address: data.address.trim(),
    creator_uid: uid, status: 'pending', created_at: serverTimestamp()
  });
}

export async function approveApplication(applicationId) {
  needFirebase();
  if (!functions) throw new Error('Cloud Functions is not available.');
  const call = httpsCallable(functions, 'approveOrganizationApplication');
  return call({ applicationId });
}

export async function declineApplication(applicationId, reason = '') {
  needFirebase();
  if (!functions) throw new Error('Cloud Functions is not available.');
  const call = httpsCallable(functions, 'declineOrganizationApplication');
  return call({ applicationId, reason });
}

// --- Dog report (community sighting — simple) ---
export async function reportDog(data, uid) {
  needFirebase();
  if (!functions) throw new Error('Cloud Functions is not available.');
  const call = httpsCallable(functions, 'registerDog');
  return call({
    name: data.name.trim(),
    breed: data.breed || 'Unknown / Unidentified',
    estimated_age: data.estimated_age || 'Unknown',
    gender: data.gender || 'Unknown',
    location_found: data.location.trim(),
    description: data.description.trim(),
    condition_notes: data.condition_notes || '',
    social_photos: data.social_photos || [],
    videos: data.videos || [],
    is_vaccinated: false,
    is_neutered: false,
  });
}

// --- Dog registration (hospital/agency admission — full form) ---
export async function registerDog(data) {
  needFirebase();
  if (!functions) throw new Error('Cloud Functions is not available.');
  const call = httpsCallable(functions, 'registerDog');
  return call(data);
}

// --- Dog record update (medical records, status changes) ---
export async function updateDogRecord(data) {
  needFirebase();
  if (!functions) throw new Error('Cloud Functions is not available.');
  const call = httpsCallable(functions, 'updateDogRecord');
  return call(data);
}

// --- Dog transfer (hospital → agency) ---
export async function transferDog(dogId, agencyId) {
  needFirebase();
  if (!functions) throw new Error('Cloud Functions is not available.');
  const call = httpsCallable(functions, 'transferDog');
  return call({ dogId, agencyId });
}

// --- Process Adoption ---
export async function processAdoption(data) {
  needFirebase();
  if (!functions) throw new Error('Cloud Functions is not available.');
  const call = httpsCallable(functions, 'processAdoption');
  return call(data);
}

// --- Staff management ---
export async function addOrgStaff({ name, email, password, title }) {
  needFirebase();
  if (!functions) throw new Error('Cloud Functions is not available.');
  const call = httpsCallable(functions, 'addOrgStaff');
  return call({ name, email, password, title });
}

export function watchOrgStaff(organizationId, callback) {
  if (!db || !organizationId) return () => callback([]);
  return onSnapshot(
    query(collection(db, 'Users'), where('works_at', '==', organizationId)),
    snap => callback(mapDocs(snap)),
    () => callback([])
  );
}
