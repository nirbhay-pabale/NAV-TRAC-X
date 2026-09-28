import { useQuery } from '@tanstack/react-query';
import type { SystemHealthData } from '../types/commandCenter';

const mockSystemStatus: SystemHealthData = {
  overallStatus: 'Operational',
  overallStatusType: 'green',
  services: [
    {
      id: 'ledger',
      name: 'Ledger',
      status: 'Healthy',
      statusType: 'green',
      icon: 'database',
      latencyMs: 14
    },
    {
      id: 'hash-chain',
      name: 'Hash Chain',
      status: 'Verified',
      statusType: 'green',
      icon: 'chain',
      latencyMs: 8
    },
    {
      id: 'signature-service',
      name: 'Signature Service',
      status: 'Active',
      statusType: 'green',
      icon: 'signature',
      latencyMs: 22
    },
    {
      id: 'fingerprint-engine',
      name: 'Fingerprint Engine',
      status: 'Active',
      statusType: 'green',
      icon: 'fingerprint',
      latencyMs: 35
    },
    {
      id: 'authorization',
      name: 'Authorization',
      status: 'Healthy',
      statusType: 'green',
      icon: 'auth',
      latencyMs: 11
    },
    {
      id: 'emcon',
      name: 'EMCON',
      status: 'Active',
      statusType: 'amber',
      icon: 'emcon',
      latencyMs: 4
    }
  ]
};

export const useSystemStatus = () => {
  return useQuery({
    queryKey: ['system-status'],
    queryFn: async (): Promise<SystemHealthData> => {
      await new Promise((resolve) => setTimeout(resolve, 150));
      return mockSystemStatus;
    },
    staleTime: 1000 * 60,
  });
};
