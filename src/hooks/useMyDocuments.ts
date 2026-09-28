import { useQuery } from '@tanstack/react-query';
import type { RecipientDocument } from '../types/recipientUser';
import { INITIAL_RECIPIENT_DOCUMENTS } from '../data/recipientMockData';

export interface DocumentQueryParams {
  tab?: 'All' | 'New' | 'Opened' | 'Expiring' | 'Expired';
  search?: string;
  classification?: string;
  sortBy?: 'newest' | 'expiry' | 'title';
  page?: number;
  pageSize?: number;
}

export interface PaginatedDocumentsResult {
  documents: RecipientDocument[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export const useMyDocuments = (params?: DocumentQueryParams) => {
  return useQuery<PaginatedDocumentsResult>({
    queryKey: ['my-documents', params],
    queryFn: async () => {
      await new Promise((r) => setTimeout(r, 150));

      let list = [...INITIAL_RECIPIENT_DOCUMENTS];

      // Tab filter
      if (params?.tab && params.tab !== 'All') {
        if (params.tab === 'New') {
          list = list.filter((d) => d.status === 'New' || d.accessCount === 0);
        } else if (params.tab === 'Opened') {
          list = list.filter((d) => d.status === 'Opened' || d.accessCount > 0);
        } else if (params.tab === 'Expiring') {
          list = list.filter((d) => d.isExpiringSoon && !d.isExpired);
        } else if (params.tab === 'Expired') {
          list = list.filter((d) => d.isExpired || d.status === 'Expired' || d.status === 'Revoked');
        }
      }

      // Classification filter
      if (params?.classification && params.classification !== 'All') {
        list = list.filter((d) => d.classification.includes(params.classification!));
      }

      // Search filter
      if (params?.search && params.search.trim()) {
        const query = params.search.trim().toLowerCase();
        list = list.filter(
          (d) =>
            d.title.toLowerCase().includes(query) ||
            d.documentNumber.toLowerCase().includes(query) ||
            d.description.toLowerCase().includes(query) ||
            d.sentByAuthority.toLowerCase().includes(query) ||
            d.sentByUnit.toLowerCase().includes(query)
        );
      }

      // Sort
      const sortBy = params?.sortBy || 'newest';
      if (sortBy === 'newest') {
        list.sort((a, b) => new Date(b.receivedTimestamp).getTime() - new Date(a.receivedTimestamp).getTime());
      } else if (sortBy === 'expiry') {
        list.sort((a, b) => new Date(a.expiryTimestamp).getTime() - new Date(b.expiryTimestamp).getTime());
      } else if (sortBy === 'title') {
        list.sort((a, b) => a.title.localeCompare(b.title));
      }

      const total = list.length;
      const page = params?.page || 1;
      const pageSize = params?.pageSize || 10;
      const totalPages = Math.ceil(total / pageSize) || 1;
      const startIndex = (page - 1) * pageSize;
      const paginatedDocs = list.slice(startIndex, startIndex + pageSize);

      return {
        documents: paginatedDocs,
        total,
        page,
        pageSize,
        totalPages,
      };
    },
    staleTime: 1000 * 10,
  });
};

export const useMyDocumentById = (id?: string) => {
  return useQuery<RecipientDocument>({
    queryKey: ['my-document-detail', id],
    queryFn: async () => {
      await new Promise((r) => setTimeout(r, 180));
      const doc = INITIAL_RECIPIENT_DOCUMENTS.find((d) => d.id === id || d.documentNumber === id);
      if (!doc) {
        throw new Error('Document not found or you are not authorized to view this record.');
      }
      return doc;
    },
    enabled: !!id,
    staleTime: 1000 * 30,
  });
};
