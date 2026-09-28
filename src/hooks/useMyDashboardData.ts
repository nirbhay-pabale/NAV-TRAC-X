import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { MyDashboardStats, SecurityNotice, SecurityConcernReport } from '../types/recipientUser';
import { INITIAL_SECURITY_NOTICES, INITIAL_RECIPIENT_DOCUMENTS, INITIAL_RECIPIENT_REQUESTS } from '../data/recipientMockData';

export const useMyDashboardStats = () => {
  return useQuery<MyDashboardStats>({
    queryKey: ['my-dashboard-stats'],
    queryFn: async () => {
      // Simulate micro-latency
      await new Promise((r) => setTimeout(r, 120));

      const total = INITIAL_RECIPIENT_DOCUMENTS.length;
      const awaitingReview = INITIAL_RECIPIENT_DOCUMENTS.filter((d) => d.status === 'New' || d.accessCount === 0).length;
      const expiringSoon = INITIAL_RECIPIENT_DOCUMENTS.filter((d) => d.isExpiringSoon && !d.isExpired).length;
      const pendingRequests = INITIAL_RECIPIENT_REQUESTS.filter((r) => r.status === 'Pending').length;

      return {
        documentsSharedWithMe: total,
        awaitingMyReview: awaitingReview,
        expiringWithin48h: expiringSoon,
        pendingAccessRequests: pendingRequests,
      };
    },
    staleTime: 1000 * 10,
  });
};

export const useSecurityNotices = () => {
  return useQuery<SecurityNotice[]>({
    queryKey: ['my-security-notices'],
    queryFn: async () => {
      await new Promise((r) => setTimeout(r, 100));
      return INITIAL_SECURITY_NOTICES;
    },
    staleTime: 1000 * 30,
  });
};

export const useSubmitSecurityConcern = () => {
  const queryClient = useQueryClient();

  return useMutation<SecurityConcernReport, Error, { subject: string; details: string }>({
    mutationFn: async ({ subject, details }) => {
      await new Promise((r) => setTimeout(r, 400));
      const newReport: SecurityConcernReport = {
        id: `CONCERN-${Date.now().toString().slice(-4)}`,
        subject,
        details,
        submittedAt: new Date().toISOString(),
        status: 'Submitted',
      };
      return newReport;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-activity'] });
    },
  });
};
