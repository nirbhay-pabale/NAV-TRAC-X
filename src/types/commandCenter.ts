export interface StatCardData {
  id: string;
  title: string;
  value: string | number;
  subtitle: string;
  accentColor: 'blue' | 'green' | 'purple' | 'red';
  route: string;
  sparkline: number[];
  badge?: {
    text: string;
    trend: 'up' | 'down' | 'neutral';
  };
}

export interface ActivityEvent {
  id: string;
  time: string;
  timestamp: string;
  event: 'Decryption' | 'Ledger Commit' | 'Investigation' | 'Reconciliation' | string;
  documentId: string;
  documentTitle?: string;
  recipientUnit: string;
  status: 'Verified' | 'Analyzing' | 'Completed' | 'Alert' | 'Pending';
  statusType: 'green' | 'blue' | 'orange' | 'red';
  detailsUrl?: string;
}

export interface InvestigationCase {
  caseId: string;
  artifact: string;
  artifactSize?: string;
  progress: number;
  status: 'Analyzing' | 'Verified' | 'Unresolved';
  statusType: 'orange' | 'teal' | 'red';
  openedAt: string;
  assignedOfficer: string;
  targetUnit?: string;
  forensicSteps?: {
    step: string;
    completed: boolean;
    result?: string;
  }[];
}

export interface SystemServiceStatus {
  id: string;
  name: string;
  status: 'Healthy' | 'Verified' | 'Active' | 'Degraded' | 'Down';
  statusType: 'green' | 'amber' | 'red';
  icon: 'database' | 'chain' | 'signature' | 'fingerprint' | 'auth' | 'emcon';
  latencyMs?: number;
}

export interface SystemHealthData {
  overallStatus: 'Operational' | 'Degraded' | 'Disrupted';
  overallStatusType: 'green' | 'amber' | 'red';
  services: SystemServiceStatus[];
}

export interface SystemModeData {
  mode: 'EMCON_AIR_GAPPED' | 'STANDARD_SECURE' | 'HIGH_ALERT';
  isAirGapped: boolean;
  label: string;
  sublabel: string;
  transmissionAllowed: boolean;
}
