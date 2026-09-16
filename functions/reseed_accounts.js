const orgs = [
  { id: 'citycare', name: 'CityCare Veterinary Hospital', type: 'hospital', email: 'citycare.admin@pawpath.demo', phone: '+91 98765 43210', address: '42 Indiranagar 100ft Road, Bengaluru' },
  { id: 'happytails', name: 'Happy Tails Rescue & Adoption', type: 'agency', email: 'happytails.admin@pawpath.demo', phone: '+91 91234 56789', address: '15 Koramangala 4th Block, Bengaluru' },
  { id: 'pawsclaws', name: 'Paws & Claws Specialty Clinic', type: 'hospital', email: 'pawsclaws.admin@pawpath.demo', phone: '+91 99887 76655', address: '88 HSR Layout Sector 2, Bengaluru' },
  { id: 'hopestreet', name: 'Hope Street Dog Sanctuary', type: 'agency', email: 'hopestreet.admin@pawpath.demo', phone: '+91 94567 89012', address: '7 Whitefield Main Road, Bengaluru' }
];

const usersData = [
  { email: 'admin@pawpath.demo', name: 'Platform Admin', role: 'platform_admin' },
  { email: 'citycare.admin@pawpath.demo', name: 'Dr. Vikram Malhotra', role: 'hospital_admin', works_at: 'citycare' },
  { email: 'sarah.vet@citycare.demo', name: 'Dr. Sarah Connor', role: 'veterinarian', works_at: 'citycare', title: 'Chief Veterinary Surgeon' },
  { email: 'rajesh.vet@citycare.demo', name: 'Dr. Rajesh Sharma', role: 'veterinarian', works_at: 'citycare', title: 'Vaccination & Emergency Specialist' },
  { email: 'happytails.admin@pawpath.demo', name: 'Ananya Roy', role: 'agency_admin', works_at: 'happytails' },
  { email: 'priya.staff@happytails.demo', name: 'Priya Patel', role: 'agency_employee', works_at: 'happytails', title: 'Senior Adoption Coordinator' },
  { email: 'alex.staff@happytails.demo', name: 'Alex Miller', role: 'agency_employee', works_at: 'happytails', title: 'Shelter Care Manager' },
  { email: 'pawsclaws.admin@pawpath.demo', name: 'Dr. Kavita Reddy', role: 'hospital_admin', works_at: 'pawsclaws' },
  { email: 'amit.vet@pawsclaws.demo', name: 'Dr. Amit Verma', role: 'veterinarian', works_at: 'pawsclaws', title: 'Canine Rehabilitation & Orthopedics' },
  { email: 'hopestreet.admin@pawpath.demo', name: 'Marcus Chen', role: 'agency_admin', works_at: 'hopestreet' },
  { email: 'maya.staff@hopestreet.demo', name: 'Maya Sen', role: 'agency_employee', works_at: 'hopestreet', title: 'Rescue Outreach Officer' },
  { email: 'rahul.community@pawpath.demo', name: 'Rahul Verma', role: 'community_member' }
];

module.exports = async function reseed(admin) {
  const db = admin.firestore();
  const auth = admin.auth();
  console.log('Re-seeding Organizations and Users...');
  
  // 1. Create Orgs
  for (const org of orgs) {
    await db.collection('Organizations').doc(org.id).set({
      name: org.name,
      type: org.type,
      email: org.email,
      phone: org.phone,
      address: org.address,
      status: 'approved',
      created_at: admin.firestore.FieldValue.serverTimestamp()
    });
    console.log('Created Organization:', org.name);
  }

  // 2. Map Users to Auth UIDs and recreate documents
  for (const u of usersData) {
    try {
      const userRecord = await auth.getUserByEmail(u.email);
      const uid = userRecord.uid;
      
      const userDoc = {
        email: u.email,
        full_name: u.name,
        role: u.role,
        is_active: true,
        created_at: admin.firestore.FieldValue.serverTimestamp()
      };
      
      if (u.works_at) userDoc.works_at = u.works_at;
      if (u.title) userDoc.title = u.title;
      
      await db.collection('Users').doc(uid).set(userDoc);
      console.log('Restored User:', u.name, '(', u.email, ') with UID:', uid);
      
      if (u.role === 'hospital_admin' || u.role === 'agency_admin') {
        await db.collection('Organizations').doc(u.works_at).update({ admin_uid: uid });
        console.log('Set admin_uid for', u.works_at, 'to', uid);
      }
    } catch (err) {
      if (err.code === 'auth/user-not-found') {
        console.log('Auth user not found for', u.email, '- recreating Auth user...');
        const newUser = await auth.createUser({
          email: u.email,
          password: u.email === 'admin@pawpath.demo' ? 'pawpath' : 'password123',
          displayName: u.name
        });
        const uid = newUser.uid;
        
        const userDoc = {
          email: u.email,
          full_name: u.name,
          role: u.role,
          is_active: true,
          created_at: admin.firestore.FieldValue.serverTimestamp()
        };
        if (u.works_at) userDoc.works_at = u.works_at;
        if (u.title) userDoc.title = u.title;
        
        await db.collection('Users').doc(uid).set(userDoc);
        console.log('Created and Restored User:', u.name);
        
        if (u.role === 'hospital_admin' || u.role === 'agency_admin') {
          await db.collection('Organizations').doc(u.works_at).update({ admin_uid: uid });
        }
      } else {
        console.error('Error for user', u.email, ':', err);
      }
    }
  }
  
  // Create Counter doc
  await db.collection('Counters').doc('dogs').set({ last_number: 1000 });
  console.log('Restored Counters/dogs');
  
  console.log('Reseed Complete!');
};
