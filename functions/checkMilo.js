const admin = require('firebase-admin');
process.env.FIRESTORE_EMULATOR_HOST = "127.0.0.1:8080";
admin.initializeApp({ projectId: "demo-project" });

async function checkMilo() {
  const db = admin.firestore();
  const snap = await db.collection('Dogs').where('name', '==', 'Milo').get();
  if (snap.empty) {
    console.log('Milo not found in database!');
  } else {
    snap.forEach(doc => {
      console.log('Milo found:', doc.id, doc.data());
    });
  }
}

checkMilo();
