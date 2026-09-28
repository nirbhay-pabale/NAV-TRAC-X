import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { RecipientKeyInfo } from '../types/recipientUser';
import { INITIAL_RECIPIENT_KEY } from '../data/recipientMockData';
import { centralStore } from '../data/centralStore';

let localKeyInfo: RecipientKeyInfo = { ...INITIAL_RECIPIENT_KEY };

export const useMyKeyInfo = () => {
  return useQuery<RecipientKeyInfo>({
    queryKey: ['my-key-info'],
    queryFn: async () => {
      await new Promise((r) => setTimeout(r, 100));
      return { ...localKeyInfo };
    },
    staleTime: 1000 * 10,
  });
};

export const useReportLostKey = () => {
  const queryClient = useQueryClient();

  return useMutation<
    { success: boolean; revokedKeyId: string; timestamp: string },
    Error,
    { keyId: string; reason: string; officerName: string }
  >({
    mutationFn: async ({ keyId, reason, officerName }) => {
      await new Promise((r) => setTimeout(r, 500));

      // Update local state
      localKeyInfo = {
        ...localKeyInfo,
        status: 'Revoked',
        registeredDevice: {
          ...localKeyInfo.registeredDevice,
          status: 'Revoked',
        },
        keyHistory: [
          {
            id: `KEY-REV-${Date.now().toString().slice(-3)}`,
            rotatedOn: 'Just now',
            action: 'Emergency Revocation',
            reason: reason || 'Reported Lost / Stolen Hardware Token',
            actor: officerName,
          },
          ...localKeyInfo.keyHistory,
        ],
      };

      // Notify central store
      centralStore.reportLostKey(keyId, officerName, reason);

      return {
        success: true,
        revokedKeyId: keyId,
        timestamp: new Date().toISOString(),
      };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-key-info'] });
      queryClient.invalidateQueries({ queryKey: ['my-activity'] });
      queryClient.invalidateQueries({ queryKey: ['my-dashboard-stats'] });
    },
  });
};
