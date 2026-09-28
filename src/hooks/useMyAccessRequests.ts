import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { RecipientAccessRequest } from '../types/recipientUser';
import { INITIAL_RECIPIENT_REQUESTS } from '../data/recipientMockData';
import { centralStore } from '../data/centralStore';

// In-memory request list for recipient session
let localRequests: RecipientAccessRequest[] = [...INITIAL_RECIPIENT_REQUESTS];

export const useMyAccessRequests = () => {
  return useQuery<RecipientAccessRequest[]>({
    queryKey: ['my-access-requests'],
    queryFn: async () => {
      await new Promise((r) => setTimeout(r, 120));
      return [...localRequests];
    },
    staleTime: 1000 * 5,
  });
};

export const useCreateAccessRequest = () => {
  const queryClient = useQueryClient();

  return useMutation<
    { success: boolean; message: string; requestId: string },
    Error,
    { documentReferenceId: string; reason: string; officerName: string; rank: string; unit: string; pno: string }
  >({
    mutationFn: async ({ documentReferenceId, reason, officerName, rank, unit, pno }) => {
      await new Promise((r) => setTimeout(r, 400));

      const reqId = `REQ-2026-${String(localRequests.length + 89).padStart(3, '0')}`;

      // Submit to centralStore so approvers / investigators see it in their pending list
      centralStore.addAccessRequest({
        requesterName: officerName,
        requesterRank: rank,
        requesterPno: pno,
        requesterUnit: unit,
        documentId: documentReferenceId,
        reasonGiven: reason,
      });

      // Add to recipient's local view
      const newReq: RecipientAccessRequest = {
        id: reqId,
        documentReferenceId,
        documentName: `Document Ref #${documentReferenceId}`,
        reason,
        submittedOn: 'Just now',
        status: 'Pending',
        reviewingAuthority: 'Commanding Officer / Fleet Operations',
      };

      localRequests = [newReq, ...localRequests];

      return {
        success: true,
        message: 'If the reference is valid and you are eligible, your request will be routed for approval.',
        requestId: reqId,
      };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-access-requests'] });
      queryClient.invalidateQueries({ queryKey: ['my-dashboard-stats'] });
      queryClient.invalidateQueries({ queryKey: ['access-requests'] });
    },
  });
};
