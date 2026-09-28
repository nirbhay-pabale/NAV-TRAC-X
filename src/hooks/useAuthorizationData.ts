import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { centralStore } from '../data/centralStore';
import { apiClient } from '../api/client';
import type {
  AccessPolicy,
  AccessRequest,
  AccessDeniedEntry,
  AlertRule
} from '../types/authorization';

export const usePolicies = () => {
  return useQuery<AccessPolicy[]>({
    queryKey: ['authorization-policies'],
    queryFn: async () => {
      try {
        const apiPolicies = await apiClient.get<any[]>('/authorization/policies');
        if (Array.isArray(apiPolicies) && apiPolicies.length > 0) {
          return apiPolicies.map((p) => ({
            id: p.id,
            name: p.name,
            description: p.description,
            scopeType: p.scopeType as any,
            appliesTo: p.appliesTo,
            classificationScope: p.classificationScope as any,
            allowedAccessTypes: p.allowedAccessTypes as any,
            expiryRule: p.expiryRule,
            activeRecipientsCount: p.activeRecipientsCount || 0,
            status: p.status as any,
            createdAt: p.createdAt,
            updatedAt: p.updatedAt,
            requiresDualCustody: p.requiresDualCustody,
          }));
        }
      } catch (err) {
        console.warn('Backend policies unreachable, falling back to local store:', err);
      }
      const state = centralStore.getState();
      return state.policies.map((p) => ({
        id: p.id,
        name: p.name,
        description: p.description,
        scopeType: p.scopeType as any,
        appliesTo: p.appliesTo,
        classificationScope: p.classificationScope as any,
        allowedAccessTypes: p.allowedAccessTypes as any,
        expiryRule: p.expiryRule,
        activeRecipientsCount: p.activeRecipientsCount,
        status: p.status as any,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
        requiresDualCustody: p.requiresDualCustody,
      }));
    },
    staleTime: 1000 * 5,
  });
};

export const useCreatePolicy = () => {
  const queryClient = useQueryClient();

  return useMutation<AccessPolicy, Error, Omit<AccessPolicy, 'id' | 'createdAt' | 'updatedAt' | 'activeRecipientsCount'>>({
    mutationFn: async (newPolicyData) => {
      try {
        const created = await apiClient.post<any>('/authorization/policies', newPolicyData);
        if (created) return created;
      } catch (err) {
        console.warn('Backend create policy fallback:', err);
      }
      const state = centralStore.getState();
      const newPolicy = {
        id: `POL-${String(state.policies.length + 1).padStart(2, '0')}`,
        name: newPolicyData.name,
        description: newPolicyData.description,
        scopeType: newPolicyData.scopeType,
        appliesTo: newPolicyData.appliesTo,
        classificationScope: newPolicyData.classificationScope,
        allowedAccessTypes: newPolicyData.allowedAccessTypes,
        expiryRule: newPolicyData.expiryRule,
        activeRecipientsCount: 0,
        status: 'Active' as const,
        createdAt: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
        updatedAt: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
        requiresDualCustody: newPolicyData.requiresDualCustody,
        deviceRestrictions: 'Standard Naval Terminals',
      };

      state.policies.unshift(newPolicy as any);
      return newPolicy as any;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['authorization-policies'] });
    },
  });
};

export const usePendingRequests = () => {
  return useQuery<AccessRequest[]>({
    queryKey: ['access-requests'],
    queryFn: async () => {
      try {
        const apiRequests = await apiClient.get<any[]>('/authorization/requests');
        if (Array.isArray(apiRequests) && apiRequests.length > 0) {
          return apiRequests.map((r) => ({
            id: r.id,
            requesterName: r.requesterName,
            requesterRank: r.requesterRank,
            requesterPno: r.requesterPno,
            requesterUnit: r.requesterUnit,
            documentId: r.documentId,
            documentName: r.documentName,
            documentClassification: r.documentClassification as any,
            reasonGiven: r.reasonGiven,
            requestedOn: r.requestedOn,
            status: r.status as any,
            requiredApproverRole: r.requiredApproverRole,
            escalatedTo: r.escalatedTo,
            decidedBy: r.decidedBy,
            decidedAt: r.decidedAt,
            decisionNote: r.decisionNote,
          }));
        }
      } catch (err) {
        console.warn('Backend requests unreachable, falling back to local store:', err);
      }
      const state = centralStore.getState();
      return state.requests.map((r) => ({
        id: r.id,
        requesterName: r.requesterName,
        requesterRank: r.requesterRank,
        requesterPno: r.requesterPno,
        requesterUnit: r.requesterUnit,
        documentId: r.documentId,
        documentName: r.documentName,
        documentClassification: r.documentClassification as any,
        reasonGiven: r.reasonGiven,
        requestedOn: r.requestedOn,
        status: r.status as any,
        requiredApproverRole: r.requiredApproverRole,
        escalatedTo: r.escalatedTo,
        decidedBy: r.decidedBy,
        decidedAt: r.decidedAt,
        decisionNote: r.decisionNote,
      }));
    },
    staleTime: 1000 * 5,
  });
};

export const useApproveRequest = () => {
  const queryClient = useQueryClient();

  return useMutation<AccessRequest, Error, { requestId: string; approverName: string; note?: string }>({
    mutationFn: async ({ requestId, approverName, note }) => {
      try {
        const updated = await apiClient.post<any>(`/authorization/requests/${requestId}/approve`, {
          approverName,
          note,
        });
        if (updated) {
          centralStore.approveRequest(requestId, approverName, note);
          return updated;
        }
      } catch (err) {
        console.warn('Backend approve fallback:', err);
      }
      const req = centralStore.approveRequest(requestId, approverName, note);
      return req as any;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['access-requests'] });
      queryClient.invalidateQueries({ queryKey: ['command-center-stats'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      queryClient.invalidateQueries({ queryKey: ['gmail-notifications'] });
    },
  });
};

export const useDenyRequest = () => {
  const queryClient = useQueryClient();

  return useMutation<AccessRequest, Error, { requestId: string; denierName: string; reason: string }>({
    mutationFn: async ({ requestId, denierName, reason }) => {
      try {
        const updated = await apiClient.post<any>(`/authorization/requests/${requestId}/deny`, {
          denierName,
          reason,
        });
        if (updated) {
          centralStore.denyRequest(requestId, denierName, reason);
          return updated;
        }
      } catch (err) {
        console.warn('Backend deny fallback:', err);
      }
      const req = centralStore.denyRequest(requestId, denierName, reason);
      return req as any;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['access-requests'] });
      queryClient.invalidateQueries({ queryKey: ['access-denied-log'] });
      queryClient.invalidateQueries({ queryKey: ['command-center-stats'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      queryClient.invalidateQueries({ queryKey: ['gmail-notifications'] });
    },
  });
};

export const useAccessDeniedLog = (filters?: { reason?: string; documentId?: string }) => {
  return useQuery<AccessDeniedEntry[]>({
    queryKey: ['access-denied-log', filters],
    queryFn: async () => {
      try {
        const logs = await apiClient.get<any[]>('/authorization/denied-logs');
        if (Array.isArray(logs) && logs.length > 0) {
          let list = logs;
          if (filters?.reason && filters.reason !== 'All Reasons') {
            list = list.filter((l) => l.reasonForDenial === filters.reason);
          }
          if (filters?.documentId && filters.documentId !== 'All Documents') {
            const docQuery = filters.documentId;
            list = list.filter((l) => l.documentId === docQuery || (l.documentName && l.documentName.includes(docQuery)));
          }
          return list;
        }
      } catch (err) {
        console.warn('Backend denied-logs fallback:', err);
      }
      const state = centralStore.getState();
      let list = state.deniedLogs.map((l) => ({
        id: l.id,
        timeZ: l.timeZ,
        timeLocal: l.timeLocal,
        requester: l.requester,
        rank: l.rank,
        unit: l.unit,
        deviceId: l.deviceId,
        documentId: l.documentId,
        documentName: l.documentName,
        reasonForDenial: l.reasonForDenial as any,
        alertFired: l.alertFired,
        ipAddress: l.ipAddress,
        terminalNode: l.terminalNode,
      }));

      if (filters?.reason && filters.reason !== 'All Reasons') {
        list = list.filter((l) => l.reasonForDenial === filters.reason);
      }

      if (filters?.documentId && filters.documentId !== 'All Documents') {
        const docQuery = filters.documentId;
        list = list.filter((l) => l.documentId === docQuery || l.documentName.includes(docQuery));
      }

      return list;
    },
    staleTime: 1000 * 5,
  });
};

export const useAlertRules = () => {
  return useQuery<AlertRule[]>({
    queryKey: ['alert-rules'],
    queryFn: async (): Promise<AlertRule[]> => {
      try {
        const rules = await apiClient.get<any[]>('/authorization/alert-rules');
        if (Array.isArray(rules) && rules.length > 0) {
          return rules;
        }
      } catch (err) {
        console.warn('Backend alert rules fallback:', err);
      }
      const state = centralStore.getState();
      return state.alertRules.map((r) => ({
        id: r.id,
        name: r.name,
        denialThreshold: r.denialThreshold,
        groupingKey: r.groupingKey as any,
        timeWindow: r.timeWindow as any,
        action: r.action as any,
        isActive: r.isActive,
      }));
    },
    staleTime: 1000 * 5,
  });
};

export const useUpdateAlertRules = () => {
  const queryClient = useQueryClient();

  return useMutation<AlertRule[], Error, AlertRule[]>({
    mutationFn: async (updatedRules) => {
      try {
        await apiClient.put('/authorization/alert-rules', { rules: updatedRules });
      } catch (err) {
        console.warn('Backend update alert rules fallback:', err);
      }
      const state = centralStore.getState();
      state.alertRules = updatedRules.map((r) => ({
        id: r.id,
        name: r.name,
        denialThreshold: r.denialThreshold,
        groupingKey: r.groupingKey as any,
        timeWindow: r.timeWindow as any,
        action: r.action as any,
        isActive: r.isActive,
      }));
      return updatedRules;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alert-rules'] });
    },
  });
};
