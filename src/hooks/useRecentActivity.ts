import { useQuery } from '@tanstack/react-query';
import type { ActivityEvent } from '../types/commandCenter';

const mockActivity: ActivityEvent[] = [
  {
    id: 'ACT-001',
    time: '12:41',
    timestamp: '2026-09-27T12:41:00+05:30',
    event: 'Decryption',
    documentId: 'NAV-OPS-042',
    documentTitle: 'Fleet Exercise Bravo Deployment Orders',
    recipientUnit: 'UNIT ALPHA-07',
    status: 'Verified',
    statusType: 'green',
    detailsUrl: '/documents/NAV-OPS-042'
  },
  {
    id: 'ACT-002',
    time: '12:38',
    timestamp: '2026-09-27T12:38:00+05:30',
    event: 'Decryption',
    documentId: 'NAV-INTEL-018',
    documentTitle: 'Eastern Littoral Hydrographic Intel',
    recipientUnit: 'INS CHENNAI',
    status: 'Verified',
    statusType: 'green',
    detailsUrl: '/documents/NAV-INTEL-018'
  },
  {
    id: 'ACT-003',
    time: '12:31',
    timestamp: '2026-09-27T12:31:00+05:30',
    event: 'Decryption',
    documentId: 'NAV-OPS-042',
    documentTitle: 'Fleet Exercise Bravo Deployment Orders',
    recipientUnit: 'WESTERN CMD',
    status: 'Verified',
    statusType: 'green',
    detailsUrl: '/documents/NAV-OPS-042'
  },
  {
    id: 'ACT-004',
    time: '12:28',
    timestamp: '2026-09-27T12:28:00+05:30',
    event: 'Ledger Commit',
    documentId: 'BLK-18471',
    documentTitle: 'Block 18471 State Merkle Root Verification',
    recipientUnit: '—',
    status: 'Verified',
    statusType: 'green',
    detailsUrl: '/ledger/BLK-18471'
  },
  {
    id: 'ACT-005',
    time: '12:21',
    timestamp: '2026-09-27T12:21:00+05:30',
    event: 'Investigation',
    documentId: 'NAVX-0042',
    documentTitle: 'LEAK-0042 Forensic Artifact Analysis',
    recipientUnit: '—',
    status: 'Analyzing',
    statusType: 'orange',
    detailsUrl: '/investigations/NAVX-0042'
  },
  {
    id: 'ACT-006',
    time: '12:10',
    timestamp: '2026-09-27T12:10:00+05:30',
    event: 'Reconciliation',
    documentId: 'EMCON-017',
    documentTitle: 'Air-gap Cryptographic Envelope Sync',
    recipientUnit: '—',
    status: 'Completed',
    statusType: 'green',
    detailsUrl: '/emcon/EMCON-017'
  }
];

export const useRecentActivity = () => {
  return useQuery({
    queryKey: ['recent-activity'],
    queryFn: async (): Promise<ActivityEvent[]> => {
      await new Promise((resolve) => setTimeout(resolve, 150));
      return mockActivity;
    },
    staleTime: 1000 * 60 * 2,
  });
};
