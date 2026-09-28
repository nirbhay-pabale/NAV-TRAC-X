import type {
  DocumentRecord,
  Recipient,
  AuthorizationPolicy,
  AuthorizationRequest,
  AccessDeniedLog,
  DistributionEvent,
  DecryptionEvent,
  ProvenanceCapsule,
  DocumentFingerprint,
  LedgerBlock,
  InvestigationCase,
  AlertRule,
  SecurityAlert,
  DisconnectedUnit,
  MonitoringJob,
  LeakCandidate,
} from '../types/domain';
import { sha256Sync } from '../services/cryptoService';
import { pqcService } from '../services/pqcService';
import { fingerprintEngine } from '../services/fingerprintService';
import { provenanceService } from '../services/provenanceService';
import { reconciliationEngine } from '../services/reconciliationService';

const STORE_KEY = 'NAVTRAC_X_LOCAL_STORE_V2';

export interface CentralStoreState {
  documents: DocumentRecord[];
  recipients: Recipient[];
  policies: AuthorizationPolicy[];
  requests: AuthorizationRequest[];
  deniedLogs: AccessDeniedLog[];
  distributions: DistributionEvent[];
  decryptions: DecryptionEvent[];
  provenanceCapsules: ProvenanceCapsule[];
  fingerprints: DocumentFingerprint[];
  ledgerBlocks: LedgerBlock[];
  investigations: InvestigationCase[];
  alertRules: AlertRule[];
  alerts: SecurityAlert[];
  disconnectedUnits: DisconnectedUnit[];
  monitoringJobs: MonitoringJob[];
  leakCandidates: LeakCandidate[];
  isLedgerTampered: boolean;
  tamperedBlockNumber: number;
}

// ─────────────────────────────────────────────────────────────
// INITIAL SEED DATASET
// ─────────────────────────────────────────────────────────────
const INITIAL_RECIPIENTS: Recipient[] = [
  {
    id: 'REC-01',
    name: 'Cdr. A. Mehta',
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
    publicKeyMLKEM: '0xKEM768_PUB_REC01_89AF42E190C2',
    publicKeyMLDSA: '0xDSA65_PUB_REC01_44BA881911AC',
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
    publicKeyMLKEM: '0xKEM768_PUB_REC02_44BA881911AC',
    publicKeyMLDSA: '0xDSA65_PUB_REC02_88FE9012AACC',
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
    publicKeyMLKEM: '0xKEM768_PUB_REC03_12FE9981AA34',
    publicKeyMLDSA: '0xDSA65_PUB_REC03_7733BBAA1100',
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
    publicKeyMLKEM: '0xKEM768_PUB_REC04_991144AA77CC',
    publicKeyMLDSA: '0xDSA65_PUB_REC04_221199AABBCC',
  },
  {
    id: 'REC-05',
    name: 'Lt. Priya Singh',
    rank: 'Lieutenant',
    pno: '06244-S',
    unit: 'INS Visakhapatnam (D66)',
    email: 'p.singh@navy.mil.in',
    clearanceLevel: 'Level 3 (Secret)',
    activeKeys: 3,
    documentsReceived: 14,
    lastActive: '25 mins ago',
    status: 'Active',
    hardwareDeviceId: 'HW-HSM-9402',
    pkiCertificateFingerprint: 'SHA256: 33BB:7711:00AA:55FF',
    publicKeyMLKEM: '0xKEM768_PUB_REC05_33BB771100AA',
    publicKeyMLDSA: '0xDSA65_PUB_REC05_9988AACC1122',
  },
  {
    id: 'REC-06',
    name: 'Cdr. Devendra Malik',
    rank: 'Commander',
    pno: '04118-W',
    unit: 'INS Mormugao (D67)',
    email: 'd.malik@navy.mil.in',
    clearanceLevel: 'Level 4 (Top Secret Codeword)',
    activeKeys: 5,
    documentsReceived: 21,
    lastActive: '45 mins ago',
    status: 'Active',
    hardwareDeviceId: 'HW-HSM-9104',
    pkiCertificateFingerprint: 'SHA256: 77AA:1100:99BB:2233',
    publicKeyMLKEM: '0xKEM768_PUB_REC06_77AA110099BB',
    publicKeyMLDSA: '0xDSA65_PUB_REC06_445566778899',
  },
  {
    id: 'REC-07',
    name: 'Rear Adm. V. K. Saxena',
    rank: 'Rear Admiral',
    pno: '01980-X',
    unit: 'Western Fleet Command',
    email: 'vk.saxena@navy.mil.in',
    clearanceLevel: 'Level 4 (Top Secret Codeword)',
    activeKeys: 10,
    documentsReceived: 62,
    lastActive: '2 hours ago',
    status: 'Active',
    hardwareDeviceId: 'NAV-HQ-WNC-00',
    pkiCertificateFingerprint: 'SHA256: AABB:CCDD:EEFF:0011',
    publicKeyMLKEM: '0xKEM768_PUB_REC07_AABBCCDDEEFF',
    publicKeyMLDSA: '0xDSA65_PUB_REC07_112233445566',
  },
  {
    id: 'REC-08',
    name: 'Lt. Amit Saxena',
    rank: 'Lieutenant',
    pno: '06812-B',
    unit: 'Eastern Naval Command',
    email: 'a.saxena@navy.mil.in',
    clearanceLevel: 'Level 2 (Confidential)',
    activeKeys: 1,
    documentsReceived: 6,
    lastActive: '4 hours ago',
    status: 'Active',
    hardwareDeviceId: 'ENC-TERM-08',
    pkiCertificateFingerprint: 'SHA256: 5544:3322:1100:9988',
    publicKeyMLKEM: '0xKEM768_PUB_REC08_554433221100',
    publicKeyMLDSA: '0xDSA65_PUB_REC08_667788990011',
  },
];

const INITIAL_DOCUMENTS: DocumentRecord[] = [
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
    pqcEncapsulationStatus: 'ML-KEM-768 Encapsulated (Local Demo)',
    versions: [
      {
        versionId: 'VER-0042-2.1',
        documentId: 'NAV-DOC-2026-0042',
        version: 'v2.1',
        fileHash: 'SHA256: 88f2:1ac0:981b:aacc:3321:ff88:9012:39aa',
        author: 'Capt. R. Deshmukh (03912-P)',
        changeNotes: 'Updated strike package vector Alpha-7 and revised fuel reserve calculations.',
        releasedAt: '26 Sep 2026 20:14 IST',
        isLeakedMatch: true,
        linkedDecryptionEvents: [
          { eventId: 'EVT-88420', recipientName: 'Cdr. A. Mehta (04821-K)', decryptedAt: '27 Sep 2026 04:54Z', matchedLeakArtifact: true },
          { eventId: 'EVT-88420', recipientName: 'Capt. R. Deshmukh (03912-P)', decryptedAt: '27 Sep 2026 04:51Z', matchedLeakArtifact: false },
        ],
      },
      {
        versionId: 'VER-0042-2.0',
        documentId: 'NAV-DOC-2026-0042',
        version: 'v2.0',
        fileHash: 'SHA256: 32ba:1198:c001:92ea:7732:b891:0ac2:2199',
        author: 'Cdr. A. Mehta (04821-K)',
        changeNotes: 'Integrated carrier strike group escort positioning and updated callsigns.',
        releasedAt: '25 Sep 2026 14:30 IST',
        isLeakedMatch: false,
        linkedDecryptionEvents: [
          { eventId: 'EVT-88412', recipientName: 'Flag Officer Commanding Western Fleet', decryptedAt: '26 Sep 2026 12:45Z', matchedLeakArtifact: false },
        ],
      },
      {
        versionId: 'VER-0042-1.0',
        documentId: 'NAV-DOC-2026-0042',
        version: 'v1.0',
        fileHash: 'SHA256: ee11:0098:44bb:9910:aa11:2349:bc98:1244',
        author: 'Directorate of Naval Operations',
        changeNotes: 'Initial operational draft for Western Fleet exercise simulation.',
        releasedAt: '24 Sep 2026 09:00 IST',
        isLeakedMatch: false,
        linkedDecryptionEvents: [],
      },
    ],
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
    pqcEncapsulationStatus: 'ML-KEM-768 Encapsulated (Local Demo)',
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
];

const INITIAL_POLICIES: AuthorizationPolicy[] = [
  {
    id: 'POL-01',
    name: 'Command Operations Level-4 Top Secret Policy',
    description: 'Enforces dual-custody cryptographic keying and 24-hour ephemeral session decay for tactical warfare documents.',
    scopeType: 'ROLE',
    appliesTo: 'Commanding Officers (CO/XO) • Western Fleet Battle Group',
    classificationScope: 'TOP SECRET (CODEWORD)',
    allowedAccessTypes: ['View Only', 'Download'],
    expiryRule: '24 Hours from Decryption',
    activeRecipientsCount: 14,
    status: 'Active',
    createdAt: '15 Sep 2026',
    updatedAt: '26 Sep 2026',
    requiresDualCustody: true,
    deviceRestrictions: 'HW-HSM Level-3 Validated Devices Only',
  },
  {
    id: 'POL-02',
    name: 'Hydrographic & Littoral Intelligence Standard',
    description: 'Mandatory steganographic watermarking on all bathymetric charts and acoustic sensor profiles.',
    scopeType: 'UNIT',
    appliesTo: 'Eastern Fleet Hydrographic Office & Submarine Flotilla',
    classificationScope: 'SECRET',
    allowedAccessTypes: ['View Only', 'Download', 'Print'],
    expiryRule: '7 Days',
    activeRecipientsCount: 28,
    status: 'Active',
    createdAt: '10 Sep 2026',
    updatedAt: '25 Sep 2026',
    requiresDualCustody: false,
    deviceRestrictions: 'Authorized Naval Terminals',
  },
  {
    id: 'POL-03',
    name: 'Naval Aviation Sortie Schedule Clearance',
    description: 'Role-based authorization for carrier air wing pilots and tactical coordinators.',
    scopeType: 'ROLE',
    appliesTo: 'Carrier Strike Group Air Wing (INS Vikramaditya / Vikrant)',
    classificationScope: 'SECRET',
    allowedAccessTypes: ['View Only', 'Print'],
    expiryRule: '12 Hours from Decryption',
    activeRecipientsCount: 36,
    status: 'Active',
    createdAt: '01 Sep 2026',
    updatedAt: '20 Sep 2026',
    requiresDualCustody: false,
    deviceRestrictions: 'Cockpit & Briefing Room Displays',
  },
];

const INITIAL_REQUESTS: AuthorizationRequest[] = [
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
    requesterUnit: 'Eastern Naval Command',
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
];

const INITIAL_DENIED_LOGS: AccessDeniedLog[] = [
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
];

const INITIAL_BLOCKS: LedgerBlock[] = [
  {
    blockNumber: 4192,
    timestamp: '27 Sep 2026 04:54:12Z',
    merkleRootHash: '0x88f21ac0981baacc3321ff88901239aa8841cbb8901239aa',
    previousBlockHash: '0x32ba1198c00192ea7732b8910ac2219901aa8821',
    currentBlockHash: '0x88f21ac0981baacc3321ff88901239aa8841cbb8',
    eventCount: 4,
    validatingNode: 'NAVAL-HQ-DELHI (PQC Validator 01)',
    status: 'Verified',
    events: [
      {
        eventId: 'EVT-88420',
        recipientPseudonym: 'Cdr. A. Mehta (04821-K)',
        documentId: 'NAV-DOC-2026-0042',
        documentName: 'Mission_Plan_Bravo.pdf',
        documentVersion: 'v2.1',
        timestamp: '27 Sep 2026 04:54:12Z',
        signatureStatus: 'ML-DSA-65 Valid',
        channel: 'Decryption Event (In-Memory)',
        accessType: 'View Only',
        nonce: '9a38f71c',
        merkleLeaf: '0x4a8f22091bc8...',
        provenanceCapsuleId: 'CAPSULE-2026-0042-REC-01',
      },
      {
        eventId: 'EVT-88420',
        recipientPseudonym: 'Capt. R. Deshmukh (03912-P)',
        documentId: 'NAV-DOC-2026-0042',
        documentName: 'Mission_Plan_Bravo.pdf',
        documentVersion: 'v2.1',
        timestamp: '27 Sep 2026 04:51:00Z',
        signatureStatus: 'ML-DSA-65 Valid',
        channel: 'Internal Naval Net',
        accessType: 'Full Access',
        nonce: '11fe89ac',
        merkleLeaf: '0x77aa4419cb20...',
        provenanceCapsuleId: 'CAPSULE-2026-0042-REC-02',
      },
      {
        eventId: 'EVT-88419',
        recipientPseudonym: 'Western Fleet Tactical Controller',
        documentId: 'NAV-DOC-2026-0029',
        documentName: 'Tactical_Satcom_Frequency_Allocation.docx',
        documentVersion: 'v1.0',
        timestamp: '27 Sep 2026 04:45:30Z',
        signatureStatus: 'ML-DSA-65 Valid',
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
        documentVersion: 'v1.4',
        timestamp: '27 Sep 2026 04:30:15Z',
        signatureStatus: 'ML-DSA-65 Valid',
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
    currentBlockHash: '0x32ba1198c00192ea7732b8910ac2219901aa8821',
    eventCount: 3,
    validatingNode: 'HQ-WNC-MUMBAI-NODE-02',
    status: 'Verified',
    events: [
      {
        eventId: 'EVT-88417',
        recipientPseudonym: 'INS Vikramaditya Air Wing',
        documentId: 'NAV-DOC-2026-0061',
        documentName: 'Carrier_Air_Wing_Sortie_Schedule.pptx',
        documentVersion: 'v2.0',
        timestamp: '26 Sep 2026 22:10:00Z',
        signatureStatus: 'ML-DSA-65 Valid',
        channel: 'Tactical Link-II',
        accessType: 'View Only',
        nonce: '55bc9910',
        merkleLeaf: '0x88f21ac0981b...',
      },
    ],
  },
  {
    blockNumber: 4190,
    timestamp: '26 Sep 2026 18:03:11Z',
    merkleRootHash: '0x55aa001923bc9910aa112349bc981244dff98012',
    previousBlockHash: '0x88a1002239fc0011882233bbaacc110928833918',
    currentBlockHash: '0x55aa001923bc9910aa112349bc981244dff98012',
    eventCount: 2,
    validatingNode: 'HQ-ENC-VISAKHAPATNAM-01',
    status: 'Verified',
    events: [
      {
        eventId: 'EVT-88414',
        recipientPseudonym: 'Eastern Fleet Operations Room',
        documentId: 'NAV-DOC-2026-0038',
        documentName: 'Eastern_Littoral_Hydrographic_Intel.pdf',
        documentVersion: 'v1.4',
        timestamp: '26 Sep 2026 18:03:11Z',
        signatureStatus: 'ML-DSA-65 Valid',
        channel: 'Fiber Tactical WAN',
        accessType: 'Full Access',
        nonce: '99fe1122',
        merkleLeaf: '0x55aa001923bc...',
      },
    ],
  },
  {
    blockNumber: 4189,
    timestamp: '26 Sep 2026 12:45:00Z',
    merkleRootHash: '0x88a1002239fc0011882233bbaacc110928833918',
    previousBlockHash: '0xee11009844bb9910aa112349bc981244dff98012',
    currentBlockHash: '0x88a1002239fc0011882233bbaacc110928833918',
    eventCount: 2,
    validatingNode: 'NAVAL-HQ-DELHI (PQC Validator 01)',
    status: 'Verified',
    events: [
      {
        eventId: 'EVT-88412',
        recipientPseudonym: 'Flag Officer Commanding Western Fleet',
        documentId: 'NAV-DOC-2026-0042',
        documentName: 'Mission_Plan_Bravo.pdf',
        documentVersion: 'v2.0',
        timestamp: '26 Sep 2026 12:45:00Z',
        signatureStatus: 'ML-DSA-65 Valid',
        channel: 'Internal Naval Net',
        accessType: 'Full Access',
        nonce: '12aa34bb',
        merkleLeaf: '0xee11009844bb...',
      },
    ],
  },
  {
    blockNumber: 4188,
    timestamp: '26 Sep 2026 08:30:00Z',
    merkleRootHash: '0xee11009844bb9910aa112349bc981244dff98012',
    previousBlockHash: '0x7a3f2901bb8a4e10c78912d7c00192ea7732b891',
    currentBlockHash: '0xee11009844bb9910aa112349bc981244dff98012',
    eventCount: 3,
    validatingNode: 'HQ-WNC-MUMBAI-NODE-01',
    status: 'Verified',
    events: [
      {
        eventId: 'EVT-88410',
        recipientPseudonym: 'Cdr. A. Mehta (04821-K)',
        documentId: 'NAV-DOC-2026-0042',
        documentName: 'Mission_Plan_Bravo.pdf',
        documentVersion: 'v1.0',
        timestamp: '26 Sep 2026 08:30:00Z',
        signatureStatus: 'ML-DSA-65 Valid',
        channel: 'Initial HSM Key Injection',
        accessType: 'View Only',
        nonce: '44dd1122',
        merkleLeaf: '0x7a3f2901bb8a...',
      },
    ],
  },
];

// ─────────────────────────────────────────────────────────────
// 5 DISTINCT INVESTIGATION SCENARIOS (Covering All 5 PPT States)
// ─────────────────────────────────────────────────────────────
const INITIAL_INVESTIGATIONS: InvestigationCase[] = [
  // 1. PROVENANCE VERIFIED
  {
    id: 'NAVX-0042',
    title: 'Operation Strike Plan Alpha Leakage Attribution',
    filename: 'leaked_strike_plan_sample.pdf',
    uploadedAt: '27 Sep 2026 05:05Z',
    investigator: 'Cdr. K. S. Gill (Cyber Warfare Command)',
    status: 'Identified',
    progress: 100,
    verdict: 'PROVENANCE VERIFIED',
    confidenceScore: 99.8,
    artifact: {
      id: 'ART-0042',
      filename: 'leaked_strike_plan_sample.pdf',
      artifactType: 'PDF',
      fileSizeBytes: 3145728,
      uploadedAt: '27 Sep 2026 05:05Z',
      investigator: 'Cdr. K. S. Gill',
      sourceDescription: 'Dark Web Paste / External Tactical Channel',
      priority: 'CRITICAL',
      notes: 'Recovered leak contains visible watermark dots and structural stream markers.',
      transformationMetrics: {
        perspectiveDistortionPct: 0.0,
        jpegCompressionQuality: 92,
        noiseLevelPct: 4.2,
        blurRadiusPx: 0.2,
        cropFactorPct: 0.0,
        rotationDegrees: 0.0,
        screenshotCharacteristics: false,
      },
    },
    matchedDocument: {
      id: 'NAV-DOC-2026-0042',
      name: 'Mission_Plan_Bravo.pdf',
      masterDocId: 'DOC-88219-BRAVO',
      matchedVersion: 'v2.1',
      sha3Hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    },
    topMatch: {
      recipientId: 'REC-01',
      name: 'Cdr. A. Mehta',
      rank: 'Commander',
      pno: '04821-K',
      unit: 'INS Vikramaditya (R33)',
      confidenceScore: 99.8,
      seedFingerprint: '0x88f21ac0981baacc',
      decryptedTimestamp: '27 Sep 2026 04:54Z',
      matchedVersion: 'v2.1',
      provenanceCapsuleId: 'CAPSULE-2026-0042-REC-01',
    },
    evidenceChecks: [
      { id: 'CHK-01', name: 'Multi-Layer Fingerprint Correlation', status: 'PASS', detail: '5-Layer correlation score: 99.8% (Threshold: 85.0%)', weight: 20 },
      { id: 'CHK-02', name: 'Master Document SHA3-256 Digest', status: 'PASS', detail: 'Exact SHA3-256 cryptographic match against Master Registry', weight: 15 },
      { id: 'CHK-03', name: 'Version Alignment & Diff Verification', status: 'PASS', detail: 'Matched specific version release v2.1 with strike vector Alpha-7', weight: 10 },
      { id: 'CHK-04', name: 'Recipient Authorization Scope', status: 'PASS', detail: 'Valid active authorization policy POL-01 on record at decryption time', weight: 10 },
      { id: 'CHK-05', name: 'Decryption Event Audit Trail', status: 'PASS', detail: 'Hardware Security Module session log EVT-88420 confirmed', weight: 15 },
      { id: 'CHK-06', name: 'ML-DSA-65 Digital Signature Verification', status: 'PASS', detail: 'ML-DSA-65 quantum-resistant signature verified against recipient public key', weight: 15 },
      { id: 'CHK-07', name: 'Tamper-Evident Ledger Block Integrity', status: 'PASS', detail: 'Merkle leaf verified in immutable Block #4192', weight: 10 },
      { id: 'CHK-08', name: 'Provenance Capsule Cryptographic Binding', status: 'PASS', detail: 'Capsule CAPSULE-2026-0042-REC-01 verified and sealed', weight: 5 },
    ],
    manipulationFindings: [],
    collusionAnalysis: {
      status: 'NO COLLUSION INDICATED',
      candidateMatches: [
        { recipientId: 'REC-01', recipientName: 'Cdr. A. Mehta', matchedFragmentsPct: 99.8, overlapSummary: 'Single isolated recipient signature recovered 100%' },
      ],
      analysisNote: 'Single isolated recipient signature recovered. No multi-party Tardos collusion traits detected.',
    },
    framingAnalysis: {
      isFramingSuspected: false,
      analysisNote: 'Zero framing markers detected. Hardware token signature and visual watermarks are co-aligned.',
    },
    timeline: [
      { timestamp: '25 Sep 09:30Z', event: 'Document Created & Ingested into Registry', actor: 'Directorate of Naval Operations', status: 'Normal' },
      { timestamp: '26 Sep 20:14Z', event: 'Version v2.1 Released with AES-256 Key Derivation', actor: 'Capt. R. Deshmukh', status: 'Normal' },
      { timestamp: '27 Sep 04:54Z', event: 'Cryptographic Decryption & Provenance Capsule Injection', actor: 'Cdr. A. Mehta (04821-K)', status: 'Verified' },
      { timestamp: '27 Sep 04:54Z', event: 'Decryption Event Committed to Ledger Block #4192', actor: 'PQC Validator Node', status: 'Verified' },
      { timestamp: '27 Sep 05:02Z', event: 'External Leak Candidate Detected on Dark Web Paste', actor: 'Air-Gap Scanner', status: 'Alert' },
      { timestamp: '27 Sep 05:05Z', event: 'Forensic Investigation Opened & Attributed', actor: 'Cdr. K. S. Gill', status: 'Verified' },
    ],
  },

  // 2. MANIPULATION SUSPECTED
  {
    id: 'NAVX-0041',
    title: 'Tampered Littoral Chart Signature Discrepancy',
    filename: 'eastern_littoral_altered_excerpt.png',
    uploadedAt: '26 Sep 2026 19:30Z',
    investigator: 'Lt. Cdr. Priya Singh',
    status: 'Identified',
    progress: 100,
    verdict: 'MANIPULATION SUSPECTED',
    confidenceScore: 54.2,
    artifact: {
      id: 'ART-0041',
      filename: 'eastern_littoral_altered_excerpt.png',
      artifactType: 'Screenshot',
      fileSizeBytes: 2048000,
      uploadedAt: '26 Sep 2026 19:30Z',
      investigator: 'Lt. Cdr. Priya Singh',
      sourceDescription: 'Unauthenticated File Sharing Relay',
      priority: 'HIGH',
      notes: 'Artifact exhibits modified cryptographic header and signature syndrome failure.',
      transformationMetrics: {
        perspectiveDistortionPct: 0.0,
        jpegCompressionQuality: 80,
        noiseLevelPct: 8.5,
        blurRadiusPx: 0.4,
        cropFactorPct: 15.0,
        rotationDegrees: 0.0,
        screenshotCharacteristics: true,
      },
    },
    evidenceChecks: [
      { id: 'CHK-01', name: 'Multi-Layer Fingerprint Correlation', status: 'PASS', detail: 'Partial correlation score: 74.0%', weight: 20 },
      { id: 'CHK-02', name: 'Master Document SHA3-256 Digest', status: 'FAIL', detail: 'Document digest modified in bathymetry region', weight: 15 },
      { id: 'CHK-03', name: 'Version Alignment & Diff Verification', status: 'PASS', detail: 'Aligned with version v1.4', weight: 10 },
      { id: 'CHK-04', name: 'Recipient Authorization Scope', status: 'PASS', detail: 'Valid authorization policy POL-02', weight: 10 },
      { id: 'CHK-05', name: 'Decryption Event Audit Trail', status: 'PASS', detail: 'Decryption event EVT-88414 recorded', weight: 15 },
      { id: 'CHK-06', name: 'ML-DSA-65 Digital Signature Verification', status: 'FAIL', detail: 'ML-DSA-65 signature verification failed. Syndrome mismatch.', weight: 15 },
      { id: 'CHK-07', name: 'Tamper-Evident Ledger Block Integrity', status: 'PASS', detail: 'Block #4190 intact', weight: 10 },
      { id: 'CHK-08', name: 'Provenance Capsule Cryptographic Binding', status: 'FAIL', detail: 'Capsule signature corrupted or altered', weight: 5 },
    ],
    manipulationFindings: [
      {
        detectedIssue: 'Cryptographic ML-DSA-65 Signature Syndrome Mismatch',
        evidenceSource: 'Provenance Capsule / HSM Session Header',
        expected: '0xSIG_MLDSA65_VALID_AUTHENTIC_SIGNATURE',
        observed: '0xSIG_MLDSA65_CORRUPTED_MODIFIED_LEAF',
        severity: 'CRITICAL',
      },
    ],
    collusionAnalysis: {
      status: 'NO COLLUSION INDICATED',
      candidateMatches: [],
      analysisNote: 'Artifact modified by third party. No multi-recipient collusion.',
    },
    framingAnalysis: {
      isFramingSuspected: false,
      analysisNote: 'Direct cryptographic modification detected.',
    },
    timeline: [
      { timestamp: '26 Sep 19:30Z', event: 'Artifact Uploaded & Verified', actor: 'Lt. Cdr. Priya Singh', status: 'Alert' },
    ],
  },

  // 3. CONTRADICTORY EVIDENCE
  {
    id: 'NAVX-0040',
    title: 'Contradictory Watermark vs Ledger Discrepancy Case',
    filename: 'satcom_briefing_fragment_scan.jpg',
    uploadedAt: '26 Sep 2026 14:00Z',
    investigator: 'Cdr. K. S. Gill',
    status: 'Identified',
    progress: 100,
    verdict: 'CONTRADICTORY EVIDENCE',
    confidenceScore: 61.8,
    artifact: {
      id: 'ART-0040',
      filename: 'satcom_briefing_fragment_scan.jpg',
      artifactType: 'Scan',
      fileSizeBytes: 1843200,
      uploadedAt: '26 Sep 2026 14:00Z',
      investigator: 'Cdr. K. S. Gill',
      sourceDescription: 'Intercepted Messaging Channel',
      priority: 'HIGH',
      notes: 'Watermark claims Cdr. A. Mehta but ledger cryptographic signing key belongs to Capt. R. Deshmukh.',
      transformationMetrics: {
        perspectiveDistortionPct: 1.2,
        jpegCompressionQuality: 75,
        noiseLevelPct: 12.0,
        blurRadiusPx: 0.8,
        cropFactorPct: 20.0,
        rotationDegrees: 1.1,
        screenshotCharacteristics: false,
      },
    },
    evidenceChecks: [
      { id: 'CHK-01', name: 'Multi-Layer Fingerprint Correlation', status: 'PASS', detail: 'Fingerprint recovered pointing to Cdr. A. Mehta', weight: 20 },
      { id: 'CHK-02', name: 'Master Document SHA3-256 Digest', status: 'PASS', detail: 'SHA3-256 matches Satcom Frequency plan', weight: 15 },
      { id: 'CHK-03', name: 'Version Alignment & Diff Verification', status: 'PASS', detail: 'Version v1.0', weight: 10 },
      { id: 'CHK-04', name: 'Recipient Authorization Scope', status: 'FAIL', detail: 'Cdr. Mehta was not authorized for this frequency tier', weight: 10 },
      { id: 'CHK-05', name: 'Decryption Event Audit Trail', status: 'FAIL', detail: 'Decryption event signed by Capt. R. Deshmukh', weight: 15 },
      { id: 'CHK-06', name: 'ML-DSA-65 Digital Signature Verification', status: 'PASS', detail: 'Signature valid but belongs to Capt. R. Deshmukh', weight: 15 },
      { id: 'CHK-07', name: 'Tamper-Evident Ledger Block Integrity', status: 'PASS', detail: 'Ledger Block #4189 verified', weight: 10 },
      { id: 'CHK-08', name: 'Provenance Capsule Cryptographic Binding', status: 'FAIL', detail: 'Capsule identity mismatch', weight: 5 },
    ],
    manipulationFindings: [
      {
        detectedIssue: 'Watermark Recipient vs Ledger Cryptographic Signer Conflict',
        evidenceSource: 'Attribution Convergence Engine',
        expected: 'Recipient match Cdr. A. Mehta across all channels',
        observed: 'Watermark indicates Cdr. A. Mehta, but Ledger / Signature proves Capt. R. Deshmukh',
        severity: 'HIGH',
      },
    ],
    collusionAnalysis: {
      status: 'POSSIBLE COLLUSION',
      candidateMatches: [
        { recipientId: 'REC-01', recipientName: 'Cdr. A. Mehta', matchedFragmentsPct: 62.0, overlapSummary: 'Watermark layer match' },
        { recipientId: 'REC-02', recipientName: 'Capt. R. Deshmukh', matchedFragmentsPct: 88.0, overlapSummary: 'Ledger and Signature match' },
      ],
      analysisNote: 'Multiple candidate fingerprint fragments detected across distinct recipient sectors. Collusion or framing suspected.',
    },
    framingAnalysis: {
      isFramingSuspected: true,
      analysisNote: 'Potential framing attempt detected: Visual watermark points to Recipient A, whereas immutable cryptographic ledger logs and hardware token signatures prove Recipient B originated the file.',
      discrepancyDetails: {
        watermarkClaimedRecipient: 'Cdr. A. Mehta (04821-K)',
        ledgerRecordedRecipient: 'Capt. R. Deshmukh (03912-P)',
        signatureMatch: 'Failed (Key belongs to Capt. R. Deshmukh)',
        authorizationMatch: 'Contradictory',
      },
    },
    timeline: [],
  },

  // 4. UNRESOLVED
  {
    id: 'NAVX-0039',
    title: 'Degraded Physical Photo Crop Artifact',
    filename: 'blurry_photo_fragment.jpg',
    uploadedAt: '25 Sep 2026 11:20Z',
    investigator: 'Lt. Amit Saxena',
    status: 'Pending',
    progress: 60,
    verdict: 'UNRESOLVED',
    confidenceScore: 48.0,
    artifact: {
      id: 'ART-0039',
      filename: 'blurry_photo_fragment.jpg',
      artifactType: 'Photograph',
      fileSizeBytes: 980000,
      uploadedAt: '25 Sep 2026 11:20Z',
      investigator: 'Lt. Amit Saxena',
      sourceDescription: 'Social Media Crop',
      priority: 'MEDIUM',
      notes: 'Severe optical blur and 60% crop. Fingerprint layers partially degraded below recovery threshold.',
      transformationMetrics: {
        perspectiveDistortionPct: 14.5,
        jpegCompressionQuality: 45,
        noiseLevelPct: 38.0,
        blurRadiusPx: 3.5,
        cropFactorPct: 62.0,
        rotationDegrees: 8.4,
        screenshotCharacteristics: false,
      },
    },
    evidenceChecks: [
      { id: 'CHK-01', name: 'Multi-Layer Fingerprint Correlation', status: 'UNKNOWN', detail: 'Recovery confidence 48.0% (Below 85.0% threshold)', weight: 20 },
      { id: 'CHK-02', name: 'Master Document SHA3-256 Digest', status: 'UNKNOWN', detail: 'Insufficient uncorrupted bytes for SHA3 sponge match', weight: 15 },
      { id: 'CHK-03', name: 'Version Alignment & Diff Verification', status: 'UNKNOWN', detail: 'Ambiguous version markers', weight: 10 },
      { id: 'CHK-04', name: 'Recipient Authorization Scope', status: 'UNKNOWN', detail: 'Multiple potential clearance candidates', weight: 10 },
      { id: 'CHK-05', name: 'Decryption Event Audit Trail', status: 'UNKNOWN', detail: 'No unique session correlation', weight: 15 },
      { id: 'CHK-06', name: 'ML-DSA-65 Digital Signature Verification', status: 'UNKNOWN', detail: 'Signature block cropped out', weight: 15 },
      { id: 'CHK-07', name: 'Tamper-Evident Ledger Block Integrity', status: 'PASS', detail: 'Ledger integrity preserved', weight: 10 },
      { id: 'CHK-08', name: 'Provenance Capsule Cryptographic Binding', status: 'UNKNOWN', detail: 'Capsule header not present in fragment', weight: 5 },
    ],
    manipulationFindings: [],
    collusionAnalysis: { status: 'INSUFFICIENT EVIDENCE', candidateMatches: [], analysisNote: 'Heavy degradation prevents collusion verification.' },
    framingAnalysis: { isFramingSuspected: false, analysisNote: 'Insufficient data.' },
    timeline: [],
  },

  // 5. NO MATCH
  {
    id: 'NAVX-0038',
    title: 'Unrelated External Document Ingestion',
    filename: 'foreign_maritime_bulletin.pdf',
    uploadedAt: '24 Sep 2026 09:00Z',
    investigator: 'Cdr. K. S. Gill',
    status: 'Closed',
    progress: 100,
    verdict: 'NO MATCH',
    confidenceScore: 12.4,
    artifact: {
      id: 'ART-0038',
      filename: 'foreign_maritime_bulletin.pdf',
      artifactType: 'PDF',
      fileSizeBytes: 1450000,
      uploadedAt: '24 Sep 2026 09:00Z',
      investigator: 'Cdr. K. S. Gill',
      sourceDescription: 'Public Commercial Marine Feed',
      priority: 'LOW',
      notes: 'No correlation to Indian Navy master document registry or cryptographic keys.',
      transformationMetrics: {
        perspectiveDistortionPct: 0.0,
        jpegCompressionQuality: 95,
        noiseLevelPct: 1.0,
        blurRadiusPx: 0.0,
        cropFactorPct: 0.0,
        rotationDegrees: 0.0,
        screenshotCharacteristics: false,
      },
    },
    evidenceChecks: [
      { id: 'CHK-01', name: 'Multi-Layer Fingerprint Correlation', status: 'FAIL', detail: 'Zero steganographic layers or zero-width unicode detected', weight: 20 },
      { id: 'CHK-02', name: 'Master Document SHA3-256 Digest', status: 'FAIL', detail: 'Digest not present in Naval Registry', weight: 15 },
      { id: 'CHK-03', name: 'Version Alignment & Diff Verification', status: 'FAIL', detail: 'No matching document version found', weight: 10 },
      { id: 'CHK-04', name: 'Recipient Authorization Scope', status: 'FAIL', detail: 'No associated authorization policy', weight: 10 },
      { id: 'CHK-05', name: 'Decryption Event Audit Trail', status: 'FAIL', detail: 'Zero decryption events on record', weight: 15 },
      { id: 'CHK-06', name: 'ML-DSA-65 Digital Signature Verification', status: 'FAIL', detail: 'No valid Naval PQC signature', weight: 15 },
      { id: 'CHK-07', name: 'Tamper-Evident Ledger Block Integrity', status: 'PASS', detail: 'Ledger valid (No event registered)', weight: 10 },
      { id: 'CHK-08', name: 'Provenance Capsule Cryptographic Binding', status: 'FAIL', detail: 'No provenance capsule found', weight: 5 },
    ],
    manipulationFindings: [],
    collusionAnalysis: { status: 'NO COLLUSION INDICATED', candidateMatches: [], analysisNote: 'Unrelated external document.' },
    framingAnalysis: { isFramingSuspected: false, analysisNote: 'No correlation to internal personnel.' },
    timeline: [],
  },
];

const INITIAL_RULES: AlertRule[] = [
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
];

const INITIAL_ALERTS: SecurityAlert[] = [
  {
    id: 'ALT-2026-901',
    type: 'LEAK_DETECTED',
    severity: 'CRITICAL',
    timestamp: '27 Sep 2026 05:02Z',
    source: 'Simulated Dark Web Monitor',
    documentId: 'NAV-DOC-2026-0042',
    documentName: 'Mission_Plan_Bravo.pdf',
    recipientId: 'REC-01',
    recipientName: 'Cdr. A. Mehta',
    investigationId: 'NAVX-0042',
    message: 'Potential Leak Match: Steganographic watermark match on external paste site (Confidence 99.8%).',
    status: 'INVESTIGATING',
  },
  {
    id: 'ALT-2026-900',
    type: 'REPEATED_ACCESS_DENIED',
    severity: 'HIGH',
    timestamp: '27 Sep 2026 07:11Z',
    source: 'Access Controller (Bridge Auxiliary Node)',
    documentId: 'NAV-DOC-2026-0042',
    documentName: 'Mission_Plan_Bravo.pdf',
    message: 'Repeated Access Denied: 3 blocked decryption attempts under EMCON Alpha restrictions.',
    status: 'NEW',
  },
];

const INITIAL_DISCONNECTED_UNITS: DisconnectedUnit[] = [
  {
    id: 'DISC-01',
    name: 'INS Visakhapatnam (D66) - Sector 17A',
    callsign: 'D66-OFFLINE',
    offlineSince: '27 Sep 2026 06:00Z (5h 15m)',
    pendingEventCount: 6,
    emconState: 'EMCON Alpha (Full Silence)',
    sector: 'North Arabian Sea Patrol Box',
    localEvents: [
      {
        eventId: 'EVT-OFFLINE-01',
        recipientPseudonym: 'Lt. Priya Singh (06244-S)',
        documentId: 'NAV-DOC-2026-0042',
        documentName: 'Mission_Plan_Bravo.pdf',
        documentVersion: 'v2.1',
        timestamp: '27 Sep 2026 06:30Z',
        signatureStatus: 'ML-DSA-65 Valid',
        channel: 'Air-Gap Optical Diode',
        accessType: 'View Only',
        nonce: '88fa12bb',
        merkleLeaf: '0x99aa11223344...',
      },
    ],
  },
  {
    id: 'DISC-02',
    name: 'INS Vikramaditya (R33) - Battle Group',
    callsign: 'R33-OFFLINE',
    offlineSince: '27 Sep 2026 07:30Z (3h 45m)',
    pendingEventCount: 11,
    emconState: 'EMCON Bravo (Restricted SATCOM)',
    sector: 'Deep Sea Sector Bravo',
    localEvents: [],
  },
  {
    id: 'DISC-03',
    name: 'UAV-Alpha-03 Surveillance Flight',
    callsign: 'DRONE-03-OFFLINE',
    offlineSince: '27 Sep 2026 09:12Z (2h 03m)',
    pendingEventCount: 3,
    emconState: 'EMCON Alpha (Full Silence)',
    sector: 'Goa Outer Perimeter',
    localEvents: [],
  },
];

const INITIAL_JOBS: MonitoringJob[] = [
  { id: 'JOB-01', name: 'Tor .onion & Tactical Pastebins', sourceCategory: 'Dark Web', lastScannedAt: '3 mins ago', artifactsScannedCount: 1420, matchCount: 1, status: 'Alert' },
  { id: 'JOB-02', name: 'Defense Strategy & Military Forums', sourceCategory: 'Forums', lastScannedAt: '8 mins ago', artifactsScannedCount: 890, matchCount: 0, status: 'Idle' },
  { id: 'JOB-03', name: 'Open Intelligence Feeds', sourceCategory: 'Open Websites', lastScannedAt: '12 mins ago', artifactsScannedCount: 2310, matchCount: 0, status: 'Scanning' },
  { id: 'JOB-04', name: 'Classified File Sharing Relay Trackers', sourceCategory: 'File Sharing', lastScannedAt: '15 mins ago', artifactsScannedCount: 450, matchCount: 0, status: 'Idle' },
];

const INITIAL_CANDIDATES: LeakCandidate[] = [
  {
    id: 'LEAK-CAND-01',
    jobId: 'JOB-01',
    sourceName: 'Tor Tactical Drop Hub #04',
    discoveredAt: '27 Sep 2026 05:02Z',
    artifactFileName: 'leaked_strike_plan_sample.pdf',
    similarityScore: 99.8,
    matchedDocumentId: 'NAV-DOC-2026-0042',
    matchedDocumentName: 'Mission_Plan_Bravo.pdf',
    matchedFingerprintId: 'FP-0042-REC-01',
    matchedVersion: 'v2.1',
    extractedRecipientName: 'Cdr. A. Mehta (04821-K)',
    status: 'Investigation Opened',
  },
];

// ─────────────────────────────────────────────────────────────
// CENTRAL REACTIVE STORE CLASS
// ─────────────────────────────────────────────────────────────
class CentralStore {
  private state: CentralStoreState;
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.state = this.loadState();
  }

  private loadState(): CentralStoreState {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const saved = window.localStorage.getItem(STORE_KEY);
        if (saved) {
          return JSON.parse(saved);
        }
      }
    } catch (e) {
      console.warn('Could not read from localStorage, using initial seed data:', e);
    }

    return this.getInitialState();
  }

  private getInitialState(): CentralStoreState {
    // Generate initial capsules and fingerprints
    const initialCapsules: ProvenanceCapsule[] = [
      provenanceService.createCapsule({
        documentId: 'NAV-DOC-2026-0042',
        documentName: 'Mission_Plan_Bravo.pdf',
        documentVersion: 'v2.1',
        documentSha3Hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
        recipientId: 'REC-01',
        recipientName: 'Cdr. A. Mehta',
        recipientPno: '04821-K',
        recipientUnit: 'INS Vikramaditya (R33)',
        deviceId: 'HW-HSM-9021',
        sessionId: 'SESS-2026-9042',
        decryptionEventId: 'EVT-88420',
        fingerprintId: 'FP-0042-REC-01',
        watermarkId: 'WM-0042-MEHTA',
        authorizationPolicyId: 'POL-01',
        ledgerBlockNumber: 4192,
        ledgerEventId: 'EVT-88420',
      }),
    ];

    const initialFingerprints: DocumentFingerprint[] = [
      fingerprintEngine.generateFingerprint(
        'NAV-DOC-2026-0042',
        'v2.1',
        'REC-01',
        'Cdr. A. Mehta (04821-K)',
        'SESS-2026-9042'
      ),
    ];

    return {
      documents: JSON.parse(JSON.stringify(INITIAL_DOCUMENTS)),
      recipients: JSON.parse(JSON.stringify(INITIAL_RECIPIENTS)),
      policies: JSON.parse(JSON.stringify(INITIAL_POLICIES)),
      requests: JSON.parse(JSON.stringify(INITIAL_REQUESTS)),
      deniedLogs: JSON.parse(JSON.stringify(INITIAL_DENIED_LOGS)),
      distributions: [],
      decryptions: [
        {
          eventId: 'EVT-88420',
          documentId: 'NAV-DOC-2026-0042',
          documentName: 'Mission_Plan_Bravo.pdf',
          documentVersion: 'v2.1',
          recipientId: 'REC-01',
          recipientName: 'Cdr. A. Mehta',
          recipientPseudonym: 'Cdr. A. Mehta (04821-K)',
          timestamp: '27 Sep 2026 04:54Z',
          deviceId: 'HW-HSM-9021',
          sessionId: 'SESS-2026-9042',
          provenanceCapsuleId: 'CAPSULE-2026-0042-REC-01',
          signatureStatus: 'ML-DSA-65 Valid',
          signatureHex: '0xSIG_MLDSA65_VALID_AUTHENTIC_SIGNATURE',
          channel: 'Decryption Event (In-Memory)',
          accessType: 'View Only',
          nonce: '9a38f71c',
          merkleLeaf: '0x4a8f22091bc8...',
          ledgerBlockNumber: 4192,
        },
      ],
      provenanceCapsules: initialCapsules,
      fingerprints: initialFingerprints,
      ledgerBlocks: JSON.parse(JSON.stringify(INITIAL_BLOCKS)),
      investigations: JSON.parse(JSON.stringify(INITIAL_INVESTIGATIONS)),
      alertRules: JSON.parse(JSON.stringify(INITIAL_RULES)),
      alerts: JSON.parse(JSON.stringify(INITIAL_ALERTS)),
      disconnectedUnits: JSON.parse(JSON.stringify(INITIAL_DISCONNECTED_UNITS)),
      monitoringJobs: JSON.parse(JSON.stringify(INITIAL_JOBS)),
      leakCandidates: JSON.parse(JSON.stringify(INITIAL_CANDIDATES)),
      isLedgerTampered: false,
      tamperedBlockNumber: 4188,
    };
  }

  private save(): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(STORE_KEY, JSON.stringify(this.state));
      }
    } catch (e) {
      console.error('Failed to save central state to localStorage:', e);
    }
    this.notify();
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify(): void {
    this.listeners.forEach((l) => l());
  }

  public getState(): CentralStoreState {
    return this.state;
  }

  // ─────────────────────────────────────────────────────────
  // STATE MUTATION ACTIONS
  // ─────────────────────────────────────────────────────────

  /**
   * Reset the entire local prototype environment to initial clean seed data
   */
  public resetDemoEnvironment(): void {
    this.state = this.getInitialState();
    this.save();
  }

  /**
   * Ingest a new document into the master registry
   */
  public ingestDocument(doc: Partial<DocumentRecord>): DocumentRecord {
    const id = doc.id || `NAV-DOC-2026-00${String(this.state.documents.length + 43).padStart(2, '0')}`;
    const newDoc: DocumentRecord = {
      id,
      name: doc.name || 'Untitled_Classified_Document.pdf',
      masterDocId: doc.masterDocId || `DOC-${Math.floor(10000 + Math.random() * 90000)}-NAV`,
      version: doc.version || 'v1.0',
      classification: doc.classification || 'SECRET',
      documentType: doc.documentType || 'Tactical Operation',
      sizeBytes: doc.sizeBytes || 10485760,
      status: 'Approved',
      sha3Hash: doc.sha3Hash || sha256Sync(doc.name || 'Untitled'),
      recipientCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      metadataSanitized: true,
      watermarkCoveragePct: 99.0,
      tags: doc.tags || ['Tactical', 'Naval Command'],
      securityCaveats: 'Encrypted Air-Gap Cache Only',
      pqcEncapsulationStatus: 'ML-KEM-768 Encapsulated (Local Demo)',
      versions: [
        {
          versionId: `VER-${id.slice(-4)}-1.0`,
          documentId: id,
          version: doc.version || 'v1.0',
          fileHash: doc.sha3Hash || sha256Sync(doc.name || 'Untitled'),
          author: 'Directorate of Naval Operations',
          changeNotes: 'Initial document release.',
          releasedAt: new Date().toISOString(),
          linkedDecryptionEvents: [],
        },
      ],
    };

    this.state.documents.unshift(newDoc);
    this.save();
    return newDoc;
  }

  /**
   * Executes cryptographic document distribution to authorized recipients
   */
  public distributeDocument(params: {
    documentId: string;
    recipientIds: string[];
    accessType: DocumentRecord['status'] extends any ? 'View Only' | 'Full Access' | 'Download' | 'Print' : any;
    policyId?: string;
  }): DistributionEvent {
    const doc = this.state.documents.find((d) => d.id === params.documentId) || this.state.documents[0];
    const targetRecipients = this.state.recipients.filter((r) => params.recipientIds.includes(r.id));
    const distId = `DIST-${Date.now().toString().slice(-6)}`;
    const timestamp = new Date().toISOString();

    const recipientAssociations = targetRecipients.map((r) => {
      // Perform ML-KEM-768 key encapsulation
      const kemResult = pqcService.encapsulate(r.publicKeyMLKEM, doc.id);
      r.documentsReceived += 1;
      return {
        recipientId: r.id,
        recipientName: r.name,
        rank: r.rank,
        unit: r.unit,
        kemCiphertext: kemResult.ciphertext,
        accessType: params.accessType,
        status: 'Distributed' as const,
      };
    });

    const distEvent: DistributionEvent = {
      distributionId: distId,
      documentId: doc.id,
      documentName: doc.name,
      documentVersion: doc.version,
      masterDocId: doc.masterDocId,
      classification: doc.classification,
      recipients: recipientAssociations,
      timestamp,
      encryptionAlgorithm: 'AES-256-GCM + ML-KEM-768 (Local Demo)',
      documentEncryptionKeyHash: `0xKEY_${sha256Sync(doc.id + ':KEY').slice(0, 32)}`,
      policyId: params.policyId || 'POL-01',
    };

    doc.status = 'Distributed';
    doc.recipientCount = (doc.recipientCount || 0) + targetRecipients.length;
    doc.updatedAt = timestamp;

    this.state.distributions.unshift(distEvent);
    this.save();
    return distEvent;
  }

  /**
   * Simulates authorized recipient decryption
   * Generates: DecryptionEvent -> ProvenanceCapsule -> Fingerprint -> SignedEvent -> LedgerBlock
   */
  public executeRecipientDecryption(documentId: string, recipientId: string): {
    decryptionEvent: DecryptionEvent;
    capsule: ProvenanceCapsule;
    fingerprint: DocumentFingerprint;
    ledgerBlock: LedgerBlock;
  } {
    const doc = this.state.documents.find((d) => d.id === documentId) || this.state.documents[0];
    const rec = this.state.recipients.find((r) => r.id === recipientId) || this.state.recipients[0];

    if (rec.status === 'Revoked') {
      throw new Error(`Access Denied: Recipient ${rec.name} (${rec.pno}) clearance has been revoked.`);
    }

    const eventId = `EVT-${Math.floor(10000 + Math.random() * 90000)}`;
    const sessionId = `SESS-${Date.now().toString().slice(-6)}`;
    const timestamp = new Date().toISOString();
    const nextBlockNumber = Math.max(...this.state.ledgerBlocks.map((b) => b.blockNumber), 4192) + 1;
    const recipientPseudonym = `${rec.name} (${rec.pno})`;

    // 1. Generate Fingerprint
    const fingerprint = fingerprintEngine.generateFingerprint(
      doc.id,
      doc.version,
      rec.id,
      recipientPseudonym,
      sessionId
    );
    this.state.fingerprints.unshift(fingerprint);

    // 2. Generate Provenance Capsule
    const capsule = provenanceService.createCapsule({
      documentId: doc.id,
      documentName: doc.name,
      documentVersion: doc.version,
      documentSha3Hash: doc.sha3Hash,
      recipientId: rec.id,
      recipientName: rec.name,
      recipientPno: rec.pno,
      recipientUnit: rec.unit,
      deviceId: rec.hardwareDeviceId,
      sessionId,
      decryptionEventId: eventId,
      fingerprintId: fingerprint.fingerprintId,
      watermarkId: `WM-${doc.id.slice(-4)}-${rec.id}`,
      authorizationPolicyId: 'POL-01',
      ledgerBlockNumber: nextBlockNumber,
      ledgerEventId: eventId,
      signerPrivateKeySeed: rec.id,
    });
    this.state.provenanceCapsules.unshift(capsule);

    // 3. Create Decryption Event
    const decEvent: DecryptionEvent = {
      eventId,
      documentId: doc.id,
      documentName: doc.name,
      documentVersion: doc.version,
      recipientId: rec.id,
      recipientName: rec.name,
      recipientPseudonym,
      timestamp,
      deviceId: rec.hardwareDeviceId,
      sessionId,
      provenanceCapsuleId: capsule.capsuleId,
      signatureStatus: 'ML-DSA-65 Valid',
      signatureHex: capsule.signatureHex,
      channel: 'Hardware Security Module (In-Memory)',
      accessType: 'View Only',
      nonce: sha256Sync(sessionId).slice(0, 8),
      merkleLeaf: `0x${sha256Sync(eventId + '::' + capsule.capsuleId).slice(0, 24)}...`,
      ledgerBlockNumber: nextBlockNumber,
    };
    this.state.decryptions.unshift(decEvent);

    // 4. Commit to Ledger Block
    const prevBlock = this.state.ledgerBlocks[0];
    const newBlock: LedgerBlock = {
      blockNumber: nextBlockNumber,
      timestamp,
      merkleRootHash: `0x${sha256Sync(eventId + '::MERKLE_ROOT').slice(0, 48)}`,
      previousBlockHash: prevBlock ? prevBlock.currentBlockHash : '0x0000000000000000000000000000000000000000',
      currentBlockHash: `0x${sha256Sync(nextBlockNumber + '::' + timestamp).slice(0, 40)}`,
      eventCount: 1,
      validatingNode: `HQ-WNC-MUMBAI (PQC Validator)`,
      status: 'Verified',
      events: [
        {
          eventId,
          recipientPseudonym,
          documentId: doc.id,
          documentName: doc.name,
          documentVersion: doc.version,
          timestamp,
          signatureStatus: 'ML-DSA-65 Valid',
          channel: 'Decryption Event (In-Memory)',
          accessType: 'View Only',
          nonce: decEvent.nonce,
          merkleLeaf: decEvent.merkleLeaf,
          provenanceCapsuleId: capsule.capsuleId,
        },
      ],
    };
    this.state.ledgerBlocks.unshift(newBlock);

    this.save();
    return { decryptionEvent: decEvent, capsule, fingerprint, ledgerBlock: newBlock };
  }

  /**
   * Revokes a recipient's cryptographic clearance.
   * Crucial rule: Future access is denied, but past provenance records and ledger events are preserved.
   */
  public revokeRecipient(recipientId: string, reason: string): Recipient {
    const rec = this.state.recipients.find((r) => r.id === recipientId);
    if (!rec) throw new Error(`Recipient ${recipientId} not found.`);

    rec.status = 'Revoked';
    rec.revocationReason = reason;
    rec.revokedAt = new Date().toISOString();

    // Log security alert
    this.state.alerts.unshift({
      id: `ALT-REVOKE-${rec.id}`,
      type: 'UNAUTHORIZED_DEVICE',
      severity: 'MEDIUM',
      timestamp: new Date().toISOString(),
      source: 'Security Authorization Office',
      recipientId: rec.id,
      recipientName: rec.name,
      message: `Cryptographic clearance revoked for ${rec.name} (${rec.pno}). Reason: ${reason}. Historical provenance records preserved.`,
      status: 'NEW',
    });

    this.save();
    return rec;
  }

  /**
   * Simulates a tampering attempt on the local ledger
   */
  public simulateTamper(): { isTampered: boolean; blockNumber: number } {
    this.state.isLedgerTampered = true;
    const block = this.state.ledgerBlocks.find((b) => b.blockNumber === this.state.tamperedBlockNumber) || this.state.ledgerBlocks[0];
    if (block) {
      block.isTampered = true;
      block.status = 'Tampered';
      block.merkleRootHash = '0xDEADBEEF9910aa112349bc981244dff98012TAMPER';
      block.tamperDetail = 'Merkle root hash does not match block event leaf syndrome. Historical record corruption detected at leaf #2.';
    }

    this.state.alerts.unshift({
      id: `ALT-TAMPER-${Date.now()}`,
      type: 'LEDGER_TAMPERING',
      severity: 'CRITICAL',
      timestamp: new Date().toISOString(),
      source: 'Ledger Hash Chain Auditor',
      message: `CRITICAL INTEGRITY FAILURE: Cryptographic hash syndrome discrepancy at Block #${this.state.tamperedBlockNumber}.`,
      status: 'NEW',
    });

    this.save();
    return { isTampered: true, blockNumber: this.state.tamperedBlockNumber };
  }

  /**
   * Resets ledger tamper state
   */
  public resetLedger(): void {
    this.state.isLedgerTampered = false;
    this.state.ledgerBlocks = JSON.parse(JSON.stringify(INITIAL_BLOCKS));
    this.save();
  }

  /**
   * Reconciles an offline disconnected unit
   */
  public reconcileUnit(unitId: string): {
    unitName: string;
    eventsMergedCount: number;
    newBlockNumber: number;
  } {
    const unit = this.state.disconnectedUnits.find((u) => u.id === unitId) || this.state.disconnectedUnits[0];
    const nextBlockNumber = Math.max(...this.state.ledgerBlocks.map((b) => b.blockNumber), 4192) + 1;
    const timestamp = new Date().toISOString();

    const reconciled = reconciliationEngine.reconcile(
      this.state.ledgerBlocks.flatMap((b) => b.events),
      unit.localEvents
    );

    const prevBlock = this.state.ledgerBlocks[0];
    const newBlock: LedgerBlock = {
      blockNumber: nextBlockNumber,
      timestamp,
      merkleRootHash: `0x${sha256Sync(unit.id + '::RECON_ROOT').slice(0, 48)}`,
      previousBlockHash: prevBlock ? prevBlock.currentBlockHash : '0x0000000000000000000000000000000000000000',
      currentBlockHash: `0x${sha256Sync(nextBlockNumber + '::' + timestamp).slice(0, 40)}`,
      eventCount: reconciled.newEvents.length || 1,
      validatingNode: `Air-Gap Reconciled Node (${unit.name})`,
      status: 'Verified',
      events: reconciled.newEvents.length > 0 ? reconciled.newEvents : [
        {
          eventId: `EVT-REC-${Date.now().toString().slice(-4)}`,
          recipientPseudonym: `${unit.name} Terminal`,
          documentId: 'NAV-DOC-2026-0042',
          documentName: 'Mission_Plan_Bravo.pdf',
          documentVersion: 'v2.1',
          timestamp: 'Offline Batch Commit',
          signatureStatus: 'ML-DSA-65 Valid',
          channel: 'Air-Gap Optical Diode Transfer',
          accessType: 'View Only',
          nonce: '88bc12aa',
          merkleLeaf: '0x99aa001923fa...',
        },
      ],
    };

    this.state.ledgerBlocks.unshift(newBlock);
    unit.pendingEventCount = 0;
    unit.localEvents = [];

    this.save();
    return {
      unitName: unit.name,
      eventsMergedCount: newBlock.eventCount,
      newBlockNumber: nextBlockNumber,
    };
  }

  /**
   * Approves an authorization request
   */
  public approveRequest(requestId: string, approverName: string, note?: string): AuthorizationRequest {
    const req = this.state.requests.find((r) => r.id === requestId);
    if (!req) throw new Error(`Request ${requestId} not found.`);
    req.status = 'Approved';
    req.decidedBy = approverName;
    req.decidedAt = new Date().toISOString();
    req.decisionNote = note || 'Approved with cryptographic clearance.';
    this.save();
    return req;
  }

  /**
   * Denies an authorization request and logs access denial
   */
  public denyRequest(requestId: string, denierName: string, reason: string): AuthorizationRequest {
    const req = this.state.requests.find((r) => r.id === requestId);
    if (!req) throw new Error(`Request ${requestId} not found.`);
    req.status = 'Denied';
    req.decidedBy = denierName;
    req.decidedAt = new Date().toISOString();
    req.decisionNote = reason;

    // Create access denied log
    this.state.deniedLogs.unshift({
      id: `DENY-${Date.now().toString().slice(-3)}`,
      timeZ: new Date().toISOString().slice(11, 16),
      timeLocal: 'Just now',
      requester: req.requesterName,
      rank: req.requesterRank,
      unit: req.requesterUnit,
      deviceId: 'TERM-UNAUTH',
      documentId: req.documentId,
      documentName: req.documentName,
      reasonForDenial: 'Not Authorized',
      alertFired: true,
      ipAddress: '10.14.99.12',
      terminalNode: 'Command Console Port',
    });

    this.save();
    return req;
  }

  /**
   * Creates or evaluates an Investigation Case
   */
  public createInvestigation(caseData: Partial<InvestigationCase>): InvestigationCase {
    const id = caseData.id || `NAVX-${String(this.state.investigations.length + 43).padStart(4, '0')}`;
    const newCase: InvestigationCase = {
      id,
      title: caseData.title || `Forensic Leak Analysis for ${caseData.filename || 'leaked_file.pdf'}`,
      filename: caseData.filename || 'leaked_file.pdf',
      uploadedAt: new Date().toISOString(),
      investigator: caseData.investigator || 'Lead Forensic Officer',
      status: 'Identified',
      progress: 100,
      verdict: caseData.verdict || 'PROVENANCE VERIFIED',
      confidenceScore: caseData.confidenceScore || 99.8,
      artifact: caseData.artifact || {
        id: `ART-${id}`,
        filename: caseData.filename || 'leaked_file.pdf',
        artifactType: 'PDF',
        fileSizeBytes: 2048000,
        uploadedAt: new Date().toISOString(),
        investigator: caseData.investigator || 'Lead Forensic Officer',
        sourceDescription: 'Uploaded Leak Sample',
        priority: 'HIGH',
        notes: 'Forensic evaluation initiated.',
        transformationMetrics: {
          perspectiveDistortionPct: 0.0,
          jpegCompressionQuality: 90,
          noiseLevelPct: 5.0,
          blurRadiusPx: 0.2,
          cropFactorPct: 0.0,
          rotationDegrees: 0.0,
          screenshotCharacteristics: false,
        },
      },
      matchedDocument: caseData.matchedDocument || {
        id: 'NAV-DOC-2026-0042',
        name: 'Mission_Plan_Bravo.pdf',
        masterDocId: 'DOC-88219-BRAVO',
        matchedVersion: 'v2.1',
        sha3Hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      },
      topMatch: caseData.topMatch || {
        recipientId: 'REC-01',
        name: 'Cdr. A. Mehta',
        rank: 'Commander',
        pno: '04821-K',
        unit: 'INS Vikramaditya (R33)',
        confidenceScore: 99.8,
        seedFingerprint: '0x88f21ac0981baacc',
        decryptedTimestamp: '27 Sep 2026 04:54Z',
        matchedVersion: 'v2.1',
        provenanceCapsuleId: 'CAPSULE-2026-0042-REC-01',
      },
      evidenceChecks: caseData.evidenceChecks || [
        { id: 'CHK-01', name: 'Multi-Layer Fingerprint Correlation', status: 'PASS', detail: '5-Layer correlation score: 99.8%', weight: 20 },
        { id: 'CHK-02', name: 'Master Document SHA3-256 Digest', status: 'PASS', detail: 'Exact match against master record', weight: 15 },
        { id: 'CHK-03', name: 'Version Alignment & Diff Verification', status: 'PASS', detail: 'Matched version v2.1', weight: 10 },
        { id: 'CHK-04', name: 'Recipient Authorization Scope', status: 'PASS', detail: 'Valid authorization policy POL-01', weight: 10 },
        { id: 'CHK-05', name: 'Decryption Event Audit Trail', status: 'PASS', detail: 'HSM decryption record verified', weight: 15 },
        { id: 'CHK-06', name: 'ML-DSA-65 Digital Signature Verification', status: 'PASS', detail: 'PQC signature valid', weight: 15 },
        { id: 'CHK-07', name: 'Tamper-Evident Ledger Block Integrity', status: 'PASS', detail: 'Ledger block verified', weight: 10 },
        { id: 'CHK-08', name: 'Provenance Capsule Cryptographic Binding', status: 'PASS', detail: 'Capsule sealed and verified', weight: 5 },
      ],
      manipulationFindings: caseData.manipulationFindings || [],
      collusionAnalysis: caseData.collusionAnalysis || {
        status: 'NO COLLUSION INDICATED',
        candidateMatches: [],
        analysisNote: 'Single source attribution confirmed.',
      },
      framingAnalysis: caseData.framingAnalysis || {
        isFramingSuspected: false,
        analysisNote: 'Co-aligned signatures and watermark.',
      },
      timeline: caseData.timeline || [],
    };

    this.state.investigations.unshift(newCase);
    this.save();
    return newCase;
  }

  /**
   * Logs an unauthorized access attempt to the Access Denied audit log
   */
  public logAccessDenied(entry: {
    requester: string;
    rank: string;
    unit: string;
    deviceId: string;
    documentId?: string;
    documentName?: string;
    reasonForDenial: string;
  }): AccessDeniedLog {
    const now = new Date();
    const timeZ = now.toISOString().slice(11, 16);
    const timeLocal = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')} IST`;

    const newLog: AccessDeniedLog = {
      id: `DENY-${Date.now().toString().slice(-4)}`,
      timeZ,
      timeLocal,
      requester: entry.requester,
      rank: entry.rank,
      unit: entry.unit,
      deviceId: entry.deviceId || 'OFF-TERM-09',
      documentId: entry.documentId || 'SEC-RESTRICTED-ROUTE',
      documentName: entry.documentName || 'Restricted Command Resource',
      reasonForDenial: (entry.reasonForDenial as any) || 'Not Authorized',
      alertFired: true,
      ipAddress: '10.14.88.42',
      terminalNode: 'Console Port 443',
    };

    this.state.deniedLogs.unshift(newLog);

    // Also push a security alert
    this.state.alerts.unshift({
      id: `ALT-DENY-${Date.now()}`,
      type: 'UNAUTHORIZED_DEVICE',
      severity: 'HIGH',
      timestamp: now.toISOString(),
      source: 'Role Authorization Guard',
      message: `UNAUTHORIZED ACCESS ATTEMPT: ${entry.rank} ${entry.requester} (${entry.unit}) attempted unauthorized access to ${entry.documentName || 'Restricted Resource'}. Reason: ${entry.reasonForDenial}.`,
      status: 'NEW',
    });

    this.save();
    return newLog;
  }

  /**
   * Adds an access request from an officer
   */
  public addAccessRequest(req: {
    requesterName: string;
    requesterRank: string;
    requesterPno: string;
    requesterUnit: string;
    documentId: string;
    documentName?: string;
    reasonGiven: string;
  }): AuthorizationRequest {
    const id = `REQ-2026-${String(this.state.requests.length + 85).padStart(3, '0')}`;
    const newRequest: AuthorizationRequest = {
      id,
      requesterName: req.requesterName,
      requesterRank: req.requesterRank,
      requesterPno: req.requesterPno,
      requesterUnit: req.requesterUnit,
      documentId: req.documentId,
      documentName: req.documentName || `Document Reference ${req.documentId}`,
      documentClassification: 'SECRET',
      reasonGiven: req.reasonGiven,
      requestedOn: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) + ' ' + new Date().toISOString().slice(11, 16) + 'Z',
      status: 'Pending',
      requiredApproverRole: 'Commanding Officer / Fleet Ops',
    };

    this.state.requests.unshift(newRequest);
    this.save();
    return newRequest;
  }

  /**
   * Reports a lost cryptographic hardware token / key
   */
  public reportLostKey(keyId: string, officerName: string, reason: string): void {
    this.state.alerts.unshift({
      id: `ALT-LOSTKEY-${Date.now()}`,
      type: 'UNAUTHORIZED_DEVICE',
      severity: 'CRITICAL',
      timestamp: new Date().toISOString(),
      source: 'Hardware Key Manager',
      message: `CRITICAL KEY REVOCATION: Officer ${officerName} reported lost/compromised key ${keyId}. Reason: ${reason}. Key blacklisted immediately.`,
      status: 'NEW',
    });
    this.save();
  }
}

export const centralStore = new CentralStore();

