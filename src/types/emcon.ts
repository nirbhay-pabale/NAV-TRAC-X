export type CommsControlId = 'rf_emissions' | 'satellite_links' | 'external_networks' | 'internal_naval_net';

export type CommsControlState = 'BLOCKED' | 'RESTRICTED' | 'DISCONNECTED' | 'ALLOWED';

export interface CommsControlItem {
  id: CommsControlId;
  name: string;
  state: CommsControlState;
  color: 'red' | 'amber' | 'emerald';
  icon: 'radio' | 'satellite' | 'network' | 'shield';
  description: string;
}

export interface EmconPostureStatus {
  status: 'ACTIVE' | 'DEGRADED' | 'INACTIVE' | 'EMERGENCY_OVERRIDE';
  statusColor: 'emerald' | 'amber' | 'red' | 'sky';
  currentPosture: string;
  effectiveSince: string;
  authorizedBy: string;
  scope: string;
  gridZone: string;
  emconLevel: 'ALPHA' | 'BRAVO' | 'CHARLIE' | 'DELTA';
}

export interface PqcCryptoStatusItem {
  id: string;
  name: string;
  standard: string;
  status: 'ACTIVE' | 'DEGRADED' | 'STANDBY' | 'INACTIVE';
  statusColor: 'emerald' | 'amber' | 'red' | 'slate';
  algorithm: string;
}

export interface SystemHealthItem {
  id: string;
  name: string;
  status: 'Operational' | 'Degraded' | 'Offline' | 'Warning';
  statusColor: 'emerald' | 'amber' | 'red';
  icon: 'shield' | 'network' | 'bell' | 'audit';
  latencyMs?: number;
}

export interface TacticalUnit {
  id: string;
  name: string;
  callsign: string;
  type: 'Destroyer' | 'Aircraft Carrier' | 'Frigate' | 'Submarine' | 'Command HQ' | 'UAV Squad' | 'Coastal Radar';
  x: number; // SVG percentage x coordinate (0-100)
  y: number; // SVG percentage y coordinate (0-100)
  lat: string;
  long: string;
  commsStatus: 'ACTIVE' | 'RESTRICTED' | 'BLOCKED';
  emconZone: string;
  heading: number; // degrees
  speedKnots: number;
  frequencyBand?: string;
  pqcActive: boolean;
}

export interface EmconZone {
  id: string;
  name: string;
  code: string;
  type: 'Restricted' | 'Prohibited' | 'Tactical Silence';
  points: { x: number; y: number }[]; // SVG coordinates
  center: { x: number; y: number };
  radius?: number;
  status: 'ACTIVE' | 'STANDBY';
  minAltitude?: string;
}

export interface EmconEvent {
  id: string;
  timeZ: string;
  timeLocal: string;
  unitVessel: string;
  event: string;
  status: 'Blocked' | 'Success' | 'Restricted' | 'Failed' | 'Warning';
  statusColor: 'red' | 'emerald' | 'amber';
  channel?: string;
  details?: string;
}

export interface EmconIncident {
  id: string;
  timeZ: string;
  timeLocal: string;
  severity: 'High' | 'Medium' | 'Low';
  severityColor: 'red' | 'amber' | 'teal';
  description: string;
  unitVessel: string;
  frequency?: string;
  sourceIp?: string;
  actionLabel: 'Investigate' | 'Review' | 'Monitor';
  status: 'Open' | 'Acknowledged' | 'Investigating' | 'Resolved';
  signatureState?: 'TAMPER_DETECTED' | 'INVALID_KEY' | 'UNREGISTERED_SOURCE' | 'ANOMALOUS_BURST';
}

export interface CommunicationLogEntry {
  id: string;
  timeZ: string;
  timeLocal: string;
  source: string;
  destination: string;
  channel: 'Satellite' | 'RF (218 MHz)' | 'System' | 'Optical Diode' | 'Naval Net' | 'VHF' | 'HF Tactical';
  event: string;
  policy: string;
  details: string;
  status: 'Blocked' | 'Success' | 'Restricted';
  statusColor: 'red' | 'emerald' | 'amber';
  blockId?: string;
  txHash?: string;
}

export interface CommsLogFilters {
  unit: string;
  timeRange: string;
  searchQuery?: string;
  status?: string;
}
