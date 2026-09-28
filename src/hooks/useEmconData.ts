import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../api/client';
import type {
  EmconPostureStatus,
  CommsControlItem,
  CommsControlId,
  CommsControlState,
  PqcCryptoStatusItem,
  SystemHealthItem,
  TacticalUnit,
  EmconZone,
  EmconEvent,
  EmconIncident,
  CommunicationLogEntry,
  CommsLogFilters
} from '../types/emcon';

// Initial Mock State Stores
let globalCommsControls: CommsControlItem[] = [
  {
    id: 'rf_emissions',
    name: 'RF Emissions',
    state: 'BLOCKED',
    color: 'red',
    icon: 'radio',
    description: 'High frequency radio transmitters, VHF/UHF voice and unencrypted data links'
  },
  {
    id: 'satellite_links',
    name: 'Satellite Links',
    state: 'RESTRICTED',
    color: 'amber',
    icon: 'satellite',
    description: 'Narrowband military SATCOM, Inmarsat broadband and fleet broadcast receivers'
  },
  {
    id: 'external_networks',
    name: 'External Networks',
    state: 'DISCONNECTED',
    color: 'red',
    icon: 'network',
    description: 'Direct internet gateway, non-military WAN relays and public satellite nodes'
  },
  {
    id: 'internal_naval_net',
    name: 'Internal Naval Net',
    state: 'ALLOWED',
    color: 'emerald',
    icon: 'shield',
    description: 'Optically isolated tactical shipboard intranet and encrypted Merkle node backbone'
  }
];

let globalEmconPosture: EmconPostureStatus = {
  status: 'ACTIVE',
  statusColor: 'emerald',
  currentPosture: 'RESTRICTED EMCON',
  effectiveSince: '26 Sep 2026 18:22Z',
  authorizedBy: 'Flag Officer (Ops)',
  scope: 'Western Fleet HQ',
  gridZone: 'SECTOR-ARABIAN-17A',
  emconLevel: 'ALPHA'
};

const initialPqcItems: PqcCryptoStatusItem[] = [
  {
    id: 'pqc-1',
    name: 'Post-Quantum Signatures',
    standard: 'ML-DSA (NIST FIPS 204)',
    status: 'ACTIVE',
    statusColor: 'emerald',
    algorithm: 'ML-DSA-65 / Dilithium-3'
  },
  {
    id: 'pqc-2',
    name: 'Key Exchange',
    standard: 'ML-KEM (NIST FIPS 203)',
    status: 'ACTIVE',
    statusColor: 'emerald',
    algorithm: 'Kyber-768 / ML-KEM-768'
  },
  {
    id: 'pqc-3',
    name: 'Data Encryption',
    standard: 'AES-256 + PQC Hybrid',
    status: 'ACTIVE',
    statusColor: 'emerald',
    algorithm: 'AES-GCM-256 + Kyber-768'
  }
];

const initialHealthItems: SystemHealthItem[] = [
  {
    id: 'sh-1',
    name: 'EMCON Enforcement',
    status: 'Operational',
    statusColor: 'emerald',
    icon: 'shield',
    latencyMs: 12
  },
  {
    id: 'sh-2',
    name: 'Network Monitoring',
    status: 'Operational',
    statusColor: 'emerald',
    icon: 'network',
    latencyMs: 24
  },
  {
    id: 'sh-3',
    name: 'Anomaly Detection',
    status: 'Operational',
    statusColor: 'emerald',
    icon: 'bell',
    latencyMs: 38
  },
  {
    id: 'sh-4',
    name: 'Audit Logging',
    status: 'Operational',
    statusColor: 'emerald',
    icon: 'audit',
    latencyMs: 8
  }
];

const mockTacticalUnits: TacticalUnit[] = [
  {
    id: 'TU-001',
    name: 'INS Visakhapatnam',
    callsign: 'D66',
    type: 'Destroyer',
    x: 42,
    y: 54,
    lat: "18°22'N",
    long: "71°15'E",
    commsStatus: 'BLOCKED',
    emconZone: 'EMCON Zone (Restricted)',
    heading: 145,
    speedKnots: 18.5,
    frequencyBand: 'EHF SATCOM',
    pqcActive: true
  },
  {
    id: 'TU-002',
    name: 'Western Fleet HQ',
    callsign: 'WF-HQ-MUMBAI',
    type: 'Command HQ',
    x: 62,
    y: 44,
    lat: "18°56'N",
    long: "72°50'E",
    commsStatus: 'ACTIVE',
    emconZone: 'HQ Coastal Corridor',
    heading: 0,
    speedKnots: 0,
    frequencyBand: 'Tactical Fiber Relay',
    pqcActive: true
  },
  {
    id: 'TU-003',
    name: 'INS Vikramaditya',
    callsign: 'R33',
    type: 'Aircraft Carrier',
    x: 29,
    y: 48,
    lat: "17°40'N",
    long: "69°55'E",
    commsStatus: 'ACTIVE',
    emconZone: 'Deep Sea Sector Bravo',
    heading: 210,
    speedKnots: 22.0,
    frequencyBand: 'Tactical Link-II',
    pqcActive: true
  },
  {
    id: 'TU-004',
    name: 'UAV-Alpha-03',
    callsign: 'DRONE-03',
    type: 'UAV Squad',
    x: 48,
    y: 68,
    lat: "16°15'N",
    long: "72°05'E",
    commsStatus: 'BLOCKED',
    emconZone: 'EMCON Zone (Restricted)',
    heading: 320,
    speedKnots: 110.0,
    frequencyBand: 'RF 218 MHz',
    pqcActive: false
  },
  {
    id: 'TU-005',
    name: 'Coastal Radar Unit',
    callsign: 'RADAR-KARWAR',
    type: 'Coastal Radar',
    x: 68,
    y: 65,
    lat: "14°48'N",
    long: "74°07'E",
    commsStatus: 'ACTIVE',
    emconZone: 'Coastal Sentinel',
    heading: 0,
    speedKnots: 0,
    frequencyBand: 'X-Band Radar Relay',
    pqcActive: true
  },
  {
    id: 'TU-006',
    name: 'INS Mormugao',
    callsign: 'D67',
    type: 'Destroyer',
    x: 44,
    y: 74,
    lat: "15°24'N",
    long: "72°30'E",
    commsStatus: 'RESTRICTED',
    emconZone: 'Goa Outer Perimeter',
    heading: 180,
    speedKnots: 16.0,
    frequencyBand: 'SHF Military SATCOM',
    pqcActive: true
  }
];

const mockEmconZones: EmconZone[] = [
  {
    id: 'ZONE-RESTRICTED-17A',
    name: 'EMCON ZONE',
    code: '(Restricted)',
    type: 'Restricted',
    points: [
      { x: 38, y: 46 },
      { x: 55, y: 55 },
      { x: 57, y: 73 },
      { x: 42, y: 72 },
      { x: 38, y: 58 }
    ],
    center: { x: 49, y: 64 },
    status: 'ACTIVE'
  }
];

const mockEmconEvents: EmconEvent[] = [
  {
    id: 'EV-8921',
    timeZ: '07:11',
    timeLocal: '12:41 IST',
    unitVessel: 'INS Visakhapatnam',
    event: 'RF Transmission Blocked',
    status: 'Blocked',
    statusColor: 'red',
    channel: 'Satellite Uplink',
    details: 'Uplink transmission rejected by shipboard EMCON hardware firewall'
  },
  {
    id: 'EV-8920',
    timeZ: '06:58',
    timeLocal: '12:28 IST',
    unitVessel: 'Western Fleet HQ',
    event: 'EMCON Zone Activated',
    status: 'Success',
    statusColor: 'emerald',
    channel: 'Fleet Command Net',
    details: 'Sector 17A EMCON Alpha state broadcast to all Task Force elements'
  },
  {
    id: 'EV-8919',
    timeZ: '06:42',
    timeLocal: '12:12 IST',
    unitVessel: 'UAV Link Attempt',
    event: 'External Comms Denied',
    status: 'Blocked',
    statusColor: 'red',
    channel: 'RF 218 MHz',
    details: 'Unregistered transmission probe halted'
  },
  {
    id: 'EV-8918',
    timeZ: '06:21',
    timeLocal: '11:51 IST',
    unitVessel: 'INS Vikramaditya',
    event: 'Satcom Restricted',
    status: 'Restricted',
    statusColor: 'amber',
    channel: 'SHF Tactical',
    details: 'Bandwidth choked to 128 kbps post-quantum encrypted channel'
  },
  {
    id: 'EV-8917',
    timeZ: '05:48',
    timeLocal: '11:18 IST',
    unitVessel: 'Coastal Radar Unit',
    event: 'Encrypted Link Established',
    status: 'Success',
    statusColor: 'emerald',
    channel: 'Optical Diode',
    details: 'Zero-trust telemetry synced with Central Naval Registry'
  },
  {
    id: 'EV-8916',
    timeZ: '04:30',
    timeLocal: '10:00 IST',
    unitVessel: 'INS Mormugao',
    event: 'Crypto Key Rekeyed',
    status: 'Success',
    statusColor: 'emerald',
    channel: 'Internal Naval Net',
    details: 'ML-KEM-768 session keys rotated successfully'
  }
];

const mockEmconIncidents: EmconIncident[] = [
  {
    id: 'INC-2026-091',
    timeZ: '07:11',
    timeLocal: '12:41 IST',
    severity: 'High',
    severityColor: 'red',
    description: 'Unauthorized Satellite Uplink Attempt (INS Visakhapatnam)',
    unitVessel: 'INS Visakhapatnam (D66)',
    frequency: 'EHF SATCOM 44.5 GHz',
    sourceIp: '10.14.88.21 [Bridge Auxiliary Terminal]',
    actionLabel: 'Investigate',
    status: 'Open',
    signatureState: 'UNREGISTERED_SOURCE'
  },
  {
    id: 'INC-2026-089',
    timeZ: '06:42',
    timeLocal: '12:12 IST',
    severity: 'Medium',
    severityColor: 'amber',
    description: 'Unknown RF signal detected (218 MHz)',
    unitVessel: 'UAV-Alpha-03 Sector',
    frequency: 'VHF/UHF 218.425 MHz',
    sourceIp: 'Radio Intercept Sensor RF-7',
    actionLabel: 'Review',
    status: 'Open',
    signatureState: 'ANOMALOUS_BURST'
  },
  {
    id: 'INC-2026-088',
    timeZ: '02:33',
    timeLocal: '08:03 IST',
    severity: 'Medium',
    severityColor: 'amber',
    description: 'Satellite ping from unregistered source',
    unitVessel: 'Western Fleet Sector 17',
    frequency: 'L-Band Mobile 1.6 GHz',
    sourceIp: 'Commercial Inmarsat Beacon',
    actionLabel: 'Review',
    status: 'Acknowledged',
    signatureState: 'INVALID_KEY'
  },
  {
    id: 'INC-2026-085',
    timeZ: '01:12',
    timeLocal: '06:42 IST',
    severity: 'Low',
    severityColor: 'teal',
    description: 'Comms pattern anomaly detected',
    unitVessel: 'Coastal Radar Unit (Karwar)',
    frequency: 'X-Band Auxiliary',
    sourceIp: 'Telemetry Node #4',
    actionLabel: 'Monitor',
    status: 'Open',
    signatureState: 'ANOMALOUS_BURST'
  }
];

let globalCommunicationLogs: CommunicationLogEntry[] = [
  {
    id: 'LOG-10992',
    timeZ: '07:11',
    timeLocal: '12:41 IST',
    source: 'INS Visakhapatnam',
    destination: 'External (Unknown)',
    channel: 'Satellite',
    event: 'Transmission Blocked',
    policy: 'EMCON Policy',
    details: 'Blocked during restricted period',
    status: 'Blocked',
    statusColor: 'red',
    blockId: '#4,193',
    txHash: '0x88f21ac0981b...'
  },
  {
    id: 'LOG-10991',
    timeZ: '06:58',
    timeLocal: '12:28 IST',
    source: 'Western Fleet HQ',
    destination: 'All Units',
    channel: 'System',
    event: 'EMCON Zone Activated',
    policy: 'Naval Command',
    details: 'Western Region (Grid 17A)',
    status: 'Success',
    statusColor: 'emerald',
    blockId: '#4,192',
    txHash: '0x32ba1198c001...'
  },
  {
    id: 'LOG-10990',
    timeZ: '06:42',
    timeLocal: '12:12 IST',
    source: 'UAV-Alpha-03',
    destination: 'External IP',
    channel: 'RF (218 MHz)',
    event: 'External Comms Denied',
    policy: 'EMCON Policy',
    details: 'Unregistered source',
    status: 'Blocked',
    statusColor: 'red',
    blockId: '#4,191',
    txHash: '0x77aa4419cb20...'
  },
  {
    id: 'LOG-10989',
    timeZ: '06:21',
    timeLocal: '11:51 IST',
    source: 'INS Vikramaditya',
    destination: 'Naval Net',
    channel: 'Satellite',
    event: 'Encrypted Link Established',
    policy: 'Authorized',
    details: 'PQC channel (ML-KEM + AES-256)',
    status: 'Success',
    statusColor: 'emerald',
    blockId: '#4,190',
    txHash: '0x99cc441098ef...'
  },
  {
    id: 'LOG-10988',
    timeZ: '05:48',
    timeLocal: '11:18 IST',
    source: 'Coastal Radar Unit',
    destination: 'Fleet Net',
    channel: 'System',
    event: 'Secure Channel Verified',
    policy: 'Naval Command',
    details: 'Routine operational traffic',
    status: 'Success',
    statusColor: 'emerald',
    blockId: '#4,189',
    txHash: '0x12ffaa9098bc...'
  },
  {
    id: 'LOG-10987',
    timeZ: '04:15',
    timeLocal: '09:45 IST',
    source: 'INS Mormugao',
    destination: 'Western Fleet HQ',
    channel: 'Satellite',
    event: 'Bandwidth Restricted',
    policy: 'EMCON Policy',
    details: 'Emergency tactical traffic only (128 kbps)',
    status: 'Restricted',
    statusColor: 'amber',
    blockId: '#4,188',
    txHash: '0x55aa001923bc...'
  },
  {
    id: 'LOG-10986',
    timeZ: '03:10',
    timeLocal: '08:40 IST',
    source: 'INS Visakhapatnam',
    destination: 'HQ Terminal 02',
    channel: 'System',
    event: 'Cryptographic Rekey',
    policy: 'PQC Protocol',
    details: 'ML-KEM shared secret renewal verified',
    status: 'Success',
    statusColor: 'emerald',
    blockId: '#4,187',
    txHash: '0x88a1002239fc...'
  },
  {
    id: 'LOG-10985',
    timeZ: '01:05',
    timeLocal: '06:35 IST',
    source: 'Civilian Relay Station',
    destination: 'INS Vikramaditya',
    channel: 'RF (218 MHz)',
    event: 'Unauthenticated Handshake Blocked',
    policy: 'EMCON Policy',
    details: 'No valid Post-Quantum signature found',
    status: 'Blocked',
    statusColor: 'red',
    blockId: '#4,186',
    txHash: '0xee11009844bb...'
  }
];

export const useEmconStatus = () => {
  return useQuery<EmconPostureStatus>({
    queryKey: ['emcon-status'],
    queryFn: async () => {
      try {
        const res = await apiClient.get<any>('/emcon/status');
        if (res && res.posture) {
          globalEmconPosture = {
            ...globalEmconPosture,
            currentPosture: res.posture === 'BRAVO' ? 'EMCON BRAVO (RESTRICTED)' : res.posture === 'ALPHA' ? 'EMCON ALPHA (SILENT)' : 'NORMAL OPS',
            status: res.posture === 'NORMAL' ? 'INACTIVE' : 'ACTIVE',
            emconLevel: res.posture === 'ALPHA' ? 'ALPHA' : 'BRAVO',
          };
        }
      } catch (err) {
        console.warn('Backend /emcon/status unreachable, fallback to local store:', err);
      }
      return { ...globalEmconPosture };
    },
    staleTime: 1000 * 5
  });
};

export const useCommsControls = () => {
  return useQuery<CommsControlItem[]>({
    queryKey: ['emcon-comms-controls'],
    queryFn: async () => {
      return [...globalCommsControls];
    },
    staleTime: 1000 * 5
  });
};

export const useUpdateCommsControl = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      newState,
      rationale
    }: {
      id: CommsControlId;
      newState: CommsControlState;
      rationale?: string;
    }) => {
      try {
        const postureTarget = newState === 'BLOCKED' || newState === 'DISCONNECTED' ? 'ALPHA' : newState === 'RESTRICTED' ? 'BRAVO' : 'NORMAL';
        await apiClient.post('/emcon/posture', { posture: postureTarget });
      } catch (err) {
        console.warn('Backend /emcon/posture update fallback:', err);
      }

      // Determine color
      let color: 'red' | 'amber' | 'emerald' = 'emerald';
      if (newState === 'BLOCKED' || newState === 'DISCONNECTED') color = 'red';
      if (newState === 'RESTRICTED') color = 'amber';

      // Update control
      globalCommsControls = globalCommsControls.map((item) =>
        item.id === id ? { ...item, state: newState, color } : item
      );

      // Append new entry to communication audit log
      const now = new Date();
      const timeZ = `${String(now.getUTCHours()).padStart(2, '0')}:${String(now.getUTCMinutes()).padStart(2, '0')}`;
      const timeLocal = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')} IST`;

      const targetControl = globalCommsControls.find((c) => c.id === id);
      const newLogEntry: CommunicationLogEntry = {
        id: `LOG-${Date.now().toString().slice(-5)}`,
        timeZ,
        timeLocal,
        source: 'Flag Officer (Ops)',
        destination: 'Fleet Controller',
        channel: 'System',
        event: `${targetControl?.name || 'Comms Control'} set to ${newState}`,
        policy: 'Officer Override',
        details: rationale || `Operational posture changed to ${newState}`,
        status: newState === 'BLOCKED' || newState === 'DISCONNECTED' ? 'Blocked' : newState === 'RESTRICTED' ? 'Restricted' : 'Success',
        statusColor: color,
        blockId: `#4,${Math.floor(190 + Math.random() * 20)}`,
        txHash: `0x${Math.random().toString(16).slice(2, 14)}...`
      };

      globalCommunicationLogs = [newLogEntry, ...globalCommunicationLogs];

      return { success: true, updatedItem: targetControl, logEntry: newLogEntry };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['emcon-comms-controls'] });
      queryClient.invalidateQueries({ queryKey: ['emcon-communication-log'] });
      queryClient.invalidateQueries({ queryKey: ['emcon-events'] });
    }
  });
};

export const usePqcStatus = () => {
  return useQuery<PqcCryptoStatusItem[]>({
    queryKey: ['emcon-pqc-status'],
    queryFn: async () => {
      await new Promise((resolve) => setTimeout(resolve, 140));
      return [...initialPqcItems];
    },
    staleTime: 1000 * 60 * 3
  });
};

export const useSystemHealth = () => {
  return useQuery<SystemHealthItem[]>({
    queryKey: ['emcon-system-health'],
    queryFn: async () => {
      await new Promise((resolve) => setTimeout(resolve, 140));
      return [...initialHealthItems];
    },
    staleTime: 1000 * 60 * 3
  });
};

export const useTacticalMapUnits = () => {
  return useQuery<{ units: TacticalUnit[]; zones: EmconZone[] }>({
    queryKey: ['emcon-tactical-units'],
    queryFn: async () => {
      await new Promise((resolve) => setTimeout(resolve, 160));
      return {
        units: mockTacticalUnits,
        zones: mockEmconZones
      };
    },
    staleTime: 1000 * 60 * 5
  });
};

export const useEmconEvents = ({ limit }: { limit?: number } = {}) => {
  return useQuery<EmconEvent[]>({
    queryKey: ['emcon-events', limit],
    queryFn: async () => {
      await new Promise((resolve) => setTimeout(resolve, 150));
      if (limit) {
        return mockEmconEvents.slice(0, limit);
      }
      return mockEmconEvents;
    },
    staleTime: 1000 * 60 * 2
  });
};

export const useEmconIncidents = () => {
  return useQuery<EmconIncident[]>({
    queryKey: ['emcon-incidents'],
    queryFn: async () => {
      await new Promise((resolve) => setTimeout(resolve, 150));
      return [...mockEmconIncidents];
    },
    staleTime: 1000 * 60 * 2
  });
};

export const useCommunicationLog = (filters: CommsLogFilters) => {
  return useQuery<CommunicationLogEntry[]>({
    queryKey: ['emcon-communication-log', filters],
    queryFn: async () => {
      await new Promise((resolve) => setTimeout(resolve, 180));
      let filtered = [...globalCommunicationLogs];

      // Filter by Unit
      if (filters.unit && filters.unit !== 'All Units' && filters.unit !== 'ALL') {
        filtered = filtered.filter(
          (entry) =>
            entry.source.toLowerCase().includes(filters.unit.toLowerCase()) ||
            entry.destination.toLowerCase().includes(filters.unit.toLowerCase())
        );
      }

      // Filter by Search Query
      if (filters.searchQuery && filters.searchQuery.trim() !== '') {
        const q = filters.searchQuery.toLowerCase();
        filtered = filtered.filter(
          (entry) =>
            entry.source.toLowerCase().includes(q) ||
            entry.destination.toLowerCase().includes(q) ||
            entry.event.toLowerCase().includes(q) ||
            entry.details.toLowerCase().includes(q) ||
            entry.channel.toLowerCase().includes(q) ||
            entry.policy.toLowerCase().includes(q)
        );
      }

      return filtered;
    },
    staleTime: 1000 * 60
  });
};
