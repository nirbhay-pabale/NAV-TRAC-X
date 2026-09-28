import { db } from './database';

console.log('================================================================');
console.log('⚓ NAV-TRAC X - Naval Tactical Database Seed Script');
console.log('================================================================');

db.resetToSeed();

const stats = db.getDashboardStats();
console.log('✅ Database seeded successfully with realistic naval tactical data:');
console.log(`   - Documents: ${stats.documents}`);
console.log(`   - Distributions: ${stats.activeDistributions}`);
console.log(`   - Recipients: ${stats.recipients}`);
console.log(`   - Decryption Events: ${stats.decryptionEvents}`);
console.log(`   - Ledger Blocks: ${stats.ledgerBlocks}`);
console.log(`   - Investigations: ${stats.investigations}`);
console.log(`   - Active Alerts: ${stats.alerts}`);
console.log(`   - Cryptographic Provenance Capsules: ${db.getProvenanceCapsules().length}`);
console.log('================================================================');
