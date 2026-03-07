// scripts/seed.js
// Run: node scripts/seed.js

import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore, Timestamp } from "firebase-admin/firestore";
import fs from "fs";
const serviceAccount = JSON.parse(
  fs.readFileSync(new URL("./serviceAccountKey.json", import.meta.url))
);

initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();

const now = Timestamp.now();


// ─── SEED DATA ──────────────────────────────────────────────────────────────

const properties = [
  { name: "Prestige Lakeside Habitat", location: "Whitefield, Bengaluru", price: 12500000, type: "Residential", status: "available", createdAt: now },
  { name: "Brigade Utopia", location: "Krishnarajapura, Bengaluru", price: 8750000, type: "Residential", status: "available", createdAt: now },
  { name: "Sobha Dream Acres", location: "Panathur, Bengaluru", price: 6200000, type: "Residential", status: "sold", createdAt: now },
  { name: "Embassy TechVillage Office", location: "Outer Ring Road, Bengaluru", price: 45000000, type: "Commercial", status: "available", createdAt: now },
  { name: "Godrej Eden Estate", location: "Devanahalli, Bengaluru", price: 9800000, type: "Residential", status: "pending", createdAt: now },
  { name: "Adarsh Palm Retreat", location: "Bellandur, Bengaluru", price: 15000000, type: "Residential", status: "available", createdAt: now },
  { name: "DLF Cyber City", location: "Hebbal, Bengaluru", price: 32000000, type: "Commercial", status: "sold", createdAt: now },
  { name: "Mantri Serene", location: "Kanakapura Road, Bengaluru", price: 7500000, type: "Residential", status: "pending", createdAt: now },
];

const agents = [
  { name: "Rahul Sharma", email: "rahul.sharma@realty.com", phone: "+91 98765 43210", salesCount: 28, revenue: 42000000, rating: 4.9, createdAt: now },
  { name: "Priya Menon", email: "priya.menon@realty.com", phone: "+91 87654 32109", salesCount: 22, revenue: 31500000, rating: 4.7, createdAt: now },
  { name: "Aakash Patel", email: "aakash.patel@realty.com", phone: "+91 76543 21098", salesCount: 18, revenue: 25000000, rating: 4.6, createdAt: now },
  { name: "Divya Krishnan", email: "divya.k@realty.com", phone: "+91 65432 10987", salesCount: 15, revenue: 19500000, rating: 4.5, createdAt: now },
  { name: "Suresh Nair", email: "suresh.nair@realty.com", phone: "+91 54321 09876", salesCount: 11, revenue: 14000000, rating: 4.2, createdAt: now },
];

const transactions = [
  { description: "Sale - Prestige Lakeside Habitat", amount: 12500000, type: "income", date: "2026-02-10", category: "Sales", createdAt: now },
  { description: "Sale - DLF Cyber City", amount: 32000000, type: "income", date: "2026-02-18", category: "Sales", createdAt: now },
  { description: "Sale - Sobha Dream Acres", amount: 6200000, type: "income", date: "2026-03-01", category: "Sales", createdAt: now },
  { description: "Commission - Rahul Sharma", amount: 1250000, type: "expense", date: "2026-02-12", category: "Commission", createdAt: now },
  { description: "Commission - Priya Menon", amount: 960000, type: "expense", date: "2026-02-20", category: "Commission", createdAt: now },
  { description: "Google Ads - Q1 Campaign", amount: 150000, type: "expense", date: "2026-01-05", category: "Marketing", createdAt: now },
  { description: "Facebook Ads - Luxury Homes", amount: 200000, type: "expense", date: "2026-01-15", category: "Marketing", createdAt: now },
  { description: "Office Rent - Feb 2026", amount: 85000, type: "expense", date: "2026-02-01", category: "Operations", createdAt: now },
  { description: "Office Rent - Mar 2026", amount: 85000, type: "expense", date: "2026-03-01", category: "Operations", createdAt: now },
  { description: "Referral Fee - Brigade Utopia", amount: 175000, type: "income", date: "2026-03-05", category: "Referral", createdAt: now },
];

const leads = [
  { name: "Kiran Rao", email: "kiran.rao@gmail.com", phone: "+91 91234 56789", status: "qualified", source: "Website", createdAt: now },
  { name: "Meghna Iyer", email: "meghna.iyer@gmail.com", phone: "+91 80123 45678", status: "new", source: "Google Ads", createdAt: now },
  { name: "Arjun Reddy", email: "arjun.reddy@gmail.com", phone: "+91 79012 34567", status: "contacted", source: "Referral", createdAt: now },
  { name: "Sneha Pillai", email: "sneha.pillai@gmail.com", phone: "+91 68901 23456", status: "qualified", source: "Facebook", createdAt: now },
  { name: "Vikram Singh", email: "vikram.singh@gmail.com", phone: "+91 57890 12345", status: "new", source: "Google Ads", createdAt: now },
  { name: "Ananya Das", email: "ananya.das@gmail.com", phone: "+91 46789 01234", status: "contacted", source: "Website", createdAt: now },
  { name: "Rohan Gupta", email: "rohan.gupta@gmail.com", phone: "+91 35678 90123", status: "lost", source: "Cold Call", createdAt: now },
  { name: "Lakshmi Venkat", email: "lakshmi.v@gmail.com", phone: "+91 24567 89012", status: "qualified", source: "Referral", createdAt: now },
  { name: "Deepak Malhotra", email: "deepak.m@gmail.com", phone: "+91 13456 78901", status: "new", source: "Instagram", createdAt: now },
  { name: "Pooja Joshi", email: "pooja.joshi@gmail.com", phone: "+91 02345 67890", status: "contacted", source: "Website", createdAt: now },
];

const campaigns = [
  { name: "Bengaluru Luxury Homes Q1", platform: "Facebook", budget: 200000, leads: 48, status: "active", createdAt: now },
  { name: "First-Time Buyers Drive", platform: "Google", budget: 150000, leads: 35, status: "active", createdAt: now },
  { name: "Commercial Spaces 2026", platform: "LinkedIn", budget: 300000, leads: 22, status: "paused", createdAt: now },
  { name: "Devanahalli Plots Push", platform: "Instagram", budget: 80000, leads: 19, status: "active", createdAt: now },
  { name: "New Year Offers 2026", platform: "Google", budget: 120000, leads: 41, status: "completed", createdAt: now },
];

// ─── SEED FUNCTION ──────────────────────────────────────────────────────────

async function seedCollection(collectionName, items) {
  console.log(`\n⏳ Seeding ${collectionName}...`);
  const col = db.collection(collectionName);

  // Optional: clear existing docs first
  const existing = await col.get();
  const deleteOps = existing.docs.map(d => d.ref.delete());
  await Promise.all(deleteOps);
  if (existing.size > 0) console.log(`   🗑  Deleted ${existing.size} existing docs`);

  // Write new docs in batch
  const batch = db.batch();
  items.forEach(item => {
    const ref = col.doc();
    batch.set(ref, item);
  });
  await batch.commit();
  console.log(`   ✅ Added ${items.length} ${collectionName}`);
}

async function main() {
  console.log("🚀 Starting Firestore seed...");
  try {
    await seedCollection("properties", properties);
    await seedCollection("agents", agents);
    await seedCollection("transactions", transactions);
    await seedCollection("leads", leads);
    await seedCollection("campaigns", campaigns);
    console.log("\n🎉 All collections seeded successfully!");
    console.log("   Open your CRM app — data should appear instantly.");
  } catch (err) {
    console.error("\n❌ Seed failed:", err);
  }
  process.exit(0);
}

main();