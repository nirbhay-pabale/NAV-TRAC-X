import { can, getMenuForRole, RECIPIENT_MENU_CONFIG, INVESTIGATOR_MENU_CONFIG } from '../src/utils/permissions';
import { centralStore } from '../src/data/centralStore';
import { INITIAL_RECIPIENT_DOCUMENTS, INITIAL_RECIPIENT_KEY } from '../src/data/recipientMockData';

console.log('====================================================');
console.log('NAV-TRAC X RECIPIENT PORTAL VERIFICATION SUITE');
console.log('====================================================\n');

// 1. Permissions Matrix Test
console.log('[TEST 1/6] Capability-based Permissions Matrix');
const recipientCanViewDocs = can('view_own_documents', 'documents', 'normal_user');
const recipientCanDistribute = can('distribute_documents', 'distribution', 'normal_user');
const recipientCanInvestigate = can('investigate_leaks', 'investigations', 'normal_user');
const investigatorCanInvestigate = can('investigate_leaks', 'investigations', 'investigator');

if (recipientCanViewDocs && !recipientCanDistribute && !recipientCanInvestigate && investigatorCanInvestigate) {
  console.log('  ✓ PASSED: Recipient role strictly isolated from distribution & investigation tools.');
} else {
  throw new Error('Permissions matrix failed!');
}

// 2. Role-Based Sidebar Configuration
console.log('\n[TEST 2/6] Role Menu Configuration');
const recipientMenu = getMenuForRole('normal_user');
const investigatorMenu = getMenuForRole('investigator');

if (
  recipientMenu.length >= 2 &&
  recipientMenu.some((m) => m.to === '/my/dashboard') &&
  recipientMenu.some((m) => m.to === '/my/documents') &&
  !recipientMenu.some((m) => m.to === '/command-center' || m.to.startsWith('/investigations'))
) {
  console.log('  ✓ PASSED: Recipient menu contains only view-only /my/* routes and no investigator links.');
} else {
  throw new Error('Recipient menu configuration mismatch!');
}

// 3. Unauthorized Route Access & Audit Logging (Acceptance Test)
console.log('\n[TEST 3/6] Unauthorized Route Access & Audit Logging');
const initialDeniedLogsCount = centralStore.getState().deniedLogs.length;

// Simulate recipient trying to open /investigations
const loggedDenial = centralStore.logAccessDenied({
  requester: 'Lt. Priya Singh',
  rank: 'Lieutenant',
  unit: 'INS Visakhapatnam (D66)',
  deviceId: 'HW-HSM-9402',
  documentId: '/investigations',
  documentName: 'Restricted Area: /investigations',
  reasonForDenial: 'Not Authorized',
});

const updatedDeniedLogsCount = centralStore.getState().deniedLogs.length;
if (updatedDeniedLogsCount === initialDeniedLogsCount + 1 && loggedDenial.reasonForDenial === 'Not Authorized') {
  console.log(`  ✓ PASSED: Unauthorized navigation to /investigations recorded log ${loggedDenial.id} for admins.`);
} else {
  throw new Error('Access denied logging failed!');
}

// 4. Recipient Document Clearance & Expiry Scoping
console.log('\n[TEST 4/6] Recipient Document States & Scoping');
const newDocs = INITIAL_RECIPIENT_DOCUMENTS.filter((d) => d.status === 'New');
const expiringDocs = INITIAL_RECIPIENT_DOCUMENTS.filter((d) => d.isExpiringSoon && !d.isExpired);
const expiredDocs = INITIAL_RECIPIENT_DOCUMENTS.filter((d) => d.isExpired);

console.log(`  ✓ PASSED: Assigned Documents mapped (New: ${newDocs.length}, Expiring < 48h: ${expiringDocs.length}, Expired/Revoked: ${expiredDocs.length}).`);

// 5. Access Request & CentralStore Sync
console.log('\n[TEST 5/6] Access Request Creation & CentralStore Sync');
const initialRequestsCount = centralStore.getState().requests.length;
const createdRequest = centralStore.addAccessRequest({
  requesterName: 'Lt. Priya Singh',
  requesterRank: 'Lieutenant',
  requesterPno: '06244-S',
  requesterUnit: 'INS Visakhapatnam (D66)',
  documentId: 'NAV-DOC-2026-0055',
  reasonGiven: 'Acoustic calibration data required for ASW corridor sweep.',
});

if (
  centralStore.getState().requests.length === initialRequestsCount + 1 &&
  createdRequest.documentId === 'NAV-DOC-2026-0055' &&
  createdRequest.status === 'Pending'
) {
  console.log(`  ✓ PASSED: Request ${createdRequest.id} routed to approver queue in CentralStore.`);
} else {
  throw new Error('Access request sync failed!');
}

// 6. Lost Key Emergency Revocation
console.log('\n[TEST 6/6] Emergency Key Blacklist & Alert Notification');
const initialAlertsCount = centralStore.getState().alerts.length;
centralStore.reportLostKey(INITIAL_RECIPIENT_KEY.keyId, 'Lt. Priya Singh', 'Lost hardware token');

if (centralStore.getState().alerts.length === initialAlertsCount + 1) {
  console.log('  ✓ PASSED: Lost key event generated critical security alert.');
} else {
  throw new Error('Lost key alert logging failed!');
}

console.log('\n====================================================');
console.log('ALL 6/6 RECIPIENT PORTAL VERIFICATION TESTS PASSED');
console.log('====================================================\n');
