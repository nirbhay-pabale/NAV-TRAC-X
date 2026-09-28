import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { RecipientActivityEvent } from '../types/recipientUser';
import { INITIAL_RECIPIENT_ACTIVITY } from '../data/recipientMockData';

let localActivityList: RecipientActivityEvent[] = [...INITIAL_RECIPIENT_ACTIVITY];

export interface ActivityFilterParams {
  action?: string;
  documentId?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}

export const useMyActivity = (filters?: ActivityFilterParams) => {
  return useQuery<{ events: RecipientActivityEvent[]; total: number }>({
    queryKey: ['my-activity', filters],
    queryFn: async () => {
      await new Promise((r) => setTimeout(r, 120));

      let list = [...localActivityList];

      if (filters?.action && filters.action !== 'All Actions') {
        list = list.filter((e) => e.action === filters.action);
      }

      if (filters?.documentId && filters.documentId !== 'All Documents') {
        list = list.filter((e) => e.documentId === filters.documentId || e.documentTitle?.includes(filters.documentId!));
      }

      if (filters?.search && filters.search.trim()) {
        const q = filters.search.trim().toLowerCase();
        list = list.filter(
          (e) =>
            e.receiptId.toLowerCase().includes(q) ||
            e.action.toLowerCase().includes(q) ||
            e.details.toLowerCase().includes(q) ||
            (e.documentTitle && e.documentTitle.toLowerCase().includes(q))
        );
      }

      const total = list.length;
      const page = filters?.page || 1;
      const pageSize = filters?.pageSize || 10;
      const startIndex = (page - 1) * pageSize;
      const paginated = list.slice(startIndex, startIndex + pageSize);

      return {
        events: paginated,
        total,
      };
    },
    staleTime: 1000 * 5,
  });
};

export const useAddMyActivity = () => {
  const queryClient = useQueryClient();

  return useMutation<RecipientActivityEvent, Error, Omit<RecipientActivityEvent, 'id' | 'timestamp' | 'timeLocal'>>({
    mutationFn: async (eventData) => {
      const newEvent: RecipientActivityEvent = {
        id: `ACT-${Date.now().toString().slice(-4)}`,
        timestamp: new Date().toISOString(),
        timeLocal: 'Just now',
        ...eventData,
      };
      localActivityList = [newEvent, ...localActivityList];
      return newEvent;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-activity'] });
      queryClient.invalidateQueries({ queryKey: ['my-dashboard-stats'] });
    },
  });
};
