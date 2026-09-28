const BASE = 'http://localhost:3001/api';

async function request(path: string, options: RequestInit = {}) {
  const url = `${BASE}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(options.headers || {}),
    },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`[${res.status}] ${options.method || 'GET'} ${path}: ${text}`);
  }
  return res.json();
}

async function runTests() {
  console.log('================================================================');
  console.log('🧪 NAV-TRAC X — FULL BACKEND API & WORKFLOW VERIFICATION SUITE');
  console.log('================================================================\n');

  let passed = 0;
  let failed = 0;

  async function test(name: string, fn: () => Promise<void>) {
    try {
      await fn();
      console.log(`✅ [PASS] ${name}`);
      passed++;
    } catch (err: any) {
      console.error(`❌ [FAIL] ${name}:`, err.message);
      failed++;
    }
  }

  // 1. Health & Stats
  await test('System Health Check (/api/health)', async () => {
    const health = await request('/health');
    if (health.status !== 'ONLINE') throw new Error(`Unexpected status: ${health.status}`);
  });

  await test('Dynamic Dashboard Stats (/api/dashboard/stats)', async () => {
    const stats = await request('/dashboard/stats');
    if (stats.documents < 5) throw new Error(`Expected at least 5 documents, got ${stats.documents}`);
    if (stats.recipients < 8) throw new Error(`Expected at least 8 recipients, got ${stats.recipients}`);
    if (stats.ledgerBlocks < 10) throw new Error(`Expected at least 10 ledger blocks, got ${stats.ledgerBlocks}`);
  });

  // 2. Document Workflow
  let uploadedDocId = '';
  await test('Document Upload with Cryptographic Fingerprint (/api/documents/upload)', async () => {
    const result = await request('/documents/upload', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Operational_Maritime_Brief_Test.pdf',
        classification: 'TOP SECRET (CODEWORD)',
        documentType: 'Tactical Operation',
        author: 'Lt. Cdr. S. Rao',
        sanitizeMetadata: true,
      }),
    });
    if (!result.success || !result.document?.id) throw new Error('Upload failed');
    uploadedDocId = result.document.id;
  });

  await test('Get Document Versions (/api/documents/:id/versions)', async () => {
    const versions = await request(`/documents/${uploadedDocId}/versions`);
    if (!Array.isArray(versions) || versions.length === 0) throw new Error('No versions returned');
  });

  // 3. Recipient & Authorization
  let testRecipientId = '';
  await test('Recipients Directory (/api/recipients)', async () => {
    const recipients = await request('/recipients');
    if (recipients.length < 8) throw new Error(`Recipients count < 8 (${recipients.length})`);
    testRecipientId = recipients[0].id;
  });

  let createdRequestId = '';
  await test('Create Access Request & Trigger Gmail Notification (/api/authorization/requests)', async () => {
    const req = await request('/authorization/requests', {
      method: 'POST',
      body: JSON.stringify({
        officerName: 'Lt. Priya Singh',
        rank: 'Lieutenant',
        unit: 'INS Visakhapatnam (D66)',
        pno: '06244-S',
        documentId: uploadedDocId,
        documentName: 'Operational_Maritime_Brief_Test.pdf',
        reason: 'Combat Mission Briefing Clearance',
      }),
    });
    if (!req.id) throw new Error('Request creation failed');
    createdRequestId = req.id;
  });

  await test('Approve Access Request with Notification (/api/authorization/requests/:id/approve)', async () => {
    const approved = await request(`/authorization/requests/${createdRequestId}/approve`, {
      method: 'POST',
      body: JSON.stringify({
        approverName: 'Capt. R. Deshmukh',
        note: 'Approved for 24-hour tactical window',
      }),
    });
    if (approved.request?.status !== 'Approved') throw new Error('Approval status mismatch');
  });

  // 4. Distribution & Provenance Capsule
  let testDistributionId = '';
  await test('Distribute Document Transaction (/api/distributions)', async () => {
    const dist = await request('/distributions', {
      method: 'POST',
      body: JSON.stringify({
        documentId: uploadedDocId,
        recipients: [testRecipientId],
        classification: 'TOP SECRET (CODEWORD)',
        encryptionAlgorithm: 'ML-KEM-768 + AES-256-GCM',
        distributedBy: 'Lt. Cdr. S. Rao',
      }),
    });
    if (!dist.success || !dist.distribution?.id) throw new Error('Distribution transaction failed');
    testDistributionId = dist.distribution.id;
  });

  await test('Decryption & Provenance Generation (/api/decryption)', async () => {
    const dec = await request('/decryption', {
      method: 'POST',
      body: JSON.stringify({
        documentId: uploadedDocId,
        recipientId: testRecipientId,
        deviceId: 'HW-HSM-TEST-01',
      }),
    });
    if (!dec.success || !dec.capsule?.capsuleId) throw new Error('Decryption event or capsule generation failed');
  });

  await test('Verify Provenance Capsule (/api/provenance/:id/verify)', async () => {
    const capsules = await request('/provenance');
    if (!capsules || capsules.length === 0) throw new Error('No provenance capsules found');
    const verifyRes = await request(`/provenance/${capsules[0].capsuleId}/verify`, { method: 'POST' });
    if (!verifyRes.valid) throw new Error('Capsule verification failed');
  });

  // 5. Ledger Integrity & Tamper Demo
  await test('Ledger Hash-Chain Verification (/api/ledger/verify)', async () => {
    const verify = await request('/ledger/verify', { method: 'POST' });
    if (!verify.valid && !verify.isSuccess) throw new Error('Initial ledger verify failed');
  });

  await test('Ledger Tamper Simulation & Triggered Alert (/api/ledger/tamper-demo)', async () => {
    const tamper = await request('/ledger/tamper-demo', { method: 'POST' });
    if (!tamper.isTampered) throw new Error('Tamper simulation failed');

    // Verify should now detect failure
    const checkVerify = await request('/ledger/verify', { method: 'POST' });
    if (checkVerify.valid || checkVerify.isSuccess) throw new Error('Ledger verify failed to detect tamper');

    // Reset ledger demo
    const reset = await request('/ledger/reset-demo', { method: 'POST' });
    if (reset.isTampered) throw new Error('Ledger reset failed');
  });

  // 6. Forensic Artifact Upload & Analysis
  let artifactId = '';
  await test('Upload Leak Artifact (/api/artifacts)', async () => {
    const art = await request('/artifacts', {
      method: 'POST',
      body: JSON.stringify({
        filename: 'intercepted_tactical_screen.jpg',
        documentId: uploadedDocId,
        size: '2.1 MB',
      }),
    });
    if (!art.id) throw new Error('Artifact upload failed');
    artifactId = art.id;
  });

  await test('Forensic Convergence Analysis (/api/artifacts/:id/analyze)', async () => {
    const analysis = await request(`/artifacts/${artifactId}/analyze`, { method: 'POST' });
    if (!analysis.watermarkDetected || analysis.confidenceScore < 90) throw new Error('Watermark extraction failed');
    if (analysis.checks?.overallStatus !== 'PROVENANCE VERIFIED') throw new Error('Convergence status mismatch');
  });

  // 7. Gmail Integration & Notifications
  await test('Gmail Integration Status (/api/integrations/gmail/status)', async () => {
    const status = await request('/integrations/gmail/status');
    if (status.connected === undefined) throw new Error('Status object invalid');
  });

  await test('Send Test Security Email (/api/integrations/gmail/test)', async () => {
    const result = await request('/integrations/gmail/test', {
      method: 'POST',
      body: JSON.stringify({ targetEmail: 'fleet-duty-officer@navy.mil.in' }),
    });
    if (!result.success) throw new Error(`Test email failed: ${result.message}`);
  });

  await test('Fetch Email Notification Logs (/api/integrations/gmail/notifications)', async () => {
    const logs = await request('/integrations/gmail/notifications');
    if (!Array.isArray(logs) || logs.length === 0) throw new Error('No notification logs found');
  });

  // 8. Global Dynamic Search
  await test('Global Dynamic Search (/api/search)', async () => {
    const searchRes = await request('/search?q=Bravo');
    if (!searchRes.results || searchRes.results.length === 0) throw new Error('Search did not return matches');
  });

  console.log('\n================================================================');
  console.log(`📊 TEST SUITE SUMMARY: ${passed} Passed | ${failed} Failed`);
  console.log('================================================================');

  if (failed > 0) process.exit(1);
}

runTests();
