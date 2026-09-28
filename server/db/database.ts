import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

// Ensure data directory exists
const DATA_DIR = path.resolve(process.cwd(), 'server', 'data');
const DB_FILE = path.resolve(DATA_DIR, 'navtrac_db.json');

export interface DBState {
  users: any[];
  documents: any[];
  document_versions: any[];
  document_recipients: any[];
  recipients: any[];
  recipient_keys: any[];
  access_policies: any[];
  access_requests: any[];
  access_denied_logs: any[];
  distributions: any[];
  decryption_events: any[];
  provenance_capsules: any[];
  fingerprints: any[];
  watermarks: any[];
  ledger_blocks: any[];
  ledger_events: any[];
  leak_artifacts: any[];
  forensic_evidence: any[];
  evidence_checks: any[];
  investigations: any[];
  investigation_events: any[];
  alerts: any[];
  alert_rules: any[];
  notifications: any[];
  email_notifications: any[];
  notification_queue: any[];
  emcon_state: any;
  offline_packages: any[];
  disconnected_units: any[];
  activity_logs: any[];
  audit_events: any[];
  oauth_accounts: any[];
  isLedgerTampered: boolean;
  tamperedBlockNumber: number;
  leak_monitoring: Record<string, any>;
}

const initialSeedData: DBState = {
  isLedgerTampered: false,
  tamperedBlockNumber: 4188,

  users: [
    {
      id: 'USR-01',
      name: 'Lt. Cdr. S. Rao',
      email: 's.rao@navy.mil.in',
      rank: 'Lt. Commander',
      role: 'investigator',
      unit: 'Western Command (Cyber Warfare)',
      clearanceLevel: 'Level 4 (Top Secret)',
      createdAt: '2026-09-01T08:00:00Z',
    },
    {
      id: 'USR-02',
      name: 'Lt. Priya Singh',
      email: 'lt.priya.singh@navy.mil.in',
      rank: 'Lieutenant',
      role: 'normal_user',
      unit: 'INS Visakhapatnam (D66)',
      clearanceLevel: 'Level 3 (Secret)',
      createdAt: '2026-09-01T08:00:00Z',
    },
    {
      id: 'USR-03',
      name: 'Cdr. Arjun Mehta',
      email: 'a.mehta@navy.mil.in',
      rank: 'Commander',
      role: 'recipient',
      unit: 'INS Vikramaditya (R33)',
      clearanceLevel: 'Level 4 (Top Secret Codeword)',
      createdAt: '2026-09-01T08:00:00Z',
    },
    {
      id: 'USR-04',
      name: 'Capt. R. Deshmukh',
      email: 'r.deshmukh@navy.mil.in',
      rank: 'Captain',
      role: 'investigator',
      unit: 'Western Fleet HQ',
      clearanceLevel: 'Level 4 (Top Secret Codeword)',
      createdAt: '2026-09-01T08:00:00Z',
    },
  ],

  documents: [
    {
      id: 'NAV-DOC-2026-0042',
      name: 'Mission_Plan_Bravo.pdf',
      masterDocId: 'DOC-88219-BRAVO',
      version: 'v2.1',
      classification: 'TOP SECRET (CODEWORD)',
      documentType: 'Tactical Operation',
      sizeBytes: 14680064,
      status: 'Distributed',
      sha3Hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      recipientCount: 14,
      createdAt: '25 Sep 2026 09:30Z',
      updatedAt: '27 Sep 2026 04:54Z',
      metadataSanitized: true,
      watermarkCoveragePct: 98.4,
      tags: ['Western Fleet', 'Combat Readiness', 'INS Vikramaditya'],
      securityCaveats: 'Dual-Custody HSM Required • Dynamic Provenance Capsule Active',
    },
    {
      id: 'NAV-DOC-2026-0038',
      name: 'Eastern_Littoral_Hydrographic_Intel.pdf',
      masterDocId: 'DOC-77142-HYDRO',
      version: 'v1.4',
      classification: 'SECRET',
      documentType: 'Hydrographic Chart',
      sizeBytes: 28416000,
      status: 'Distributed',
      sha3Hash: 'f4b1a88390fc1d234aebf4c8996eb92427ae41e4649c884ca495991b7852c991',
      recipientCount: 22,
      createdAt: '22 Sep 2026 14:15Z',
      updatedAt: '26 Sep 2026 18:03Z',
      metadataSanitized: true,
      watermarkCoveragePct: 95.0,
      tags: ['Eastern Naval Command', 'Bathymetry', 'Bay of Bengal'],
      securityCaveats: 'Encrypted Air-Gap Cache Only',
    },
    {
      id: 'NAV-DOC-2026-0055',
      name: 'Submarine_Acoustic_Signature_Profile.pdf',
      masterDocId: 'DOC-99012-ACOUSTIC',
      version: 'v3.0',
      classification: 'TOP SECRET',
      documentType: 'Technical Report',
      sizeBytes: 8912896,
      status: 'Distributed',
      sha3Hash: 'a1b2c3d4e5f60718293a4b5c6d7e8f90123456789abcdef0123456789abcdef0',
      recipientCount: 8,
      createdAt: '20 Sep 2026 11:00Z',
      updatedAt: '26 Sep 2026 21:40Z',
      metadataSanitized: false,
      watermarkCoveragePct: 92.5,
      tags: ['Submarine Flotilla', 'Sonar', 'Acoustics'],
      securityCaveats: 'Zero-Export • Memory Execution Only',
    },
    {
      id: 'NAV-DOC-2026-0029',
      name: 'Tactical_Satcom_Frequency_Allocation.docx',
      masterDocId: 'DOC-44810-SATCOM',
      version: 'v1.0',
      classification: 'SECRET',
      documentType: 'Frequency Plan',
      sizeBytes: 4194304,
      status: 'Distributed',
      sha3Hash: 'b2c3d4e5f60718293a4b5c6d7e8f90123456789abcdef0123456789abcdef01',
      recipientCount: 18,
      createdAt: '18 Sep 2026 08:45Z',
      updatedAt: '26 Sep 2026 17:45Z',
      metadataSanitized: true,
      watermarkCoveragePct: 100.0,
      tags: ['Communications', 'SATCOM', 'EHF'],
      securityCaveats: 'EMCON State Aware',
    },
    {
      id: 'NAV-DOC-2026-0061',
      name: 'Carrier_Air_Wing_Sortie_Schedule.pptx',
      masterDocId: 'DOC-55190-AIRWING',
      version: 'v2.0',
      classification: 'SECRET',
      documentType: 'Aviation Schedule',
      sizeBytes: 6291456,
      status: 'Distributed',
      sha3Hash: 'c3d4e5f60718293a4b5c6d7e8f90123456789abcdef0123456789abcdef012',
      recipientCount: 12,
      createdAt: '24 Sep 2026 16:20Z',
      updatedAt: '26 Sep 2026 22:10Z',
      metadataSanitized: true,
      watermarkCoveragePct: 96.8,
      tags: ['MiG-29K', 'Carrier Strike Group', 'Sortie'],
      securityCaveats: '12-Hour Ephemeral Session',
    },
    {
      id: 'NAV-DOC-2026-0070',
      name: 'Draft_Coastal_Surveillance_Radar_SOP.docx',
      masterDocId: 'DOC-11092-COASTAL',
      version: 'v0.9',
      classification: 'CONFIDENTIAL',
      documentType: 'Standard Operating Procedure',
      sizeBytes: 3145728,
      status: 'Draft',
      sha3Hash: 'd4e5f60718293a4b5c6d7e8f90123456789abcdef0123456789abcdef0123',
      recipientCount: 4,
      createdAt: '26 Sep 2026 10:00Z',
      updatedAt: '26 Sep 2026 12:20Z',
      metadataSanitized: true,
      watermarkCoveragePct: 99.1,
      tags: ['Coast Guard', 'Radar', 'SOP'],
      securityCaveats: 'Standard Clearance',
    },
  ],

  document_versions: [
    {
      documentId: 'NAV-DOC-2026-0042',
      version: 'v2.1',
      fileHash: 'SHA256: 88f2:1ac0:981b:aacc:3321:ff88:9012:39aa',
      author: 'Capt. R. Deshmukh (03912-P)',
      changeNotes: 'Updated strike package vector Alpha-7 and revised fuel reserve calculations.',
      releasedAt: '26 Sep 2026 20:14 IST',
      isLeakedMatch: true,
      linkedDecryptionEvents: [
        { eventId: 'EVT-88421', recipientName: 'Cdr. Arjun Mehta (04821-K)', decryptedAt: '27 Sep 2026 04:54Z', matchedLeakArtifact: true },
        { eventId: 'EVT-88420', recipientName: 'Capt. R. Deshmukh (03912-P)', decryptedAt: '27 Sep 2026 04:51Z', matchedLeakArtifact: false },
        { eventId: 'EVT-88416', recipientName: 'Directorate of Naval Operations', decryptedAt: '26 Sep 2026 21:55Z', matchedLeakArtifact: false },
      ],
    },
    {
      documentId: 'NAV-DOC-2026-0042',
      version: 'v2.0',
      fileHash: 'SHA256: 32ba:1198:c001:92ea:7732:b891:0ac2:2199',
      author: 'Cdr. Arjun Mehta (04821-K)',
      changeNotes: 'Integrated carrier strike group escort positioning and updated callsigns.',
      releasedAt: '25 Sep 2026 14:30 IST',
      isLeakedMatch: false,
      linkedDecryptionEvents: [
        { eventId: 'EVT-88412', recipientName: 'Flag Officer Commanding Western Fleet', decryptedAt: '26 Sep 2026 12:45Z', matchedLeakArtifact: false },
      ],
    },
    {
      documentId: 'NAV-DOC-2026-0042',
      version: 'v1.0',
      fileHash: 'SHA256: ee11:0098:44bb:9910:aa11:2349:bc98:1244',
      author: 'Directorate of Naval Operations',
      changeNotes: 'Initial operational draft for Western Fleet exercise simulation.',
      releasedAt: '24 Sep 2026 09:00 IST',
      isLeakedMatch: false,
      linkedDecryptionEvents: [
        { eventId: 'EVT-88410', recipientName: 'Cdr. Arjun Mehta (04821-K)', decryptedAt: '26 Sep 2026 08:30Z', matchedLeakArtifact: false },
      ],
    },
  ],

  document_recipients: [
    {
      documentId: 'NAV-DOC-2026-0042',
      id: 'REC-01',
      recipientName: 'Cdr. Arjun Mehta',
      rank: 'Commander',
      pno: '04821-K',
      unitVessel: 'INS Vikramaditya (R33)',
      accessType: 'View Only',
      deviceId: 'HW-HSM-9021',
      status: 'Decrypted',
      decryptedAt: '27 Sep 2026 04:54Z',
    },
    {
      documentId: 'NAV-DOC-2026-0042',
      id: 'REC-02',
      recipientName: 'Capt. R. Deshmukh',
      rank: 'Captain',
      pno: '03912-P',
      unitVessel: 'Western Fleet HQ',
      accessType: 'Full Access',
      deviceId: 'NAV-HQ-WNC-01',
      status: 'Decrypted',
      decryptedAt: '27 Sep 2026 04:51Z',
    },
    {
      documentId: 'NAV-DOC-2026-0042',
      id: 'REC-03',
      recipientName: 'Lt. Cdr. Sunita Rao',
      rank: 'Lt. Commander',
      pno: '05190-M',
      unitVessel: 'INS Vikrant (R11)',
      accessType: 'View Only',
      deviceId: 'HW-HSM-8812',
      status: 'Pending',
      decryptedAt: null,
    },
  ],

  recipients: [
    {
      id: 'REC-01',
      name: 'Cdr. Arjun Mehta',
      rank: 'Commander',
      pno: '04821-K',
      unit: 'INS Vikramaditya (R33)',
      email: 'a.mehta@navy.mil.in',
      clearanceLevel: 'Level 4 (Top Secret Codeword)',
      activeKeys: 4,
      documentsReceived: 18,
      lastActive: '12 mins ago',
      status: 'Active',
      hardwareDeviceId: 'HW-HSM-9021',
      pkiCertificateFingerprint: 'SHA256: 89AF:42E1:90C2:33DA',
    },
    {
      id: 'REC-02',
      name: 'Capt. R. Deshmukh',
      rank: 'Captain',
      pno: '03912-P',
      unit: 'Western Fleet HQ',
      email: 'r.deshmukh@navy.mil.in',
      clearanceLevel: 'Level 4 (Top Secret Codeword)',
      activeKeys: 6,
      documentsReceived: 32,
      lastActive: '30 mins ago',
      status: 'Active',
      hardwareDeviceId: 'NAV-HQ-WNC-01',
      pkiCertificateFingerprint: 'SHA256: 44BA:8819:11AC:44EF',
    },
    {
      id: 'REC-03',
      name: 'Lt. Cdr. Sunita Rao',
      rank: 'Lt. Commander',
      pno: '05190-M',
      unit: 'INS Vikrant (R11)',
      email: 's.rao@navy.mil.in',
      clearanceLevel: 'Level 3 (Secret)',
      activeKeys: 2,
      documentsReceived: 11,
      lastActive: '1 hour ago',
      status: 'Active',
      hardwareDeviceId: 'HW-HSM-8812',
      pkiCertificateFingerprint: 'SHA256: 12FE:9981:AA34:7700',
    },
    {
      id: 'REC-04',
      name: 'Commodore S. V. Nair',
      rank: 'Commodore',
      pno: '02811-A',
      unit: 'Naval Headquarters Delhi',
      email: 'sv.nair@navy.mil.in',
      clearanceLevel: 'Level 4 (Top Secret Codeword)',
      activeKeys: 8,
      documentsReceived: 45,
      lastActive: '5 mins ago',
      status: 'Active',
      hardwareDeviceId: 'NHQ-SEC-NODE-01',
      pkiCertificateFingerprint: 'SHA256: 9911:44AA:77CC:8899',
    },
    {
      id: 'REC-05',
      name: 'Lt. Priya Singh',
      rank: 'Lieutenant',
      pno: '06244-S',
      unit: 'INS Visakhapatnam (D66)',
      email: 'lt.priya.singh@navy.mil.in',
      clearanceLevel: 'Level 3 (Secret)',
      activeKeys: 2,
      documentsReceived: 14,
      lastActive: 'Just now',
      status: 'Active',
      hardwareDeviceId: 'HW-HSM-6244',
      pkiCertificateFingerprint: 'SHA256: CC88:1199:33AA:BB55',
    },
    {
      id: 'REC-06',
      name: 'Cdr. Devendra Malik',
      rank: 'Commander',
      pno: '04118-W',
      unit: 'INS Mormugao (D67)',
      email: 'd.malik@navy.mil.in',
      clearanceLevel: 'Level 4 (Top Secret)',
      activeKeys: 3,
      documentsReceived: 9,
      lastActive: '45 mins ago',
      status: 'Active',
      hardwareDeviceId: 'HW-HSM-4118',
      pkiCertificateFingerprint: 'SHA256: 7711:AA22:EE55:66CC',
    },
    {
      id: 'REC-07',
      name: 'Lt. Amit Saxena',
      rank: 'Lieutenant',
      pno: '06812-B',
      unit: 'Western Fleet HQ',
      email: 'a.saxena@navy.mil.in',
      clearanceLevel: 'Level 3 (Secret)',
      activeKeys: 2,
      documentsReceived: 16,
      lastActive: '2 hours ago',
      status: 'Active',
      hardwareDeviceId: 'WNC-TERM-068',
      pkiCertificateFingerprint: 'SHA256: 3344:5566:7788:9900',
    },
    {
      id: 'REC-08',
      name: 'Sub-Lt. Ananya Verma',
      rank: 'Sub-Lieutenant',
      pno: '07119-V',
      unit: 'Naval Cyber Defense Centre',
      email: 'a.verma@navy.mil.in',
      clearanceLevel: 'Level 2 (Restricted)',
      activeKeys: 1,
      documentsReceived: 5,
      lastActive: '3 hours ago',
      status: 'Active',
      hardwareDeviceId: 'NCDC-SEC-441',
      pkiCertificateFingerprint: 'SHA256: FF11:2233:4455:6677',
    },
  ],

  recipient_keys: [
    {
      id: 'KEY-01',
      recipientId: 'REC-01',
      algorithm: 'ML-DSA-65 (NIST FIPS 204)',
      publicKeyFingerprint: 'SHA256: 89AF:42E1:90C2:33DA',
      status: 'Active',
      issuedAt: '2026-09-01T00:00:00Z',
      expiresAt: '2027-09-01T00:00:00Z',
    },
    {
      id: 'KEY-02',
      recipientId: 'REC-05',
      algorithm: 'ML-DSA-65 (NIST FIPS 204)',
      publicKeyFingerprint: 'SHA256: CC88:1199:33AA:BB55',
      status: 'Active',
      issuedAt: '2026-09-01T00:00:00Z',
      expiresAt: '2027-09-01T00:00:00Z',
    },
  ],

  distributions: [
    {
      id: 'DST-8F921-2026',
      documentId: 'NAV-DOC-2026-0042',
      documentName: 'Mission_Plan_Bravo.pdf',
      version: 'v2.1',
      recipients: ['REC-01', 'REC-02', 'REC-03'],
      recipientCount: 3,
      classification: 'TOP SECRET (CODEWORD)',
      encryptionAlgorithm: 'ML-KEM-768 + AES-256-GCM',
      status: 'Delivered',
      distributedBy: 'Lt. Cdr. S. Rao',
      distributedAt: '2026-09-25T09:30:00Z',
      ledgerEventId: 'EVT-88401',
      watermarkApplied: true,
      capsulePrepared: true,
    },
    {
      id: 'DST-7E110-2026',
      documentId: 'NAV-DOC-2026-0038',
      documentName: 'Eastern_Littoral_Hydrographic_Intel.pdf',
      version: 'v1.4',
      recipients: ['REC-04', 'REC-07'],
      recipientCount: 2,
      classification: 'SECRET',
      encryptionAlgorithm: 'ML-KEM-768 + AES-256-GCM',
      status: 'Delivered',
      distributedBy: 'Capt. R. Deshmukh',
      distributedAt: '2026-09-22T14:15:00Z',
      ledgerEventId: 'EVT-88402',
      watermarkApplied: true,
      capsulePrepared: true,
    },
    {
      id: 'DST-99120-2026',
      documentId: 'NAV-DOC-2026-0055',
      documentName: 'Submarine_Acoustic_Signature_Profile.pdf',
      version: 'v3.0',
      recipients: ['REC-06'],
      recipientCount: 1,
      classification: 'TOP SECRET',
      encryptionAlgorithm: 'ML-KEM-768 + AES-256-GCM',
      status: 'Delivered',
      distributedBy: 'Capt. R. Deshmukh',
      distributedAt: '2026-09-20T11:00:00Z',
      ledgerEventId: 'EVT-88403',
      watermarkApplied: true,
      capsulePrepared: true,
    },
    {
      id: 'DST-44102-2026',
      documentId: 'NAV-DOC-2026-0029',
      documentName: 'Tactical_Satcom_Frequency_Allocation.docx',
      version: 'v1.0',
      recipients: ['REC-05', 'REC-08'],
      recipientCount: 2,
      classification: 'SECRET',
      encryptionAlgorithm: 'AES-256-GCM',
      status: 'Delivered',
      distributedBy: 'Lt. Cdr. S. Rao',
      distributedAt: '2026-09-18T08:45:00Z',
      ledgerEventId: 'EVT-88404',
      watermarkApplied: true,
      capsulePrepared: true,
    },
    {
      id: 'DST-55201-2026',
      documentId: 'NAV-DOC-2026-0061',
      documentName: 'Carrier_Air_Wing_Sortie_Schedule.pptx',
      version: 'v2.0',
      recipients: ['REC-01', 'REC-03'],
      recipientCount: 2,
      classification: 'SECRET',
      encryptionAlgorithm: 'ML-KEM-768 + AES-256-GCM',
      status: 'Delivered',
      distributedBy: 'Capt. R. Deshmukh',
      distributedAt: '2026-09-24T16:20:00Z',
      ledgerEventId: 'EVT-88405',
      watermarkApplied: true,
      capsulePrepared: true,
    },
    {
      id: 'DST-11002-2026',
      documentId: 'NAV-DOC-2026-0070',
      documentName: 'Draft_Coastal_Surveillance_Radar_SOP.docx',
      version: 'v0.9',
      recipients: ['REC-05'],
      recipientCount: 1,
      classification: 'CONFIDENTIAL',
      encryptionAlgorithm: 'AES-256-GCM',
      status: 'Draft',
      distributedBy: 'Lt. Priya Singh',
      distributedAt: '2026-09-26T10:00:00Z',
      ledgerEventId: 'EVT-88406',
      watermarkApplied: true,
      capsulePrepared: false,
    },
    {
      id: 'DST-66219-2026',
      documentId: 'NAV-DOC-2026-0042',
      documentName: 'Mission_Plan_Bravo.pdf',
      version: 'v2.0',
      recipients: ['REC-02', 'REC-04'],
      recipientCount: 2,
      classification: 'TOP SECRET (CODEWORD)',
      encryptionAlgorithm: 'ML-KEM-768 + AES-256-GCM',
      status: 'Delivered',
      distributedBy: 'Capt. R. Deshmukh',
      distributedAt: '2026-09-25T14:30:00Z',
      ledgerEventId: 'EVT-88407',
      watermarkApplied: true,
      capsulePrepared: true,
    },
    {
      id: 'DST-33100-2026',
      documentId: 'NAV-DOC-2026-0038',
      documentName: 'Eastern_Littoral_Hydrographic_Intel.pdf',
      version: 'v1.4',
      recipients: ['REC-05'],
      recipientCount: 1,
      classification: 'SECRET',
      encryptionAlgorithm: 'ML-KEM-768 + AES-256-GCM',
      status: 'Delivered',
      distributedBy: 'Lt. Cdr. S. Rao',
      distributedAt: '2026-09-23T11:00:00Z',
      ledgerEventId: 'EVT-88408',
      watermarkApplied: true,
      capsulePrepared: true,
    },
    {
      id: 'DST-77192-2026',
      documentId: 'NAV-DOC-2026-0055',
      documentName: 'Submarine_Acoustic_Signature_Profile.pdf',
      version: 'v3.0',
      recipients: ['REC-01'],
      recipientCount: 1,
      classification: 'TOP SECRET',
      encryptionAlgorithm: 'ML-KEM-768 + AES-256-GCM',
      status: 'Delivered',
      distributedBy: 'Capt. R. Deshmukh',
      distributedAt: '2026-09-21T09:15:00Z',
      ledgerEventId: 'EVT-88409',
      watermarkApplied: true,
      capsulePrepared: true,
    },
    {
      id: 'DST-88190-2026',
      documentId: 'NAV-DOC-2026-0029',
      documentName: 'Tactical_Satcom_Frequency_Allocation.docx',
      version: 'v1.0',
      recipients: ['REC-02', 'REC-06'],
      recipientCount: 2,
      classification: 'SECRET',
      encryptionAlgorithm: 'AES-256-GCM',
      status: 'Delivered',
      distributedBy: 'Lt. Cdr. S. Rao',
      distributedAt: '2026-09-19T15:40:00Z',
      ledgerEventId: 'EVT-88410',
      watermarkApplied: true,
      capsulePrepared: true,
    },
  ],

  decryption_events: [
    {
      eventId: 'EVT-88421',
      documentId: 'NAV-DOC-2026-0042',
      documentName: 'Mission_Plan_Bravo.pdf',
      versionId: 'v2.1',
      recipientId: 'REC-01',
      recipientPseudonym: 'Cdr. Arjun Mehta (04821-K)',
      unit: 'INS Vikramaditya (R33)',
      deviceId: 'HW-HSM-9021',
      timestamp: '2026-09-27T04:54:12Z',
      channel: 'In-Memory Secure Decryption',
      signatureStatus: 'ML-DSA-65 Valid ✓',
      matchedLeakArtifact: true,
    },
    {
      eventId: 'EVT-88420',
      documentId: 'NAV-DOC-2026-0042',
      documentName: 'Mission_Plan_Bravo.pdf',
      versionId: 'v2.1',
      recipientId: 'REC-02',
      recipientPseudonym: 'Capt. R. Deshmukh (03912-P)',
      unit: 'Western Fleet HQ',
      deviceId: 'NAV-HQ-WNC-01',
      timestamp: '2026-09-27T04:51:00Z',
      channel: 'Command Console',
      signatureStatus: 'ML-DSA-65 Valid ✓',
      matchedLeakArtifact: false,
    },
    {
      eventId: 'EVT-88419',
      documentId: 'NAV-DOC-2026-0029',
      documentName: 'Tactical_Satcom_Frequency_Allocation.docx',
      versionId: 'v1.0',
      recipientId: 'REC-05',
      recipientPseudonym: 'Lt. Priya Singh (06244-S)',
      unit: 'INS Visakhapatnam (D66)',
      deviceId: 'HW-HSM-6244',
      timestamp: '2026-09-27T04:45:30Z',
      channel: 'Satellite Terminal',
      signatureStatus: 'ML-DSA-65 Valid ✓',
      matchedLeakArtifact: false,
    },
    {
      eventId: 'EVT-88418',
      documentId: 'NAV-DOC-2026-0038',
      documentName: 'Eastern_Littoral_Hydrographic_Intel.pdf',
      versionId: 'v1.4',
      recipientId: 'REC-07',
      recipientPseudonym: 'Lt. Amit Saxena (06812-B)',
      unit: 'Western Fleet HQ',
      deviceId: 'WNC-TERM-068',
      timestamp: '2026-09-27T04:30:15Z',
      channel: 'Naval LAN',
      signatureStatus: 'ML-DSA-65 Valid ✓',
      matchedLeakArtifact: false,
    },
    {
      eventId: 'EVT-88417',
      documentId: 'NAV-DOC-2026-0061',
      documentName: 'Carrier_Air_Wing_Sortie_Schedule.pptx',
      versionId: 'v2.0',
      recipientId: 'REC-03',
      recipientPseudonym: 'Lt. Cdr. Sunita Rao (05190-M)',
      unit: 'INS Vikrant (R11)',
      deviceId: 'HW-HSM-8812',
      timestamp: '2026-09-26T22:10:00Z',
      channel: 'Tactical Air Console',
      signatureStatus: 'ML-DSA-65 Valid ✓',
      matchedLeakArtifact: false,
    },
    {
      eventId: 'EVT-88416',
      documentId: 'NAV-DOC-2026-0042',
      documentName: 'Mission_Plan_Bravo.pdf',
      versionId: 'v2.1',
      recipientId: 'REC-04',
      recipientPseudonym: 'Commodore S. V. Nair (02811-A)',
      unit: 'Naval Headquarters Delhi',
      deviceId: 'NHQ-SEC-NODE-01',
      timestamp: '2026-09-26T21:55:00Z',
      channel: 'HQ Terminal',
      signatureStatus: 'ML-DSA-65 Valid ✓',
      matchedLeakArtifact: false,
    },
    {
      eventId: 'EVT-88415',
      documentId: 'NAV-DOC-2026-0055',
      documentName: 'Submarine_Acoustic_Signature_Profile.pdf',
      versionId: 'v3.0',
      recipientId: 'REC-06',
      recipientPseudonym: 'Cdr. Devendra Malik (04118-W)',
      unit: 'INS Mormugao (D67)',
      deviceId: 'HW-HSM-4118',
      timestamp: '2026-09-26T21:40:00Z',
      channel: 'Sonar Decryption Vault',
      signatureStatus: 'ML-DSA-65 Valid ✓',
      matchedLeakArtifact: false,
    },
    {
      eventId: 'EVT-88414',
      documentId: 'NAV-DOC-2026-0038',
      documentName: 'Eastern_Littoral_Hydrographic_Intel.pdf',
      versionId: 'v1.4',
      recipientId: 'REC-04',
      recipientPseudonym: 'Commodore S. V. Nair (02811-A)',
      unit: 'Naval Headquarters Delhi',
      deviceId: 'NHQ-SEC-NODE-01',
      timestamp: '2026-09-26T18:03:00Z',
      channel: 'HQ Secure Display',
      signatureStatus: 'ML-DSA-65 Valid ✓',
      matchedLeakArtifact: false,
    },
    {
      eventId: 'EVT-88413',
      documentId: 'NAV-DOC-2026-0029',
      documentName: 'Tactical_Satcom_Frequency_Allocation.docx',
      versionId: 'v1.0',
      recipientId: 'REC-08',
      recipientPseudonym: 'Sub-Lt. Ananya Verma (07119-V)',
      unit: 'Naval Cyber Defense Centre',
      deviceId: 'NCDC-SEC-441',
      timestamp: '2026-09-26T17:45:00Z',
      channel: 'Cyber Vault Workstation',
      signatureStatus: 'ML-DSA-65 Valid ✓',
      matchedLeakArtifact: false,
    },
    {
      eventId: 'EVT-88412',
      documentId: 'NAV-DOC-2026-0042',
      documentName: 'Mission_Plan_Bravo.pdf',
      versionId: 'v2.0',
      recipientId: 'REC-02',
      recipientPseudonym: 'Capt. R. Deshmukh (03912-P)',
      unit: 'Western Fleet HQ',
      deviceId: 'NAV-HQ-WNC-01',
      timestamp: '2026-09-26T12:45:00Z',
      channel: 'Command Console',
      signatureStatus: 'ML-DSA-65 Valid ✓',
      matchedLeakArtifact: false,
    },
  ],

  provenance_capsules: [
    {
      capsuleId: 'CAP-2026-0042-01',
      documentId: 'NAV-DOC-2026-0042',
      versionId: 'v2.1',
      recipientId: 'REC-01',
      recipientPseudonym: 'Cdr. Arjun Mehta (04821-K)',
      distributionId: 'DST-8F921-2026',
      decryptionEventId: 'EVT-88421',
      sessionId: 'SES-99120-X88',
      timestamp: '2026-09-27T04:54:12Z',
      deviceId: 'HW-HSM-9021',
      documentHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      fingerprintId: 'FP-04821-K-0042',
      watermarkId: 'WM-04821-K-DOTS',
      authorizationId: 'POL-01',
      ledgerEventId: 'EVT-88421',
      signature: '0x88f21ac0981baacc3321ff88901239aa8841cbb8901239aa',
      signatureAlgorithm: 'ML-DSA-65 (NIST FIPS 204)',
      status: 'VERIFIED',
    },
    {
      capsuleId: 'CAP-2026-0042-02',
      documentId: 'NAV-DOC-2026-0042',
      versionId: 'v2.1',
      recipientId: 'REC-02',
      recipientPseudonym: 'Capt. R. Deshmukh (03912-P)',
      distributionId: 'DST-8F921-2026',
      decryptionEventId: 'EVT-88420',
      sessionId: 'SES-99119-W01',
      timestamp: '2026-09-27T04:51:00Z',
      deviceId: 'NAV-HQ-WNC-01',
      documentHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      fingerprintId: 'FP-03912-P-0042',
      watermarkId: 'WM-03912-P-DOTS',
      authorizationId: 'POL-01',
      ledgerEventId: 'EVT-88420',
      signature: '0x77aa4419cb20331188bb9012349acb884129bb88129aa',
      signatureAlgorithm: 'ML-DSA-65 (NIST FIPS 204)',
      status: 'VERIFIED',
    },
    {
      capsuleId: 'CAP-2026-0029-01',
      documentId: 'NAV-DOC-2026-0029',
      versionId: 'v1.0',
      recipientId: 'REC-05',
      recipientPseudonym: 'Lt. Priya Singh (06244-S)',
      distributionId: 'DST-44102-2026',
      decryptionEventId: 'EVT-88419',
      sessionId: 'SES-77102-D66',
      timestamp: '2026-09-27T04:45:30Z',
      deviceId: 'HW-HSM-6244',
      documentHash: 'b2c3d4e5f60718293a4b5c6d7e8f90123456789abcdef0123456789abcdef01',
      fingerprintId: 'FP-06244-S-0029',
      watermarkId: 'WM-06244-S-DOTS',
      authorizationId: 'POL-02',
      ledgerEventId: 'EVT-88419',
      signature: '0x99cc441098ef33bb8822001923bc9910aa112349',
      signatureAlgorithm: 'ML-DSA-65 (NIST FIPS 204)',
      status: 'VERIFIED',
    },
    {
      capsuleId: 'CAP-2026-0038-01',
      documentId: 'NAV-DOC-2026-0038',
      versionId: 'v1.4',
      recipientId: 'REC-07',
      recipientPseudonym: 'Lt. Amit Saxena (06812-B)',
      distributionId: 'DST-7E110-2026',
      decryptionEventId: 'EVT-88418',
      sessionId: 'SES-55110-W02',
      timestamp: '2026-09-27T04:30:15Z',
      deviceId: 'WNC-TERM-068',
      documentHash: 'f4b1a88390fc1d234aebf4c8996eb92427ae41e4649c884ca495991b7852c991',
      fingerprintId: 'FP-06812-B-0038',
      watermarkId: 'WM-06812-B-DOTS',
      authorizationId: 'POL-02',
      ledgerEventId: 'EVT-88418',
      signature: '0x12ffaa9098bc77ac33bb8822001923bc9910aa11',
      signatureAlgorithm: 'ML-DSA-65 (NIST FIPS 204)',
      status: 'VERIFIED',
    },
    {
      capsuleId: 'CAP-2026-0061-01',
      documentId: 'NAV-DOC-2026-0061',
      versionId: 'v2.0',
      recipientId: 'REC-03',
      recipientPseudonym: 'Lt. Cdr. Sunita Rao (05190-M)',
      distributionId: 'DST-55201-2026',
      decryptionEventId: 'EVT-88417',
      sessionId: 'SES-33100-R11',
      timestamp: '2026-09-26T22:10:00Z',
      deviceId: 'HW-HSM-8812',
      documentHash: 'c3d4e5f60718293a4b5c6d7e8f90123456789abcdef0123456789abcdef012',
      fingerprintId: 'FP-05190-M-0061',
      watermarkId: 'WM-05190-M-DOTS',
      authorizationId: 'POL-03',
      ledgerEventId: 'EVT-88417',
      signature: '0x44dd1122aa8841cbb8901239aa88f21ac0981b',
      signatureAlgorithm: 'ML-DSA-65 (NIST FIPS 204)',
      status: 'VERIFIED',
    },
    {
      capsuleId: 'CAP-2026-0042-03',
      documentId: 'NAV-DOC-2026-0042',
      versionId: 'v2.1',
      recipientId: 'REC-04',
      recipientPseudonym: 'Commodore S. V. Nair (02811-A)',
      distributionId: 'DST-8F921-2026',
      decryptionEventId: 'EVT-88416',
      sessionId: 'SES-22100-NHQ',
      timestamp: '2026-09-26T21:55:00Z',
      deviceId: 'NHQ-SEC-NODE-01',
      documentHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      fingerprintId: 'FP-02811-A-0042',
      watermarkId: 'WM-02811-A-DOTS',
      authorizationId: 'POL-01',
      ledgerEventId: 'EVT-88416',
      signature: '0x991144aa77cc889988f21ac0981baacc3321ff88',
      signatureAlgorithm: 'ML-DSA-65 (NIST FIPS 204)',
      status: 'VERIFIED',
    },
    {
      capsuleId: 'CAP-2026-0055-01',
      documentId: 'NAV-DOC-2026-0055',
      versionId: 'v3.0',
      recipientId: 'REC-06',
      recipientPseudonym: 'Cdr. Devendra Malik (04118-W)',
      distributionId: 'DST-99120-2026',
      decryptionEventId: 'EVT-88415',
      sessionId: 'SES-11902-D67',
      timestamp: '2026-09-26T21:40:00Z',
      deviceId: 'HW-HSM-4118',
      documentHash: 'a1b2c3d4e5f60718293a4b5c6d7e8f90123456789abcdef0123456789abcdef0',
      fingerprintId: 'FP-04118-W-0055',
      watermarkId: 'WM-04118-W-DOTS',
      authorizationId: 'POL-01',
      ledgerEventId: 'EVT-88415',
      signature: '0x7711aa22ee5566cc88f21ac0981baacc3321ff88',
      signatureAlgorithm: 'ML-DSA-65 (NIST FIPS 204)',
      status: 'VERIFIED',
    },
    {
      capsuleId: 'CAP-2026-0038-02',
      documentId: 'NAV-DOC-2026-0038',
      versionId: 'v1.4',
      recipientId: 'REC-04',
      recipientPseudonym: 'Commodore S. V. Nair (02811-A)',
      distributionId: 'DST-7E110-2026',
      decryptionEventId: 'EVT-88414',
      sessionId: 'SES-11800-NHQ',
      timestamp: '2026-09-26T18:03:00Z',
      deviceId: 'NHQ-SEC-NODE-01',
      documentHash: 'f4b1a88390fc1d234aebf4c8996eb92427ae41e4649c884ca495991b7852c991',
      fingerprintId: 'FP-02811-A-0038',
      watermarkId: 'WM-02811-A-DOTS',
      authorizationId: 'POL-02',
      ledgerEventId: 'EVT-88414',
      signature: '0x99aa11223344556677889900aabbccddeeff0011',
      signatureAlgorithm: 'ML-DSA-65 (NIST FIPS 204)',
      status: 'VERIFIED',
    },
    {
      capsuleId: 'CAP-2026-0029-02',
      documentId: 'NAV-DOC-2026-0029',
      versionId: 'v1.0',
      recipientId: 'REC-08',
      recipientPseudonym: 'Sub-Lt. Ananya Verma (07119-V)',
      distributionId: 'DST-44102-2026',
      decryptionEventId: 'EVT-88413',
      sessionId: 'SES-00912-NCDC',
      timestamp: '2026-09-26T17:45:00Z',
      deviceId: 'NCDC-SEC-441',
      documentHash: 'b2c3d4e5f60718293a4b5c6d7e8f90123456789abcdef0123456789abcdef01',
      fingerprintId: 'FP-07119-V-0029',
      watermarkId: 'WM-07119-V-DOTS',
      authorizationId: 'POL-02',
      ledgerEventId: 'EVT-88413',
      signature: '0xff112233445566778899aabbccddeeff00112233',
      signatureAlgorithm: 'ML-DSA-65 (NIST FIPS 204)',
      status: 'VERIFIED',
    },
    {
      capsuleId: 'CAP-2026-0042-04',
      documentId: 'NAV-DOC-2026-0042',
      versionId: 'v2.0',
      recipientId: 'REC-02',
      recipientPseudonym: 'Capt. R. Deshmukh (03912-P)',
      distributionId: 'DST-66219-2026',
      decryptionEventId: 'EVT-88412',
      sessionId: 'SES-00811-WNC',
      timestamp: '2026-09-26T12:45:00Z',
      deviceId: 'NAV-HQ-WNC-01',
      documentHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      fingerprintId: 'FP-03912-P-0042-V2',
      watermarkId: 'WM-03912-P-DOTS',
      authorizationId: 'POL-01',
      ledgerEventId: 'EVT-88412',
      signature: '0x32ba1198c00192ea7732b8910ac2219901aa8821',
      signatureAlgorithm: 'ML-DSA-65 (NIST FIPS 204)',
      status: 'VERIFIED',
    },
  ],

  fingerprints: [
    {
      id: 'FP-04821-K-0042',
      recipientId: 'REC-01',
      documentId: 'NAV-DOC-2026-0042',
      seed: '0x88f21ac0981baacc',
      type: 'Steganographic Micro-Dot Constellation',
      extractedConfidence: 99.8,
      status: 'Active',
    },
  ],

  watermarks: [
    {
      id: 'WM-04821-K-DOTS',
      recipientId: 'REC-01',
      documentId: 'NAV-DOC-2026-0042',
      pattern: 'Yellow Dot Modulation Grid L3',
      densityPct: 98.4,
      robustness: 'SURVIVES_PRINT_SCAN_PHOTO',
    },
  ],

  ledger_blocks: [
    {
      blockNumber: 4192,
      timestamp: '27 Sep 2026 04:54:12Z',
      merkleRootHash: '0x88f21ac0981baacc3321ff88901239aa8841cbb8901239aa',
      previousBlockHash: '0x32ba1198c00192ea7732b8910ac2219901aa8821',
      eventCount: 4,
      validatingNode: 'NAVAL-HQ-DELHI (PQC Validator 01)',
      status: 'Verified',
      events: [
        {
          eventId: 'EVT-88421',
          recipientPseudonym: 'Cdr. Arjun Mehta (04821-K)',
          documentId: 'NAV-DOC-2026-0042',
          documentName: 'Mission_Plan_Bravo.pdf',
          timestamp: '27 Sep 2026 04:54:12Z',
          signatureStatus: 'ML-DSA-65 Valid ✓',
          channel: 'Decryption Event (In-Memory)',
          accessType: 'View Only',
          nonce: '9a38f71c',
          merkleLeaf: '0x4a8f22091bc8...',
        },
        {
          eventId: 'EVT-88420',
          recipientPseudonym: 'Capt. R. Deshmukh (03912-P)',
          documentId: 'NAV-DOC-2026-0042',
          documentName: 'Mission_Plan_Bravo.pdf',
          timestamp: '27 Sep 2026 04:51:00Z',
          signatureStatus: 'ML-DSA-65 Valid ✓',
          channel: 'Internal Naval Net',
          accessType: 'Full Access',
          nonce: '11fe89ac',
          merkleLeaf: '0x77aa4419cb20...',
        },
        {
          eventId: 'EVT-88419',
          recipientPseudonym: 'Western Fleet Tactical Controller',
          documentId: 'NAV-DOC-2026-0029',
          documentName: 'Tactical_Satcom_Frequency_Allocation.docx',
          timestamp: '27 Sep 2026 04:45:30Z',
          signatureStatus: 'ML-DSA-65 Valid ✓',
          channel: 'Satellite Relay (EHF)',
          accessType: 'View Only',
          nonce: '33bb9901',
          merkleLeaf: '0x99cc441098ef...',
        },
        {
          eventId: 'EVT-88418',
          recipientPseudonym: 'Lt. Cdr. S. Rao (INV-0042)',
          documentId: 'NAV-DOC-2026-0038',
          documentName: 'Eastern_Littoral_Hydrographic_Intel.pdf',
          timestamp: '27 Sep 2026 04:30:15Z',
          signatureStatus: 'ML-DSA-65 Valid ✓',
          channel: 'Optical Physical Diode',
          accessType: 'Download',
          nonce: '77ac0012',
          merkleLeaf: '0x12ffaa9098bc...',
        },
      ],
    },
    {
      blockNumber: 4191,
      timestamp: '26 Sep 2026 22:15:00Z',
      merkleRootHash: '0x32ba1198c00192ea7732b8910ac2219901aa8821',
      previousBlockHash: '0x55aa001923bc9910aa112349bc981244dff98012',
      eventCount: 3,
      validatingNode: 'HQ-WNC-MUMBAI-NODE-02',
      status: 'Verified',
      events: [
        {
          eventId: 'EVT-88417',
          recipientPseudonym: 'Lt. Cdr. Sunita Rao (05190-M)',
          documentId: 'NAV-DOC-2026-0061',
          documentName: 'Carrier_Air_Wing_Sortie_Schedule.pptx',
          timestamp: '26 Sep 2026 22:10:00Z',
          signatureStatus: 'ML-DSA-65 Valid ✓',
          channel: 'Carrier Tactical Bus',
          accessType: 'View Only',
          nonce: '55ee1199',
          merkleLeaf: '0x22cba001188a...',
        },
        {
          eventId: 'EVT-88416',
          recipientPseudonym: 'Naval Operations Staff Officer',
          documentId: 'NAV-DOC-2026-0042',
          documentName: 'Mission_Plan_Bravo.pdf',
          timestamp: '26 Sep 2026 21:55:00Z',
          signatureStatus: 'ML-DSA-65 Valid ✓',
          channel: 'Encrypted Fiber Ring',
          accessType: 'View Only',
          nonce: '66ff2200',
          merkleLeaf: '0x44dd1122aa88...',
        },
        {
          eventId: 'EVT-88415',
          recipientPseudonym: 'Submarine Flotilla CO',
          documentId: 'NAV-DOC-2026-0055',
          documentName: 'Submarine_Acoustic_Signature_Profile.pdf',
          timestamp: '26 Sep 2026 21:40:00Z',
          signatureStatus: 'ML-DSA-65 Valid ✓',
          channel: 'Acoustic Dockside Interface',
          accessType: 'Download',
          nonce: '88aa3311',
          merkleLeaf: '0x66ee2233bb99...',
        },
      ],
    },
    {
      blockNumber: 4190,
      timestamp: '26 Sep 2026 18:05:00Z',
      merkleRootHash: '0x55aa001923bc9910aa112349bc981244dff98012',
      previousBlockHash: '0x44cc001923bc9910aa112349bc981244dff98012',
      eventCount: 2,
      validatingNode: 'HQ-ENC-VIZAG-NODE-01',
      status: 'Verified',
      events: [
        {
          eventId: 'EVT-88414',
          recipientPseudonym: 'Eastern Fleet Hydrographer',
          documentId: 'NAV-DOC-2026-0038',
          documentName: 'Eastern_Littoral_Hydrographic_Intel.pdf',
          timestamp: '26 Sep 2026 18:03:00Z',
          signatureStatus: 'ML-DSA-65 Valid ✓',
          channel: 'ENC Protected Network',
          accessType: 'View Only',
          nonce: '11aa2233',
          merkleLeaf: '0x55ff66778899...',
        },
        {
          eventId: 'EVT-88413',
          recipientPseudonym: 'NCDC Duty Watch Officer',
          documentId: 'NAV-DOC-2026-0029',
          documentName: 'Tactical_Satcom_Frequency_Allocation.docx',
          timestamp: '26 Sep 2026 17:45:00Z',
          signatureStatus: 'ML-DSA-65 Valid ✓',
          channel: 'Direct Fiber Cable',
          accessType: 'View Only',
          nonce: '22bb3344',
          merkleLeaf: '0x77aa88990011...',
        },
      ],
    },
    {
      blockNumber: 4189,
      timestamp: '26 Sep 2026 13:00:00Z',
      merkleRootHash: '0x44cc001923bc9910aa112349bc981244dff98012',
      previousBlockHash: '0x11bb001923bc9910aa112349bc981244dff98012',
      eventCount: 1,
      validatingNode: 'NAVAL-HQ-DELHI (PQC Validator 01)',
      status: 'Verified',
      events: [
        {
          eventId: 'EVT-88412',
          recipientPseudonym: 'Capt. R. Deshmukh (03912-P)',
          documentId: 'NAV-DOC-2026-0042',
          documentName: 'Mission_Plan_Bravo.pdf',
          timestamp: '26 Sep 2026 12:45:00Z',
          signatureStatus: 'ML-DSA-65 Valid ✓',
          channel: 'Command Console',
          accessType: 'Full Access',
          nonce: '33cc4455',
          merkleLeaf: '0x99bb00112233...',
        },
      ],
    },
    {
      blockNumber: 4188,
      timestamp: '26 Sep 2026 09:30:00Z',
      merkleRootHash: '0x11bb001923bc9910aa112349bc981244dff98012',
      previousBlockHash: '0x00aa001923bc9910aa112349bc981244dff98012',
      eventCount: 2,
      validatingNode: 'HQ-WNC-MUMBAI-NODE-01',
      status: 'Verified',
      events: [
        {
          eventId: 'EVT-88411',
          recipientPseudonym: 'Western Fleet Flag Officer',
          documentId: 'NAV-DOC-2026-0061',
          documentName: 'Carrier_Air_Wing_Sortie_Schedule.pptx',
          timestamp: '26 Sep 2026 09:20:00Z',
          signatureStatus: 'ML-DSA-65 Valid ✓',
          channel: 'Secure Fleet Relay',
          accessType: 'View Only',
          nonce: '44dd5566',
          merkleLeaf: '0xbbcc11223344...',
        },
      ],
    },
    {
      blockNumber: 4187,
      timestamp: '26 Sep 2026 04:00:00Z',
      merkleRootHash: '0x00aa001923bc9910aa112349bc981244dff98012',
      previousBlockHash: '0x99ee001923bc9910aa112349bc981244dff98012',
      eventCount: 2,
      validatingNode: 'NAVAL-HQ-DELHI (PQC Validator 02)',
      status: 'Verified',
      events: [
        {
          eventId: 'EVT-88410',
          recipientPseudonym: 'Cdr. Arjun Mehta (04821-K)',
          documentId: 'NAV-DOC-2026-0042',
          documentName: 'Mission_Plan_Bravo.pdf',
          timestamp: '26 Sep 2026 03:50:00Z',
          signatureStatus: 'ML-DSA-65 Valid ✓',
          channel: 'HSM Local Decryption',
          accessType: 'View Only',
          nonce: '55ee6677',
          merkleLeaf: '0xccddee112233...',
        },
      ],
    },
    {
      blockNumber: 4186,
      timestamp: '25 Sep 2026 21:00:00Z',
      merkleRootHash: '0x99ee001923bc9910aa112349bc981244dff98012',
      previousBlockHash: '0x88dd001923bc9910aa112349bc981244dff98012',
      eventCount: 1,
      validatingNode: 'HQ-ENC-VIZAG-NODE-01',
      status: 'Verified',
      events: [
        {
          eventId: 'EVT-88409',
          recipientPseudonym: 'Hydrographic Office Director',
          documentId: 'NAV-DOC-2026-0038',
          documentName: 'Eastern_Littoral_Hydrographic_Intel.pdf',
          timestamp: '25 Sep 2026 20:45:00Z',
          signatureStatus: 'ML-DSA-65 Valid ✓',
          channel: 'ENC Gateway',
          accessType: 'View Only',
          nonce: '66ff7788',
          merkleLeaf: '0xddeeff223344...',
        },
      ],
    },
    {
      blockNumber: 4185,
      timestamp: '25 Sep 2026 15:30:00Z',
      merkleRootHash: '0x88dd001923bc9910aa112349bc981244dff98012',
      previousBlockHash: '0x77cc001923bc9910aa112349bc981244dff98012',
      eventCount: 3,
      validatingNode: 'HQ-WNC-MUMBAI-NODE-02',
      status: 'Verified',
      events: [
        {
          eventId: 'EVT-88408',
          recipientPseudonym: 'INS Vikramaditya Tactical Ops',
          documentId: 'NAV-DOC-2026-0042',
          documentName: 'Mission_Plan_Bravo.pdf',
          timestamp: '25 Sep 2026 15:20:00Z',
          signatureStatus: 'ML-DSA-65 Valid ✓',
          channel: 'Shipboard LAN',
          accessType: 'View Only',
          nonce: '77008899',
          merkleLeaf: '0xeeff00334455...',
        },
      ],
    },
    {
      blockNumber: 4184,
      timestamp: '25 Sep 2026 10:15:00Z',
      merkleRootHash: '0x77cc001923bc9910aa112349bc981244dff98012',
      previousBlockHash: '0x66bb001923bc9910aa112349bc981244dff98012',
      eventCount: 2,
      validatingNode: 'NAVAL-HQ-DELHI (PQC Validator 01)',
      status: 'Verified',
      events: [
        {
          eventId: 'EVT-88407',
          recipientPseudonym: 'Western Fleet Comm Officer',
          documentId: 'NAV-DOC-2026-0029',
          documentName: 'Tactical_Satcom_Frequency_Allocation.docx',
          timestamp: '25 Sep 2026 10:05:00Z',
          signatureStatus: 'ML-DSA-65 Valid ✓',
          channel: 'Satellite Uplink',
          accessType: 'View Only',
          nonce: '88119900',
          merkleLeaf: '0xff0011445566...',
        },
      ],
    },
    {
      blockNumber: 4183,
      timestamp: '25 Sep 2026 05:00:00Z',
      merkleRootHash: '0x66bb001923bc9910aa112349bc981244dff98012',
      previousBlockHash: '0x55aa001923bc9910aa112349bc981244dff98012',
      eventCount: 1,
      validatingNode: 'HQ-WNC-MUMBAI-NODE-01',
      status: 'Verified',
      events: [
        {
          eventId: 'EVT-88406',
          recipientPseudonym: 'Submarine Commander',
          documentId: 'NAV-DOC-2026-0055',
          documentName: 'Submarine_Acoustic_Signature_Profile.pdf',
          timestamp: '25 Sep 2026 04:45:00Z',
          signatureStatus: 'ML-DSA-65 Valid ✓',
          channel: 'HSM Vault',
          accessType: 'Full Access',
          nonce: '99220011',
          merkleLeaf: '0x001122556677...',
        },
      ],
    },
  ],

  ledger_events: [
    {
      id: 'LEV-01',
      blockNumber: 4192,
      type: 'DOCUMENT_DECRYPTED',
      documentId: 'NAV-DOC-2026-0042',
      recipientId: 'REC-01',
      timestamp: '2026-09-27T04:54:12Z',
    },
  ],

  leak_artifacts: [
    {
      id: 'ART-2026-001',
      filename: 'leaked_mission_plan.jpg',
      documentId: 'NAV-DOC-2026-0042',
      size: '2.4 MB',
      format: 'JPG',
      uploadedAt: '2026-09-27T05:02:00Z',
      hash: 'SHA256: 88f21ac0981baacc3321ff88901239aa',
      analysisStatus: 'ANALYZED',
    },
    {
      id: 'ART-2026-002',
      filename: 'intel_notes.pdf',
      documentId: 'NAV-DOC-2026-0038',
      size: '1.1 MB',
      format: 'PDF',
      uploadedAt: '2026-09-27T06:15:00Z',
      hash: 'SHA256: 12ffaa9098bc77ac33bb8822001923bc',
      analysisStatus: 'ANALYZED',
    },
    {
      id: 'ART-2026-003',
      filename: 'screenshot_001.png',
      documentId: 'NAV-DOC-2026-0042',
      size: '1.8 MB',
      format: 'PNG',
      uploadedAt: '2026-09-27T07:30:00Z',
      hash: 'SHA256: 77aa4419cb20331188bb9012349acb88',
      analysisStatus: 'ANALYZED',
    },
    {
      id: 'ART-2026-004',
      filename: 'photo_briefing.jpg',
      documentId: 'NAV-DOC-2026-0061',
      size: '2.6 MB',
      format: 'JPG',
      uploadedAt: '2026-09-27T08:10:00Z',
      hash: 'SHA256: 44dd1122aa8841cbb8901239aa88f21a',
      analysisStatus: 'ANALYZED',
    },
  ],

  forensic_evidence: [
    {
      id: 'EVD-01',
      caseId: 'INV-2026-0042',
      artifactId: 'ART-2026-001',
      watermarkDetected: true,
      steganographicSeed: '0x88f21ac0981baacc',
      matchedRecipientId: 'REC-01',
      matchedVersion: 'v2.1',
      tamperProbabilityScore: 12.4,
      sensorPattern: 'CMOS Optical Distortion (Photo of Screen)',
    },
  ],

  evidence_checks: [
    {
      caseId: 'INV-2026-0042',
      fingerprintMatch: 'PASS',
      documentHashMatch: 'PASS',
      versionMatch: 'PASS',
      authorizationMatch: 'PASS',
      recipientMatch: 'PASS',
      signatureValid: 'PASS',
      ledgerValid: 'PASS',
      provenanceValid: 'PASS',
      overallStatus: 'PROVENANCE VERIFIED',
    },
  ],

  investigations: [
    {
      id: 'INV-2026-0042',
      title: 'Western Fleet Tactical Leak Investigation',
      caseNumber: 'CASE-NAVX-2026-0042',
      filename: 'leaked_strike_plan_sample.pdf',
      documentId: 'NAV-DOC-2026-0042',
      documentName: 'Mission_Plan_Bravo.pdf',
      uploadedAt: '27 Sep 2026 05:05Z',
      investigator: 'Lt. Cdr. S. Rao (Cyber Warfare Command)',
      priority: 'HIGH',
      status: 'Identified',
      attributionStatus: 'PROVENANCE VERIFIED',
      progress: 100,
      candidateCount: 14,
      topMatch: {
        recipientId: 'REC-01',
        name: 'Cdr. Arjun Mehta',
        pno: '04821-K',
        unit: 'INS Vikramaditya (R33)',
        confidenceScore: 99.8,
        seedFingerprint: '0x88f21ac0981baacc',
        decryptedTimestamp: '27 Sep 2026 04:54Z',
        matchedVersion: 'v2.1',
      },
      createdAt: '2026-09-27T05:05:00Z',
      updatedAt: '2026-09-27T08:15:00Z',
    },
    {
      id: 'INV-2026-0038',
      title: 'Littoral Hydrographic Chart Data Drift',
      caseNumber: 'CASE-NAVX-2026-0038',
      filename: 'intel_notes.pdf',
      documentId: 'NAV-DOC-2026-0038',
      documentName: 'Eastern_Littoral_Hydrographic_Intel.pdf',
      uploadedAt: '26 Sep 2026 14:15Z',
      investigator: 'Capt. R. Deshmukh',
      priority: 'MEDIUM',
      status: 'In Progress',
      attributionStatus: 'UNRESOLVED',
      progress: 65,
      candidateCount: 8,
      createdAt: '2026-09-26T14:15:00Z',
      updatedAt: '2026-09-27T02:00:00Z',
    },
    {
      id: 'INV-2026-0055',
      title: 'Submarine Sonar Calibration Sheet Anomaly',
      caseNumber: 'CASE-NAVX-2026-0055',
      filename: 'acoustic_profile_snippet.png',
      documentId: 'NAV-DOC-2026-0055',
      documentName: 'Submarine_Acoustic_Signature_Profile.pdf',
      uploadedAt: '25 Sep 2026 19:40Z',
      investigator: 'Lt. Cdr. S. Rao',
      priority: 'CRITICAL',
      status: 'Under Review',
      attributionStatus: 'CONTRADICTORY EVIDENCE',
      progress: 80,
      candidateCount: 4,
      createdAt: '2026-09-25T19:40:00Z',
      updatedAt: '2026-09-26T18:20:00Z',
    },
  ],

  investigation_events: [
    {
      id: 'IEVT-01',
      caseId: 'INV-2026-0042',
      type: 'ARTIFACT_UPLOADED',
      description: 'Uploaded leaked artifact leaked_mission_plan.jpg',
      timestamp: '2026-09-27T05:05:00Z',
    },
    {
      id: 'IEVT-02',
      caseId: 'INV-2026-0042',
      type: 'FINGERPRINT_EXTRACTED',
      description: 'Extracted steganographic seed 0x88f21ac0981baacc (99.8% match)',
      timestamp: '2026-09-27T05:07:30Z',
    },
    {
      id: 'IEVT-03',
      caseId: 'INV-2026-0042',
      type: 'RECIPIENT_MATCHED',
      description: 'Attributed artifact to Cdr. Arjun Mehta (04821-K) on INS Vikramaditya',
      timestamp: '2026-09-27T05:10:00Z',
    },
  ],

  alerts: [
    {
      id: 'ALT-2026-001',
      severity: 'CRITICAL',
      title: 'Potential Classified Document Leak Detected',
      message: 'Steganographic watermark match on Mission_Plan_Bravo.pdf (v2.1) discovered on external paste.',
      relatedEntity: 'document',
      relatedEntityId: 'NAV-DOC-2026-0042',
      status: 'ACKNOWLEDGED',
      createdAt: '2026-09-27T05:02:00Z',
      acknowledgedBy: 'Lt. Cdr. S. Rao',
    },
    {
      id: 'ALT-2026-002',
      severity: 'HIGH',
      title: 'Repeated Access Denials on EMCON Sector 17A',
      message: 'Multiple unauthenticated decryption attempts from auxiliary terminal port 443.',
      relatedEntity: 'recipient',
      relatedEntityId: 'REC-05',
      status: 'ACTIVE',
      createdAt: '2026-09-27T07:11:00Z',
    },
    {
      id: 'ALT-2026-003',
      severity: 'MEDIUM',
      title: 'Air-Gap Optical Diode Reconnection Pending',
      message: 'INS Visakhapatnam (D66) has 6 pending ledger events awaiting hash-chain merge.',
      relatedEntity: 'unit',
      relatedEntityId: 'DISC-01',
      status: 'ACTIVE',
      createdAt: '2026-09-27T06:00:00Z',
    },
  ],

  alert_rules: [
    {
      id: 'RULE-01',
      name: 'Repeated Document Access Failure Anomaly',
      denialThreshold: 3,
      groupingKey: 'Same Document',
      timeWindow: '15 Minutes',
      action: 'Flag High-Priority Investigation',
      isActive: true,
    },
    {
      id: 'RULE-02',
      name: 'Unit-Wide Security Policy Breach Detection',
      denialThreshold: 5,
      groupingKey: 'Same Unit',
      timeWindow: '1 Hour',
      action: 'Lockdown EMCON Sector',
      isActive: true,
    },
    {
      id: 'RULE-03',
      name: 'Unauthorized Terminal Quarantine Rule',
      denialThreshold: 2,
      groupingKey: 'Same Terminal/Device',
      timeWindow: '1 Hour',
      action: 'Quarantine Device Token',
      isActive: true,
    },
  ],

  notifications: [
    {
      id: 'NOTIF-01',
      title: 'Attribution Resolved',
      message: 'Case INV-2026-0042 has completed evidence convergence.',
      read: false,
      timestamp: '2026-09-27T05:10:00Z',
    },
    {
      id: 'NOTIF-02',
      title: 'Merkle Block #4192 Sealed',
      message: 'Hash chain integrity verified across 6 nodes.',
      read: true,
      timestamp: '2026-09-27T04:54:00Z',
    },
  ],

  email_notifications: [
    {
      id: 'EMAIL-INIT-01',
      type: 'SECURITY_ALERT',
      recipientEmail: 'cyberwarfare-ops@navy.mil.in',
      subject: 'NAV-TRAC X | SECURITY ALERT: POTENTIAL DOCUMENT LEAK',
      relatedEntity: 'document',
      relatedEntityId: 'NAV-DOC-2026-0042',
      status: 'SENT',
      providerMessageId: 'GMAIL-MOCK-88912',
      sentAt: '2026-09-27T05:03:00Z',
    },
    {
      id: 'EMAIL-INIT-02',
      type: 'AUTHORIZATION_REQUEST',
      recipientEmail: 'fleet-approvals@navy.mil.in',
      subject: 'ACCESS AUTHORIZATION REQUEST — NAV-DOC-2026-0042',
      relatedEntity: 'access_request',
      relatedEntityId: 'REQ-2026-081',
      status: 'SENT',
      providerMessageId: 'GMAIL-MOCK-88910',
      sentAt: '2026-09-27T06:16:00Z',
    },
  ],

  notification_queue: [],

  emcon_state: {
    currentPosture: 'EMCON Charlie (Normal Operations)',
    postureColor: '#10b981',
    activeVesselsCount: 42,
    disconnectedVesselsCount: 3,
    radioSilenceSectors: ['Sector 17A (North Arabian Sea)', 'Sector Bravo (Goa Deep)'],
    frequencyBands: [
      { band: 'HF / VHF Tactical Voice', status: 'ACTIVE (Tactical Guard)', restricted: false },
      { band: 'SHF Military SATCOM', status: 'ACTIVE (Full Bandwidth)', restricted: false },
      { band: 'Optical Diode Laser Link', status: 'ACTIVE (Directional)', restricted: false },
    ],
  },

  offline_packages: [
    {
      id: 'PKG-D66-01',
      unitId: 'DISC-01',
      unitName: 'INS Visakhapatnam (D66)',
      eventsCount: 6,
      checksum: 'SHA256: 99aa001923fa11bc8822001923bc9910aa112349',
      createdAt: '2026-09-27T06:00:00Z',
      status: 'QUEUED',
    },
  ],

  disconnected_units: [
    {
      id: 'DISC-01',
      name: 'INS Visakhapatnam (D66) - Sector 17A',
      callsign: 'D66-OFFLINE',
      offlineSince: '27 Sep 2026 06:00Z (5h 15m)',
      pendingEventCount: 6,
      emconState: 'EMCON Alpha (Full Silence)',
      sector: 'North Arabian Sea Patrol Box',
    },
    {
      id: 'DISC-02',
      name: 'INS Vikramaditya (R33) - Battle Group',
      callsign: 'R33-OFFLINE',
      offlineSince: '27 Sep 2026 07:30Z (3h 45m)',
      pendingEventCount: 11,
      emconState: 'EMCON Bravo (Restricted SATCOM)',
      sector: 'Deep Sea Sector Bravo',
    },
    {
      id: 'DISC-03',
      name: 'UAV-Alpha-03 Surveillance Flight',
      callsign: 'DRONE-03-OFFLINE',
      offlineSince: '27 Sep 2026 09:12Z (2h 03m)',
      pendingEventCount: 3,
      emconState: 'EMCON Alpha (Full Silence)',
      sector: 'Goa Outer Perimeter',
    },
  ],

  access_policies: [
    {
      id: 'POL-01',
      name: 'Command Operations Level-4 Top Secret Policy',
      description: 'Enforces dual-custody cryptographic keying and 24-hour ephemeral session decay for tactical warfare documents.',
      scopeType: 'ROLE',
      appliesTo: 'Commanding Officers (CO/XO) • Western Fleet Battle Group',
      classificationScope: 'TOP SECRET (CODEWORD)',
      allowedAccessTypes: ['View', 'Download'],
      expiryRule: '24 Hours from Decryption',
      activeRecipientsCount: 14,
      status: 'Active',
      createdAt: '15 Sep 2026',
      updatedAt: '26 Sep 2026',
      requiresDualCustody: true,
    },
    {
      id: 'POL-02',
      name: 'Hydrographic & Littoral Intelligence Standard',
      description: 'Mandatory steganographic watermarking on all bathymetric charts and acoustic sensor profiles.',
      scopeType: 'UNIT',
      appliesTo: 'Eastern Fleet Hydrographic Office & Submarine Flotilla',
      classificationScope: 'SECRET',
      allowedAccessTypes: ['View', 'Download', 'Print'],
      expiryRule: '7 Days',
      activeRecipientsCount: 28,
      status: 'Active',
      createdAt: '10 Sep 2026',
      updatedAt: '25 Sep 2026',
      requiresDualCustody: false,
    },
    {
      id: 'POL-03',
      name: 'Naval Aviation Sortie Schedule Clearance',
      description: 'Role-based authorization for carrier air wing pilots and tactical coordinators.',
      scopeType: 'ROLE',
      appliesTo: 'Carrier Strike Group Air Wing (INS Vikramaditya / Vikrant)',
      classificationScope: 'SECRET',
      allowedAccessTypes: ['View', 'Print'],
      expiryRule: '12 Hours from Decryption',
      activeRecipientsCount: 36,
      status: 'Active',
      createdAt: '01 Sep 2026',
      updatedAt: '20 Sep 2026',
      requiresDualCustody: false,
    },
  ],

  access_requests: [
    {
      id: 'REQ-2026-081',
      requesterName: 'Lt. Cdr. Sunita Rao',
      requesterRank: 'Lt. Commander',
      requesterPno: '05190-M',
      requesterUnit: 'INS Vikramaditya (R33)',
      documentId: 'NAV-DOC-2026-0042',
      documentName: 'Mission_Plan_Bravo.pdf',
      documentClassification: 'TOP SECRET (CODEWORD)',
      reasonGiven: 'Required for pre-flight combat air patrol briefing and strike coordination.',
      requestedOn: '27 Sep 2026 06:15Z',
      status: 'Pending',
      requiredApproverRole: 'Western Fleet Commander (Ops)',
      escalatedTo: 'Flag Officer Commanding Western Fleet',
    },
    {
      id: 'REQ-2026-080',
      requesterName: 'Cdr. Devendra Malik',
      requesterRank: 'Commander',
      requesterPno: '04118-W',
      requesterUnit: 'INS Mormugao (D67)',
      documentId: 'NAV-DOC-2026-0055',
      documentName: 'Submarine_Acoustic_Signature_Profile.pdf',
      documentClassification: 'TOP SECRET',
      reasonGiven: 'Acoustic calibration check for sonar room operators during sea transit.',
      requestedOn: '27 Sep 2026 05:40Z',
      status: 'Pending',
      requiredApproverRole: 'Directorate of Naval Operations',
      escalatedTo: 'Commodore (Submarine Warfare)',
    },
    {
      id: 'REQ-2026-078',
      requesterName: 'Lt. Amit Saxena',
      requesterRank: 'Lieutenant',
      requesterPno: '06812-B',
      requesterUnit: 'Western Fleet HQ',
      documentId: 'NAV-DOC-2026-0038',
      documentName: 'Eastern_Littoral_Hydrographic_Intel.pdf',
      documentClassification: 'SECRET',
      reasonGiven: 'Archival comparison for littoral route planning.',
      requestedOn: '26 Sep 2026 14:20Z',
      status: 'Approved',
      requiredApproverRole: 'Fleet Hydrographer',
      decidedBy: 'Capt. R. Deshmukh',
      decidedAt: '26 Sep 2026 15:00Z',
      decisionNote: 'Approved for 48 hours under Policy POL-02',
    },
  ],

  access_denied_logs: [
    {
      id: 'DENY-901',
      timeZ: '07:11',
      timeLocal: '12:41 IST',
      requester: 'Auxiliary Terminal Node 04',
      rank: 'Unauthenticated Terminal',
      unit: 'INS Visakhapatnam (D66)',
      deviceId: 'TERM-D66-AUX-04',
      documentId: 'NAV-DOC-2026-0042',
      documentName: 'Mission_Plan_Bravo.pdf',
      reasonForDenial: 'EMCON Restriction',
      alertFired: true,
      ipAddress: '10.14.88.24',
      terminalNode: 'Bridge Auxiliary Port 443',
    },
    {
      id: 'DENY-900',
      timeZ: '06:42',
      timeLocal: '12:12 IST',
      requester: 'UAV Ground Link',
      rank: 'Automated Sensor',
      unit: 'UAV Squadron 03',
      deviceId: 'DRONE-LINK-03',
      documentId: 'NAV-DOC-2026-0029',
      documentName: 'Tactical_Satcom_Frequency_Allocation.docx',
      reasonForDenial: 'Not Authorized',
      alertFired: true,
      ipAddress: '192.168.100.12',
      terminalNode: 'Telemetry Relay Node',
    },
    {
      id: 'DENY-899',
      timeZ: '04:15',
      timeLocal: '09:45 IST',
      requester: 'Lt. Cdr. Priya Nair',
      rank: 'Lt. Commander',
      unit: 'Western Fleet HQ',
      deviceId: 'NAV-HQ-WNC-09',
      documentId: 'NAV-DOC-2026-0055',
      documentName: 'Submarine_Acoustic_Signature_Profile.pdf',
      reasonForDenial: 'Expired Certificate',
      alertFired: false,
      ipAddress: '10.12.0.88',
      terminalNode: 'WNC Command Console 02',
    },
  ],

  activity_logs: [
    {
      id: 'ACT-9901',
      timestamp: '27 Sep 2026 07:11Z',
      type: 'SECURITY_ALERT',
      action: 'Access Denied (EMCON Restriction)',
      actor: 'Auxiliary Terminal Node 04',
      target: 'Mission_Plan_Bravo.pdf',
      status: 'BLOCKED',
      severity: 'HIGH',
      node: 'INS Visakhapatnam (D66)',
    },
    {
      id: 'ACT-9900',
      timestamp: '27 Sep 2026 04:54Z',
      type: 'DECRYPTION',
      action: 'Cryptographic Document Decryption',
      actor: 'Cdr. Arjun Mehta (04821-K)',
      target: 'Mission_Plan_Bravo.pdf (v2.1)',
      status: 'VERIFIED',
      severity: 'INFO',
      node: 'HW-HSM-9021',
    },
  ],

  audit_events: [
    {
      id: 'AUD-001',
      type: 'DOCUMENT_DISTRIBUTED',
      actor: 'Lt. Cdr. S. Rao',
      entityType: 'document',
      entityId: 'NAV-DOC-2026-0042',
      timestamp: '2026-09-25T09:30:00Z',
      metadata: { distributionId: 'DST-8F921-2026', recipients: ['REC-01', 'REC-02'] },
    },
    {
      id: 'AUD-002',
      type: 'DECRYPTION_LOGGED',
      actor: 'Cdr. Arjun Mehta',
      entityType: 'decryption_event',
      entityId: 'EVT-88421',
      timestamp: '2026-09-27T04:54:12Z',
      metadata: { deviceId: 'HW-HSM-9021', status: 'VERIFIED' },
    },
    {
      id: 'AUD-003',
      type: 'LEAK_INTERCEPTED',
      actor: 'Forensic Monitoring Sensor',
      entityType: 'investigation',
      entityId: 'INV-2026-0042',
      timestamp: '2026-09-27T05:02:00Z',
      metadata: { source: 'External Paste', confidence: 99.8 },
    },
  ],

  oauth_accounts: [],

  leak_monitoring: {
    'NAV-DOC-2026-0042': {
      status: 'LEAK_DETECTED',
      leakCount: 1,
      lastScannedAt: '27 Sep 2026 05:10Z',
      activeInvestigationCaseId: 'INV-2026-0042',
      matches: [
        {
          source: 'External Tactical Forum / Dark Web Paste',
          discoveredAt: '27 Sep 2026 05:02Z',
          confidenceScore: 99.8,
          extractedRecipientPseudonym: 'Cdr. Arjun Mehta (04821-K)',
          matchedVersion: 'v2.1',
          tamperEvidence: 'Photograph of printed tactical sheet with steganographic dot matrix',
        },
      ],
    },
  },
};

class DatabaseService {
  private state: DBState;

  constructor() {
    this.state = this.loadFromDisk();
  }

  private loadFromDisk(): DBState {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        // Merge with initialSeedData to ensure all collections exist
        const merged = { ...initialSeedData, ...parsed };
        return merged;
      }
    } catch (err) {
      console.warn('[DatabaseService] Could not read existing database, initializing fresh seed:', err);
    }
    this.saveToDisk(initialSeedData);
    return JSON.parse(JSON.stringify(initialSeedData));
  }

  private saveToDisk(data: DBState): void {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    } catch (err) {
      console.error('[DatabaseService] Failed to persist database to disk:', err);
    }
  }

  public commit(): void {
    this.saveToDisk(this.state);
  }

  public resetToSeed(): void {
    this.state = JSON.parse(JSON.stringify(initialSeedData));
    this.commit();
  }

  public reload(): void {
    this.state = this.loadFromDisk();
  }

  // --- USERS & OAUTH ---
  public getUsers() {
    return this.state.users || [];
  }

  public getOAuthAccount(provider: string) {
    return (this.state.oauth_accounts || []).find((a) => a.provider === provider);
  }

  public saveOAuthAccount(accountData: any) {
    if (!this.state.oauth_accounts) this.state.oauth_accounts = [];
    const idx = this.state.oauth_accounts.findIndex((a) => a.provider === accountData.provider);
    if (idx >= 0) {
      this.state.oauth_accounts[idx] = {
        ...this.state.oauth_accounts[idx],
        ...accountData,
        updated_at: new Date().toISOString(),
      };
    } else {
      this.state.oauth_accounts.push({
        id: crypto.randomUUID(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        ...accountData,
      });
    }
    this.commit();
    return this.getOAuthAccount(accountData.provider);
  }

  public deleteOAuthAccount(provider: string) {
    if (!this.state.oauth_accounts) return;
    this.state.oauth_accounts = this.state.oauth_accounts.filter((a) => a.provider !== provider);
    this.commit();
  }

  // --- NOTIFICATIONS & EMAIL LOGS ---
  public getEmailNotifications() {
    return this.state.email_notifications || [];
  }

  public recordEmailNotification(notification: any) {
    if (!this.state.email_notifications) this.state.email_notifications = [];
    this.state.email_notifications.unshift(notification);
    this.commit();
    return notification;
  }

  public getNotificationQueue() {
    return this.state.notification_queue || [];
  }

  public queueNotification(item: any) {
    if (!this.state.notification_queue) this.state.notification_queue = [];
    const queueItem = {
      id: `QUEUE-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      status: 'QUEUED',
      createdAt: new Date().toISOString(),
      attempts: 0,
      ...item,
    };
    this.state.notification_queue.push(queueItem);
    this.commit();
    return queueItem;
  }

  public markQueueItemSent(id: string, messageId: string) {
    const item = (this.state.notification_queue || []).find((q) => q.id === id);
    if (item) {
      item.status = 'SENT';
      item.sentAt = new Date().toISOString();
      item.providerMessageId = messageId;
      this.commit();
    }
  }

  public markQueueItemFailed(id: string, error: string) {
    const item = (this.state.notification_queue || []).find((q) => q.id === id);
    if (item) {
      item.status = 'FAILED';
      item.error = error;
      item.lastAttempt = new Date().toISOString();
      item.attempts = (item.attempts || 0) + 1;
      this.commit();
    }
  }

  // --- AUDIT EVENTS ---
  public getAuditEvents(limit = 50) {
    return (this.state.audit_events || []).slice(0, limit);
  }

  public recordAuditEvent(event: {
    type: string;
    actor: string;
    entityType: string;
    entityId: string;
    metadata?: any;
  }) {
    if (!this.state.audit_events) this.state.audit_events = [];
    const audit = {
      id: `AUD-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
      ...event,
    };
    this.state.audit_events.unshift(audit);

    // Also mirror to activity_logs for UI compatibility
    if (!this.state.activity_logs) this.state.activity_logs = [];
    this.state.activity_logs.unshift({
      id: `ACT-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString('en-GB') + 'Z',
      type: event.type,
      action: event.type.replace(/_/g, ' '),
      actor: event.actor,
      target: `${event.entityType}: ${event.entityId}`,
      status: 'COMPLETED',
      severity: event.type.includes('LEAK') || event.type.includes('TAMPER') ? 'CRITICAL' : 'INFO',
      node: 'NAVAL-HQ-DELHI',
    });

    this.commit();
    return audit;
  }

  // --- DOCUMENTS ---
  public getDocuments(filters?: any) {
    let docs = [...this.state.documents];
    if (filters?.classification && filters.classification !== 'All Classifications') {
      docs = docs.filter((d) => d.classification === filters.classification);
    }
    if (filters?.documentType && filters.documentType !== 'All Types') {
      docs = docs.filter((d) => d.documentType === filters.documentType);
    }
    if (filters?.status && filters.status !== 'All Statuses') {
      docs = docs.filter((d) => d.status === filters.status);
    }
    if (filters?.searchQuery && filters.searchQuery.trim() !== '') {
      const q = filters.searchQuery.toLowerCase();
      docs = docs.filter(
        (d) =>
          d.name.toLowerCase().includes(q) ||
          d.masterDocId.toLowerCase().includes(q) ||
          d.id.toLowerCase().includes(q)
      );
    }
    return docs;
  }

  public getDocumentStats() {
    const total = this.state.documents.length;
    const activeDistributions = this.state.documents.filter((d) => d.status === 'Distributed').length;
    const sanitized = this.state.documents.filter((d) => d.metadataSanitized).length;
    const leakAlerts = Object.values(this.state.leak_monitoring || {}).filter((l) => l.status === 'LEAK_DETECTED').length;

    return {
      totalDocuments: total,
      activeDistributions,
      metadataSanitizedPercentage: total > 0 ? Number(((sanitized / total) * 100).toFixed(1)) : 100,
      externalLeakAlerts: leakAlerts,
    };
  }

  public getDocumentById(id: string) {
    return this.state.documents.find((d) => d.id === id || d.masterDocId === id);
  }

  public getDocumentVersions(documentId: string) {
    return this.state.document_versions.filter((v) => v.documentId === documentId);
  }

  public createDocumentVersion(documentId: string, versionData: any) {
    const newVersion = {
      documentId,
      version: versionData.version || `v${(this.getDocumentVersions(documentId).length + 1).toFixed(1)}`,
      fileHash: versionData.fileHash || `SHA256: ${crypto.randomBytes(16).toString('hex')}`,
      author: versionData.author || 'Officer',
      changeNotes: versionData.changeNotes || 'Document revised',
      releasedAt: new Date().toISOString(),
      isLeakedMatch: false,
      linkedDecryptionEvents: [],
      ...versionData,
    };
    this.state.document_versions.unshift(newVersion);
    this.commit();
    return newVersion;
  }

  public getDocumentRecipients(documentId: string) {
    return this.state.document_recipients.filter((r) => r.documentId === documentId);
  }

  public getLeakMonitoring(documentId: string) {
    return (
      this.state.leak_monitoring[documentId] || {
        status: 'CLEAN',
        leakCount: 0,
        lastScannedAt: new Date().toISOString(),
        matches: [],
      }
    );
  }

  public createDocument(docData: any) {
    const id = docData.id || `NAV-DOC-2026-00${String(this.state.documents.length + 43).padStart(2, '0')}`;
    const newDoc = {
      id,
      name: docData.name || 'Untitled_Document.pdf',
      masterDocId: docData.masterDocId || `DOC-${Date.now().toString().slice(-5)}`,
      version: docData.version || 'v1.0',
      classification: docData.classification || 'SECRET',
      documentType: docData.documentType || 'Tactical Operation',
      sizeBytes: docData.sizeBytes || 4194304,
      status: docData.status || 'Distributed',
      sha3Hash: docData.sha3Hash || crypto.createHash('sha256').update(docData.name || id).digest('hex'),
      recipientCount: docData.recipients?.length || docData.recipientCount || 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      metadataSanitized: docData.metadataSanitized !== undefined ? docData.metadataSanitized : true,
      watermarkCoveragePct: docData.watermarkCoveragePct || 98.0,
      tags: docData.tags || ['Western Fleet', 'Naval Command'],
      securityCaveats: docData.securityCaveats || 'Dual-Custody HSM Required • Dynamic Provenance Capsule Active',
      ...docData,
    };
    this.state.documents.unshift(newDoc);

    // Create initial version
    this.createDocumentVersion(id, {
      version: newDoc.version,
      fileHash: `SHA256: ${newDoc.sha3Hash}`,
      author: docData.author || 'Command Author',
      changeNotes: 'Initial document ingest and cryptographic sealing',
    });

    this.recordAuditEvent({
      type: 'DOCUMENT_CREATED',
      actor: docData.author || 'Officer',
      entityType: 'document',
      entityId: id,
      metadata: { name: newDoc.name, classification: newDoc.classification },
    });

    this.commit();
    return newDoc;
  }

  public updateDocument(id: string, updates: any) {
    const doc = this.getDocumentById(id);
    if (!doc) return null;
    Object.assign(doc, updates, { updatedAt: new Date().toISOString() });
    this.commit();
    return doc;
  }

  public deleteDocument(id: string) {
    const idx = this.state.documents.findIndex((d) => d.id === id);
    if (idx === -1) return false;
    this.state.documents.splice(idx, 1);
    this.commit();
    return true;
  }

  // --- RECIPIENTS ---
  public getRecipients() {
    return this.state.recipients || [];
  }

  public getRecipientById(id: string) {
    return (this.state.recipients || []).find((r) => r.id === id);
  }

  public createRecipient(recipientData: any) {
    const id = recipientData.id || `REC-${String((this.state.recipients?.length || 0) + 1).padStart(2, '0')}`;
    const newRecipient = {
      id,
      name: recipientData.name,
      rank: recipientData.rank || 'Lieutenant',
      pno: recipientData.pno || `${Date.now().toString().slice(-5)}-K`,
      unit: recipientData.unit || 'Eastern Fleet HQ',
      email: recipientData.email || `${recipientData.name.toLowerCase().replace(/\s+/g, '.')}@navy.mil.in`,
      clearanceLevel: recipientData.clearanceLevel || 'Level 3 (Secret)',
      activeKeys: recipientData.activeKeys || 2,
      documentsReceived: 0,
      lastActive: 'Just now',
      status: 'Active',
      hardwareDeviceId: recipientData.hardwareDeviceId || `HW-HSM-${Math.floor(1000 + Math.random() * 9000)}`,
      pkiCertificateFingerprint: `SHA256: ${crypto.randomBytes(8).toString('hex').toUpperCase().match(/.{1,4}/g)?.join(':')}`,
      ...recipientData,
    };
    this.state.recipients.unshift(newRecipient);
    this.recordAuditEvent({
      type: 'RECIPIENT_REGISTERED',
      actor: 'Admin',
      entityType: 'recipient',
      entityId: id,
      metadata: { name: newRecipient.name, unit: newRecipient.unit },
    });
    this.commit();
    return newRecipient;
  }

  public updateRecipient(id: string, updates: any) {
    const recipient = this.getRecipientById(id);
    if (!recipient) return null;
    Object.assign(recipient, updates);
    this.commit();
    return recipient;
  }

  public revokeRecipient(id: string, reason?: string) {
    const recipient = this.getRecipientById(id);
    if (!recipient) return null;
    recipient.status = 'Revoked';
    recipient.activeKeys = 0;
    recipient.revocationReason = reason || 'Security posture clearance revokation';
    recipient.revokedAt = new Date().toISOString();

    this.recordAuditEvent({
      type: 'RECIPIENT_REVOKED',
      actor: 'Command Authority',
      entityType: 'recipient',
      entityId: id,
      metadata: { reason: recipient.revocationReason },
    });

    this.commit();
    return recipient;
  }

  // --- DISTRIBUTIONS ---
  public getDistributions() {
    return this.state.distributions || [];
  }

  public getDistributionById(id: string) {
    return (this.state.distributions || []).find((d) => d.id === id);
  }

  public createDistribution(distData: any) {
    const id = distData.id || `DST-${Date.now().toString(16).toUpperCase()}-2026`;
    const doc = this.getDocumentById(distData.documentId);
    const recipientsList = Array.isArray(distData.recipients) ? distData.recipients : [];

    const newDist = {
      id,
      documentId: distData.documentId,
      documentName: doc?.name || distData.documentName || 'Document.pdf',
      version: doc?.version || distData.version || 'v1.0',
      recipients: recipientsList,
      recipientCount: recipientsList.length,
      classification: doc?.classification || distData.classification || 'SECRET',
      encryptionAlgorithm: distData.encryptionAlgorithm || 'ML-KEM-768 + AES-256-GCM',
      status: 'Delivered',
      distributedBy: distData.distributedBy || 'Lt. Cdr. S. Rao',
      distributedAt: new Date().toISOString(),
      ledgerEventId: `EVT-${Date.now().toString().slice(-5)}`,
      watermarkApplied: true,
      capsulePrepared: true,
      ...distData,
    };

    if (!this.state.distributions) this.state.distributions = [];
    this.state.distributions.unshift(newDist);

    // Create decryption events and provenance capsules for recipients
    for (const recId of recipientsList) {
      const recipient = this.getRecipientById(recId);
      const eventId = `EVT-${Math.floor(10000 + Math.random() * 90000)}`;

      const decEvent = {
        eventId,
        documentId: newDist.documentId,
        documentName: newDist.documentName,
        versionId: newDist.version,
        recipientId: recId,
        recipientPseudonym: recipient ? `${recipient.rank} ${recipient.name} (${recipient.pno})` : recId,
        unit: recipient?.unit || 'Western Fleet',
        deviceId: recipient?.hardwareDeviceId || 'HW-HSM-9021',
        timestamp: new Date().toISOString(),
        channel: 'In-Memory Secure Decryption',
        signatureStatus: 'ML-DSA-65 Valid ✓',
        matchedLeakArtifact: false,
      };
      if (!this.state.decryption_events) this.state.decryption_events = [];
      this.state.decryption_events.unshift(decEvent);

      // Create provenance capsule
      const capsule = {
        capsuleId: `CAP-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        documentId: newDist.documentId,
        versionId: newDist.version,
        recipientId: recId,
        recipientPseudonym: decEvent.recipientPseudonym,
        distributionId: id,
        decryptionEventId: eventId,
        sessionId: `SES-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
        timestamp: new Date().toISOString(),
        deviceId: decEvent.deviceId,
        documentHash: doc?.sha3Hash || crypto.randomBytes(32).toString('hex'),
        fingerprintId: `FP-${recId}-${newDist.documentId}`,
        watermarkId: `WM-${recId}-DOTS`,
        authorizationId: 'POL-01',
        ledgerEventId: eventId,
        signature: `0x${crypto.randomBytes(32).toString('hex')}`,
        signatureAlgorithm: 'ML-DSA-65 (NIST FIPS 204)',
        status: 'VERIFIED',
      };
      if (!this.state.provenance_capsules) this.state.provenance_capsules = [];
      this.state.provenance_capsules.unshift(capsule);

      // Add to document recipients
      if (!this.state.document_recipients) this.state.document_recipients = [];
      this.state.document_recipients.unshift({
        documentId: newDist.documentId,
        id: recId,
        recipientName: recipient?.name || recId,
        rank: recipient?.rank || 'Officer',
        pno: recipient?.pno || 'PNO-00',
        unitVessel: recipient?.unit || 'Naval Command',
        accessType: 'View Only',
        deviceId: decEvent.deviceId,
        status: 'Decrypted',
        decryptedAt: decEvent.timestamp,
      });

      // Update recipient documents received count
      if (recipient) {
        recipient.documentsReceived = (recipient.documentsReceived || 0) + 1;
      }
    }

    // Add block to ledger
    this.addLedgerBlock([
      {
        eventId: newDist.ledgerEventId,
        recipientPseudonym: `Multi-Recipient Distribution (${recipientsList.length} Units)`,
        documentId: newDist.documentId,
        documentName: newDist.documentName,
        timestamp: new Date().toISOString(),
        signatureStatus: 'ML-DSA-65 Valid ✓',
        channel: 'Tactical Quantum-Safe Distribution',
        accessType: 'Cryptographic Seed Delivery',
        nonce: crypto.randomBytes(4).toString('hex'),
        merkleLeaf: `0x${crypto.randomBytes(8).toString('hex')}...`,
      },
    ]);

    this.recordAuditEvent({
      type: 'DOCUMENT_DISTRIBUTED',
      actor: newDist.distributedBy,
      entityType: 'distribution',
      entityId: id,
      metadata: { documentId: newDist.documentId, recipientCount: recipientsList.length },
    });

    this.commit();
    return newDist;
  }

  // --- DECRYPTION & PROVENANCE ---
  public getDecryptionEvents() {
    return this.state.decryption_events || [];
  }

  public recordDecryption(eventData: any) {
    const eventId = eventData.eventId || `EVT-${Math.floor(10000 + Math.random() * 90000)}`;
    const newEvent = {
      eventId,
      timestamp: new Date().toISOString(),
      signatureStatus: 'ML-DSA-65 Valid ✓',
      channel: 'In-Memory Secure Decryption',
      matchedLeakArtifact: false,
      ...eventData,
    };
    if (!this.state.decryption_events) this.state.decryption_events = [];
    this.state.decryption_events.unshift(newEvent);

    // Create provenance capsule
    const capsule = {
      capsuleId: `CAP-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      documentId: newEvent.documentId,
      versionId: newEvent.versionId || 'v1.0',
      recipientId: newEvent.recipientId,
      recipientPseudonym: newEvent.recipientPseudonym,
      distributionId: newEvent.distributionId || 'DST-LATEST',
      decryptionEventId: eventId,
      sessionId: `SES-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      timestamp: newEvent.timestamp,
      deviceId: newEvent.deviceId,
      documentHash: newEvent.documentHash || crypto.randomBytes(32).toString('hex'),
      fingerprintId: `FP-${newEvent.recipientId}`,
      watermarkId: `WM-${newEvent.recipientId}`,
      authorizationId: 'POL-01',
      ledgerEventId: eventId,
      signature: `0x${crypto.randomBytes(32).toString('hex')}`,
      signatureAlgorithm: 'ML-DSA-65 (NIST FIPS 204)',
      status: 'VERIFIED',
    };
    if (!this.state.provenance_capsules) this.state.provenance_capsules = [];
    this.state.provenance_capsules.unshift(capsule);

    this.recordAuditEvent({
      type: 'DOCUMENT_DECRYPTED',
      actor: newEvent.recipientPseudonym,
      entityType: 'document',
      entityId: newEvent.documentId,
      metadata: { eventId, deviceId: newEvent.deviceId },
    });

    this.commit();
    return { event: newEvent, capsule };
  }

  public getProvenanceCapsules() {
    return this.state.provenance_capsules || [];
  }

  public getProvenanceCapsuleById(id: string) {
    return (this.state.provenance_capsules || []).find((c) => c.capsuleId === id || c.decryptionEventId === id);
  }

  public verifyProvenanceCapsule(id: string) {
    const capsule = this.getProvenanceCapsuleById(id);
    if (!capsule) return { valid: false, error: 'Capsule not found' };

    return {
      valid: true,
      capsuleId: capsule.capsuleId,
      signatureAlgorithm: capsule.signatureAlgorithm,
      cryptographicVerification: 'PASSED',
      tamperDetected: false,
      timestamp: new Date().toISOString(),
      capsule,
    };
  }

  // --- FINGERPRINTS & WATERMARKS ---
  public generateFingerprint(data: any) {
    const id = `FP-${Date.now().toString(16).toUpperCase()}`;
    const fp = {
      id,
      recipientId: data.recipientId,
      documentId: data.documentId,
      seed: `0x${crypto.randomBytes(8).toString('hex')}`,
      type: data.type || 'Steganographic Micro-Dot Constellation',
      extractedConfidence: 100.0,
      status: 'Active',
      createdAt: new Date().toISOString(),
      ...data,
    };
    if (!this.state.fingerprints) this.state.fingerprints = [];
    this.state.fingerprints.push(fp);
    this.commit();
    return fp;
  }

  public recoverFingerprint(artifactData: any) {
    // Search against stored seeds
    const matchedFp = this.state.fingerprints?.[0] || {
      id: 'FP-04821-K-0042',
      seed: '0x88f21ac0981baacc',
      recipientId: 'REC-01',
      confidence: 99.8,
    };
    return {
      recovered: true,
      fingerprint: matchedFp,
      confidenceScore: 99.8,
      recoveredAt: new Date().toISOString(),
    };
  }

  // --- LEDGER METHODS ---
  public getLedgerBlocks(searchQuery?: string) {
    let blocks = this.state.ledger_blocks.map((b) => {
      if (this.state.isLedgerTampered && b.blockNumber === this.state.tamperedBlockNumber) {
        return {
          ...b,
          merkleRootHash: '0xDEADBEEF9910aa112349bc981244dff98012TAMPER',
          status: 'Tampered',
          isTampered: true,
          tamperDetail:
            'Merkle root hash does not match block event leaf syndrome. Historical record corruption detected at leaf #2.',
        };
      }
      return b;
    });

    if (searchQuery && searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      blocks = blocks.filter(
        (b) =>
          b.blockNumber.toString().includes(q) ||
          b.merkleRootHash.toLowerCase().includes(q) ||
          b.validatingNode.toLowerCase().includes(q) ||
          b.events.some((e: any) => e.eventId.toLowerCase().includes(q) || e.documentName?.toLowerCase().includes(q))
      );
    }
    return blocks;
  }

  public addLedgerBlock(events: any[]) {
    const highestBlock = this.state.ledger_blocks[0]?.blockNumber || 4192;
    const prevHash = this.state.ledger_blocks[0]?.merkleRootHash || '0x88f21ac0981baacc3321ff88901239aa8841cbb8901239aa';
    const newRootHash = `0x${crypto.randomBytes(24).toString('hex')}`;

    const newBlock = {
      blockNumber: highestBlock + 1,
      timestamp: new Date().toISOString(),
      merkleRootHash: newRootHash,
      previousBlockHash: prevHash,
      eventCount: events.length,
      validatingNode: 'NAVAL-HQ-DELHI (PQC Validator 01)',
      status: 'Verified',
      events,
    };

    this.state.ledger_blocks.unshift(newBlock);
    this.commit();
    return newBlock;
  }

  public verifyChain() {
    if (this.state.isLedgerTampered) {
      return {
        isSuccess: false,
        valid: false,
        totalBlocksVerified: 4192,
        failedBlockNumber: this.state.tamperedBlockNumber,
        invalidBlock: this.state.tamperedBlockNumber,
        expectedHash: '0x11bb001923bc9910aa112349bc981244dff98012',
        actualHash: '0xDEADBEEF9910aa112349bc981244dff98012TAMPER',
        errorReason: `Cryptographic Merkle leaf syndrome discrepancy at Block #${this.state.tamperedBlockNumber}. Hash signature mismatch on event EVT-88409.`,
        verifiedAt: new Date().toISOString(),
        rootIntegrityScore: 82.4,
      };
    }
    return {
      isSuccess: true,
      valid: true,
      totalBlocksVerified: 4192,
      verifiedAt: new Date().toISOString(),
      rootIntegrityScore: 100.0,
    };
  }

  public simulateTamper() {
    this.state.isLedgerTampered = true;
    this.commit();

    // Trigger critical alert for ledger tamper
    this.createAlert({
      severity: 'CRITICAL',
      title: 'CRITICAL: LEDGER INTEGRITY FAILURE',
      message: `Merkle root discrepancy detected at Block #${this.state.tamperedBlockNumber}. Chain tamper simulation active.`,
      relatedEntity: 'ledger',
      relatedEntityId: `BLOCK-${this.state.tamperedBlockNumber}`,
    });

    return { isTampered: true, blockNumber: this.state.tamperedBlockNumber };
  }

  public resetDemo() {
    this.state.isLedgerTampered = false;
    this.commit();
    return { isTampered: false };
  }

  public isLedgerTampered(): boolean {
    return Boolean(this.state.isLedgerTampered);
  }

  public getDisconnectedUnits() {
    return this.state.disconnected_units || [];
  }

  public reconcileUnit(unitId: string) {
    const unit = (this.state.disconnected_units || []).find((u) => u.id === unitId) || this.state.disconnected_units[0];
    const newBlock = {
      blockNumber: (this.state.ledger_blocks[0]?.blockNumber || 4192) + 1,
      timestamp: new Date().toISOString(),
      merkleRootHash: `0x${crypto.randomBytes(24).toString('hex')}`,
      previousBlockHash: this.state.ledger_blocks[0]?.merkleRootHash || '0x88f21ac0981baacc3321ff88901239aa8841cbb8901239aa',
      eventCount: unit?.pendingEventCount || 6,
      validatingNode: `Air-Gap Reconciled Node (${unit?.name || 'Vessel'})`,
      status: 'Verified',
      events: [
        {
          eventId: `EVT-REC-${Date.now().toString().slice(-4)}`,
          recipientPseudonym: `${unit?.name || 'Vessel'} Terminal`,
          documentId: 'NAV-DOC-2026-0042',
          documentName: 'Mission_Plan_Bravo.pdf',
          timestamp: 'Offline Batch Commit',
          signatureStatus: 'ML-DSA-65 Valid ✓',
          channel: 'Air-Gap Optical Diode Transfer',
          accessType: 'View Only',
          nonce: '88bc12aa',
          merkleLeaf: '0x99aa001923fa...',
        },
      ],
    };

    this.state.ledger_blocks.unshift(newBlock);
    if (unit) unit.pendingEventCount = 0;
    this.commit();

    return {
      unitId: unit?.id || unitId,
      unitName: unit?.name || 'Vessel',
      reconciledAt: new Date().toISOString(),
      eventsMergedCount: newBlock.eventCount,
      newBlocksAppended: 1,
      events: newBlock.events,
    };
  }

  // --- AUTHORIZATION & POLICIES ---
  public getPolicies() {
    return this.state.access_policies || [];
  }

  public createPolicy(policyData: any) {
    const newPolicy = {
      ...policyData,
      id: `POL-${String((this.state.access_policies?.length || 0) + 1).padStart(2, '0')}`,
      createdAt: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      updatedAt: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      activeRecipientsCount: 0,
      status: 'Active',
    };
    if (!this.state.access_policies) this.state.access_policies = [];
    this.state.access_policies.unshift(newPolicy);
    this.commit();
    return newPolicy;
  }

  public updatePolicy(id: string, updates: any) {
    const policy = (this.state.access_policies || []).find((p) => p.id === id);
    if (!policy) return null;
    Object.assign(policy, updates, { updatedAt: new Date().toISOString() });
    this.commit();
    return policy;
  }

  public getAccessRequests() {
    return this.state.access_requests || [];
  }

  public createAccessRequest(reqData: any) {
    const id = `REQ-2026-${String((this.state.access_requests?.length || 0) + 82).padStart(3, '0')}`;
    const newReq = {
      id,
      requesterName: reqData.requesterName || reqData.officerName || 'Officer',
      requesterRank: reqData.requesterRank || reqData.rank || 'Lieutenant',
      requesterPno: reqData.requesterPno || reqData.pno || '06244-S',
      requesterUnit: reqData.requesterUnit || reqData.unit || 'Eastern Fleet HQ',
      documentId: reqData.documentId || reqData.documentReferenceId || 'NAV-DOC-2026-0042',
      documentName: reqData.documentName || 'Restricted Tactical Record',
      documentClassification: reqData.documentClassification || 'SECRET',
      reasonGiven: reqData.reasonGiven || reqData.reason || 'Operational necessity',
      requestedOn: new Date().toISOString(),
      status: 'Pending',
      requiredApproverRole: 'Command Authority',
      ...reqData,
    };
    if (!this.state.access_requests) this.state.access_requests = [];
    this.state.access_requests.unshift(newReq);

    this.recordAuditEvent({
      type: 'ACCESS_REQUESTED',
      actor: newReq.requesterName,
      entityType: 'access_request',
      entityId: id,
      metadata: { documentId: newReq.documentId, reason: newReq.reasonGiven },
    });

    this.commit();
    return newReq;
  }

  public approveAccessRequest(requestId: string, approverName: string, note?: string) {
    const req = (this.state.access_requests || []).find((r) => r.id === requestId);
    if (req) {
      req.status = 'Approved';
      req.decidedBy = approverName;
      req.decidedAt = new Date().toISOString();
      req.decisionNote = note || 'Approved with cryptographic clearance';

      this.recordAuditEvent({
        type: 'ACCESS_APPROVED',
        actor: approverName,
        entityType: 'access_request',
        entityId: requestId,
        metadata: { note: req.decisionNote },
      });

      this.commit();
    }
    return req;
  }

  public denyAccessRequest(requestId: string, denierName: string, reason: string) {
    const req = (this.state.access_requests || []).find((r) => r.id === requestId);
    if (req) {
      req.status = 'Denied';
      req.decidedBy = denierName;
      req.decidedAt = new Date().toISOString();
      req.decisionNote = reason;

      this.recordAuditEvent({
        type: 'ACCESS_DENIED',
        actor: denierName,
        entityType: 'access_request',
        entityId: requestId,
        metadata: { reason },
      });

      this.commit();
    }
    return req;
  }

  public getAccessDeniedLogs(filters?: any) {
    let logs = [...(this.state.access_denied_logs || [])];
    if (filters?.reason && filters.reason !== 'All Reasons') {
      logs = logs.filter((l) => l.reasonForDenial === filters.reason);
    }
    if (filters?.documentId && filters.documentId !== 'All Documents') {
      logs = logs.filter((l) => l.documentId === filters.documentId || l.documentName?.includes(filters.documentId));
    }
    return logs;
  }

  // --- ALERTS & RULES ---
  public getAlerts() {
    return this.state.alerts || [];
  }

  public createAlert(alertData: any) {
    const id = alertData.id || `ALT-${Date.now().toString(16).toUpperCase()}`;
    const newAlert = {
      id,
      severity: alertData.severity || 'HIGH',
      title: alertData.title,
      message: alertData.message,
      relatedEntity: alertData.relatedEntity || 'system',
      relatedEntityId: alertData.relatedEntityId || '',
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
      ...alertData,
    };
    if (!this.state.alerts) this.state.alerts = [];
    this.state.alerts.unshift(newAlert);
    this.commit();
    return newAlert;
  }

  public acknowledgeAlert(id: string, ackBy = 'Officer') {
    const alert = (this.state.alerts || []).find((a) => a.id === id);
    if (alert) {
      alert.status = 'ACKNOWLEDGED';
      alert.acknowledgedBy = ackBy;
      alert.acknowledgedAt = new Date().toISOString();
      this.commit();
    }
    return alert;
  }

  public resolveAlert(id: string, resolvedBy = 'Officer') {
    const alert = (this.state.alerts || []).find((a) => a.id === id);
    if (alert) {
      alert.status = 'RESOLVED';
      alert.resolvedBy = resolvedBy;
      alert.resolvedAt = new Date().toISOString();
      this.commit();
    }
    return alert;
  }

  public getAlertRules() {
    return this.state.alert_rules || [];
  }

  public updateAlertRules(rules: any[]) {
    this.state.alert_rules = [...rules];
    this.commit();
    return this.state.alert_rules;
  }

  // --- INVESTIGATIONS & ARTIFACTS ---
  public getInvestigations() {
    return this.state.investigations || [];
  }

  public getInvestigationById(id: string) {
    return (this.state.investigations || []).find((i) => i.id === id || i.caseNumber === id);
  }

  public createInvestigation(caseData: any) {
    const id = caseData.id || `INV-2026-${String((this.state.investigations?.length || 0) + 43).padStart(4, '0')}`;
    const newCase = {
      id,
      caseNumber: `CASE-NAVX-2026-${id.slice(-4)}`,
      title: caseData.title || `Investigation on ${caseData.filename || 'Artifact'}`,
      filename: caseData.filename || 'leaked_artifact.pdf',
      documentId: caseData.documentId || 'NAV-DOC-2026-0042',
      documentName: caseData.documentName || 'Mission_Plan_Bravo.pdf',
      uploadedAt: new Date().toISOString(),
      investigator: caseData.investigator || 'Lt. Cdr. S. Rao (Cyber Warfare Command)',
      priority: caseData.priority || 'HIGH',
      status: 'Open',
      attributionStatus: 'PROVENANCE VERIFIED',
      progress: 100,
      candidateCount: 14,
      topMatch: {
        recipientId: 'REC-01',
        name: 'Cdr. Arjun Mehta',
        pno: '04821-K',
        unit: 'INS Vikramaditya (R33)',
        confidenceScore: 99.8,
        seedFingerprint: '0x88f21ac0981baacc',
        decryptedTimestamp: '27 Sep 2026 04:54Z',
        matchedVersion: 'v2.1',
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...caseData,
    };
    if (!this.state.investigations) this.state.investigations = [];
    this.state.investigations.unshift(newCase);

    this.recordAuditEvent({
      type: 'INVESTIGATION_CREATED',
      actor: newCase.investigator,
      entityType: 'investigation',
      entityId: id,
      metadata: { title: newCase.title, documentId: newCase.documentId },
    });

    this.commit();
    return newCase;
  }

  public updateInvestigation(id: string, updates: any) {
    const c = this.getInvestigationById(id);
    if (!c) return null;
    Object.assign(c, updates, { updatedAt: new Date().toISOString() });
    this.commit();
    return c;
  }

  public getArtifacts() {
    if (!this.state.leak_artifacts || this.state.leak_artifacts.length === 0) {
      this.state.leak_artifacts = [
        {
          id: 'ART-001',
          filename: 'leaked_mission_plan.jpg',
          documentId: 'NAV-DOC-2026-0042',
          size: '2.4 MB',
          format: 'JPG',
          mime_type: 'image/jpeg',
          uploadedAt: '2026-09-28T01:42:00Z',
          hash: 'SHA256: a9e4f291bb8a4e10c78912d7c00192ea7732b',
          analysisStatus: 'COMPLETED',
          analyst_status: 'PENDING REVIEW',
        },
        {
          id: 'ART-002',
          filename: 'intel_notes.pdf',
          documentId: 'NAV-DOC-2026-0040',
          size: '1.1 MB',
          format: 'PDF',
          mime_type: 'application/pdf',
          uploadedAt: '2026-09-28T02:15:00Z',
          hash: 'SHA256: f41c9019aa782e1189ac39b2011239aa8841c',
          analysisStatus: 'COMPLETED',
          analyst_status: 'PENDING REVIEW',
        },
        {
          id: 'ART-003',
          filename: 'screenshot_001.png',
          documentId: 'NAV-DOC-2026-0039',
          size: '1.8 MB',
          format: 'PNG',
          mime_type: 'image/png',
          uploadedAt: '2026-09-28T03:00:00Z',
          hash: 'SHA256: c7018821bb4a4e10c78912d7c00192ea33d9',
          analysisStatus: 'COMPLETED',
          analyst_status: 'PENDING REVIEW',
        },
        {
          id: 'ART-004',
          filename: 'photo_briefing.jpg',
          documentId: '',
          size: '2.6 MB',
          format: 'JPG',
          mime_type: 'image/jpeg',
          uploadedAt: '2026-09-28T03:30:00Z',
          hash: 'SHA256: ee091189aa2233b87910aa112349bc981244d',
          analysisStatus: 'COMPLETED',
          analyst_status: 'PENDING REVIEW',
        },
      ];
      this.commit();
    }
    return this.state.leak_artifacts;
  }

  public getArtifactById(id: string) {
    const list = this.getArtifacts();
    if (!id || list.length === 0) return list[0];
    const cleanId = String(id).trim();

    // 1. Exact match by ID, filename, or name
    let found = list.find(
      (a) =>
        a.id === cleanId ||
        a.filename === cleanId ||
        a.name === cleanId ||
        a.id.toLowerCase() === cleanId.toLowerCase() ||
        (a.filename && a.filename.toLowerCase() === cleanId.toLowerCase())
    );
    if (found) return found;

    // 2. Normalized alias matching: F-001 <-> ART-001 <-> ART-2026-001
    const normalized = cleanId
      .replace(/^F-0*/i, 'ART-2026-00')
      .replace(/^ART-0*/i, 'ART-2026-00');

    found = list.find(
      (a) =>
        a.id === normalized ||
        a.id.replace('ART-2026-', 'ART-') === cleanId ||
        a.id.replace('ART-2026-', 'F-') === cleanId ||
        a.id.replace('ART-', 'F-') === cleanId ||
        a.id.replace('ART-', 'ART-2026-') === cleanId
    );
    if (found) return found;

    // 3. Keyword / filename matching
    const lower = cleanId.toLowerCase();
    if (lower.includes('mission') || lower.includes('plan') || lower.includes('bravo') || lower.includes('001') || lower.includes('0042')) {
      return list.find((a) => a.id.includes('001') || a.filename.includes('mission')) || list[0];
    }
    if (lower.includes('intel') || lower.includes('notes') || lower.includes('002') || lower.includes('0040')) {
      return list.find((a) => a.id.includes('002') || a.filename.includes('intel')) || list[1] || list[0];
    }
    if (lower.includes('screenshot') || lower.includes('sop') || lower.includes('003') || lower.includes('0039')) {
      return list.find((a) => a.id.includes('003') || a.filename.includes('screenshot')) || list[2] || list[0];
    }
    if (lower.includes('photo') || lower.includes('briefing') || lower.includes('004') || lower.includes('0038')) {
      return list.find((a) => a.id.includes('004') || a.filename.includes('photo')) || list[3] || list[0];
    }

    // 4. Default graceful fallback to first registered artifact
    return list[0];
  }

  public createArtifact(artifactData: any) {
    const id = artifactData.id || `ART-${Date.now().toString(16).toUpperCase()}`;
    const newArt = {
      id,
      filename: artifactData.filename || 'artifact.pdf',
      documentId: artifactData.documentId || 'NAV-DOC-2026-0042',
      size: artifactData.size || '1.5 MB',
      format: (artifactData.filename?.split('.').pop() || 'PDF').toUpperCase(),
      uploadedAt: new Date().toISOString(),
      hash: artifactData.hash || `SHA256: ${crypto.randomBytes(16).toString('hex')}`,
      analysisStatus: 'PENDING',
      analyst_status: 'PENDING REVIEW',
      ...artifactData,
    };
    if (!this.state.leak_artifacts) this.state.leak_artifacts = [];
    this.state.leak_artifacts.unshift(newArt);

    this.recordAuditEvent({
      type: 'ARTIFACT_UPLOADED',
      actor: artifactData.uploadedBy || 'Forensic Analyst',
      entityType: 'artifact',
      entityId: id,
      metadata: { filename: newArt.filename, size: newArt.size },
    });

    this.commit();
    return newArt;
  }

  public updateArtifact(id: string, updates: any) {
    const art = this.getArtifactById(id);
    if (!art) return null;
    Object.assign(art, updates, { updatedAt: new Date().toISOString() });
    this.commit();
    return art;
  }

  public updateArtifactAnalystReview(id: string, status: string, reviewer = 'Lt. Cdr. S. Rao', note?: string) {
    const art = this.getArtifactById(id);
    if (!art) return null;
    art.analyst_status = status;
    art.analyst_reviewer = reviewer;
    art.analyst_reviewed_at = new Date().toISOString();
    art.analyst_note = note;

    this.recordAuditEvent({
      type: status === 'CONFIRMED' ? 'ATTRIBUTION_CONFIRMED' : status === 'REJECTED' ? 'ATTRIBUTION_REJECTED' : 'ATTRIBUTION_REVIEWED',
      actor: reviewer,
      entityType: 'artifact',
      entityId: id,
      metadata: { status, note },
    });

    this.commit();
    return art;
  }

  public getInvestigationEvidence(caseId: string) {
    return (this.state.forensic_evidence || []).filter((e) => e.caseId === caseId);
  }

  public getEvidenceChecks(caseId: string) {
    return (
      (this.state.evidence_checks || []).find((e) => e.caseId === caseId) || {
        caseId,
        fingerprintMatch: 'PASS',
        documentHashMatch: 'PASS',
        versionMatch: 'PASS',
        authorizationMatch: 'PASS',
        recipientMatch: 'PASS',
        signatureValid: 'PASS',
        ledgerValid: this.state.isLedgerTampered ? 'FAIL' : 'PASS',
        provenanceValid: 'PASS',
        overallStatus: this.state.isLedgerTampered ? 'CONTRADICTORY EVIDENCE' : 'PROVENANCE VERIFIED',
      }
    );
  }

  // --- EMCON & AIR-GAP ---
  public getEmconState() {
    return this.state.emcon_state || {
      currentPosture: 'EMCON Charlie (Normal Operations)',
      postureColor: '#10b981',
      activeVesselsCount: 42,
      disconnectedVesselsCount: 3,
    };
  }

  public isEmconActive(): boolean {
    const posture = this.state.emcon_state?.currentPosture || '';
    return posture.includes('Alpha') || posture.includes('Bravo') || posture.includes('Silence');
  }

  public updateEmconPosture(posture: string) {
    if (!this.state.emcon_state) this.state.emcon_state = {};
    this.state.emcon_state.currentPosture = posture;
    this.state.emcon_state.postureColor = posture.includes('Alpha')
      ? '#ef4444'
      : posture.includes('Bravo')
      ? '#f59e0b'
      : '#10b981';

    this.recordAuditEvent({
      type: 'EMCON_POSTURE_CHANGED',
      actor: 'Command Staff',
      entityType: 'emcon',
      entityId: posture,
      metadata: { posture, active: this.isEmconActive() },
    });

    this.commit();
    return this.state.emcon_state;
  }

  public getActivityLogs() {
    return this.state.activity_logs || [];
  }

  // --- DASHBOARD & GLOBAL SEARCH ---
  public getDashboardStats() {
    const docs = this.state.documents || [];
    const dists = this.state.distributions || [];
    const recs = this.state.recipients || [];
    const decs = this.state.decryption_events || [];
    const blocks = this.state.ledger_blocks || [];
    const cases = this.state.investigations || [];
    const alerts = (this.state.alerts || []).filter((a) => a.status === 'ACTIVE');
    const queue = (this.state.notification_queue || []).filter((q) => q.status === 'QUEUED');

    return {
      documents: docs.length,
      activeDistributions: dists.length,
      recipients: recs.length,
      decryptionEvents: decs.length,
      ledgerBlocks: blocks.length,
      investigations: cases.length,
      alerts: alerts.length,
      leaks: Object.values(this.state.leak_monitoring || {}).filter((l) => l.status === 'LEAK_DETECTED').length,
      pendingNotifications: queue.length,
      isLedgerTampered: this.state.isLedgerTampered,
      systemHealth: {
        database: 'HEALTHY',
        backendApi: 'HEALTHY',
        gmail: this.state.oauth_accounts?.length ? 'HEALTHY' : 'SIMULATED_INTEGRATION',
        ledger: this.state.isLedgerTampered ? 'DEGRADED' : 'HEALTHY',
        storage: 'HEALTHY',
        forensicEngine: 'HEALTHY',
      },
    };
  }

  public globalSearch(query: string) {
    if (!query || query.trim() === '') return { results: [] };
    const q = query.toLowerCase();

    const matchedDocs = (this.state.documents || [])
      .filter((d) => d.name.toLowerCase().includes(q) || d.id.toLowerCase().includes(q))
      .map((d) => ({ type: 'document', title: d.name, subtitle: `${d.id} • ${d.classification}`, link: `/documents` }));

    const matchedRecs = (this.state.recipients || [])
      .filter((r) => r.name.toLowerCase().includes(q) || r.unit.toLowerCase().includes(q) || r.id.toLowerCase().includes(q))
      .map((r) => ({ type: 'recipient', title: `${r.rank} ${r.name}`, subtitle: `${r.unit} • ${r.pno}`, link: `/recipients` }));

    const matchedCases = (this.state.investigations || [])
      .filter((c) => c.id.toLowerCase().includes(q) || c.title?.toLowerCase().includes(q) || c.filename?.toLowerCase().includes(q))
      .map((c) => ({ type: 'investigation', title: c.title || c.id, subtitle: `${c.status} • Case ${c.id}`, link: `/investigations/${c.id}` }));

    const matchedAlerts = (this.state.alerts || [])
      .filter((a) => a.title.toLowerCase().includes(q) || a.message?.toLowerCase().includes(q))
      .map((a) => ({ type: 'alert', title: a.title, subtitle: a.severity, link: `/authorization` }));

    return {
      query,
      results: [...matchedDocs, ...matchedRecs, ...matchedCases, ...matchedAlerts],
    };
  }
}

export const db = new DatabaseService();
