#!/usr/bin/env node

/**
 * Grant Firebase Custom Claim admin=true (or role) to a user by email
 * Usage: node scripts/set-admin-claim.js <email> [role]
 */

const { initializeApp, applicationDefault, cert, getApps } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');

function requireEnv(name) {
  const val = process.env[name];
  if (!val) {
    console.error(`Missing env var: ${name}`);
    process.exit(1);
  }
  return val;
}

(async () => {
  try {
    if (!getApps().length) {
      initializeApp({
        credential: cert({
          projectId: requireEnv('FIREBASE_PROJECT_ID'),
          clientEmail: requireEnv('FIREBASE_CLIENT_EMAIL'),
          privateKey: requireEnv('FIREBASE_PRIVATE_KEY').replace(/\\n/g, '\n'),
        }),
      });
    }

    const email = process.argv[2];
    const role = process.argv[3] || 'admin';
    if (!email) {
      console.error('Usage: node scripts/set-admin-claim.js <email> [role]');
      process.exit(1);
    }

    const userRecord = await getAuth().getUserByEmail(email);
    const claims = role ? { role, admin: role === 'admin' || role === 'super_admin' } : { admin: true };
    await getAuth().setCustomUserClaims(userRecord.uid, claims);

    console.log(`✅ Set custom claims for ${email}:`, claims);
    console.log('Note: User must re-login for claims to take effect.');
  } catch (err) {
    console.error('❌ Failed to set admin claim:', err.message);
    process.exit(1);
  }
})();

