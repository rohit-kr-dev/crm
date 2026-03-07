// scripts/createAdmin.js
// Creates your first Admin user in Firebase Auth + Firestore
// Run ONCE: node scripts/createAdmin.js

import { initializeApp, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth" ;
import { getFirestore, Timestamp } from "firebase-admin/firestore";
import fs from "fs";
const serviceAccount = JSON.parse(
  fs.readFileSync(new URL("./serviceAccountKey.json", import.meta.url))
);

initializeApp({
  credential: cert(serviceAccount)
});


const auth = getAuth();
const db = getFirestore();

// ── CHANGE THESE ────────────────────────────────────────────────────────────
const ADMIN_EMAIL = "admin@gmail.com";
const ADMIN_PASSWORD = "admin123";       // Change this immediately after first login!
const ADMIN_NAME = "Super Admin";
// ────────────────────────────────────────────────────────────────────────────

async function main() {
  console.log("🔐 Creating admin user...");

  try {
    // Create in Firebase Auth
    const user = await auth.createUser({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      displayName: ADMIN_NAME,
      emailVerified: true,
    });

    // Create profile in Firestore
    await db.collection("users").doc(user.uid).set({
      uid: user.uid,
      email: ADMIN_EMAIL,
      displayName: ADMIN_NAME,
      role: "Admin",
      isActive: true,
      loginAttempts: 0,
      lockedUntil: null,
      createdAt: Timestamp.now(),
      lastLogin: Timestamp.now(),
    });

    console.log("✅ Admin user created successfully!");
    console.log(`   Email:    ${ADMIN_EMAIL}`);
    console.log(`   Password: ${ADMIN_PASSWORD}`);
    console.log(`   UID:      ${user.uid}`);
    console.log("\n⚠️  IMPORTANT: Change the password immediately after first login!");
  } catch (err) {
    if (err.code === "auth/email-already-exists") {
      console.log("ℹ️  User already exists in Auth. Syncing Firestore profile...");
      const existing = await auth.getUserByEmail(ADMIN_EMAIL);
      await db.collection("users").doc(existing.uid).set({
        uid: existing.uid, email: ADMIN_EMAIL, displayName: ADMIN_NAME,
        role: "Admin", isActive: true, loginAttempts: 0, lockedUntil: null,
        createdAt: Timestamp.now(), lastLogin: Timestamp.now(),
      }, { merge: true });
      console.log("✅ Profile synced.");
    } else {
      console.error("❌ Failed:", err.message);
    }
  }
  process.exit(0);
}

main();