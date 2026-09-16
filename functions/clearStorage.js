const admin = require('firebase-admin');
admin.initializeApp();

async function clearStorage() {
  const bucket = admin.storage().bucket('dog-welfare-platform.firebasestorage.app');
  console.log('Clearing bucket:', bucket.name);
  try {
    await bucket.deleteFiles({ prefix: '' });
    console.log('All files deleted.');
  } catch (err) {
    console.error('Error deleting files:', err);
  }
}

clearStorage();
