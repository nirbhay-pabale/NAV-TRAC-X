import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DocumentHeader } from '../components/documents/DocumentHeader';
import { DocumentStatCards } from '../components/documents/DocumentStatCards';
import { DocumentFilterBar } from '../components/documents/DocumentFilterBar';
import { DocumentTable } from '../components/documents/DocumentTable';
import { DocumentDetailDrawer } from '../components/documents/DocumentDetailDrawer';
import { useDocuments } from '../hooks/useDocumentData';
import type { DocumentFilters, DocumentItem } from '../types/document';

export const DocumentsPage: React.FC = () => {
  const { docId } = useParams<{ docId?: string }>();
  const navigate = useNavigate();

  const initialFilters: DocumentFilters = {
    classification: 'All Classifications',
    documentType: 'All Types',
    status: 'All Statuses',
    dateRange: 'All Time',
    searchQuery: '',
    page: 1,
    pageSize: 10,
  };

  const [filters, setFilters] = useState<DocumentFilters>(initialFilters);
  const { data: response, isLoading } = useDocuments(filters);

  const documents = response?.documents || [];
  const [selectedDocument, setSelectedDocument] = useState<DocumentItem | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(true);

  // Sync document from URL parameter or default to first document
  useEffect(() => {
    if (documents.length > 0) {
      if (docId) {
        const found = documents.find((d) => d.id === docId || d.name.includes(docId));
        if (found) {
          setSelectedDocument(found);
          setIsDrawerOpen(true);
        }
      } else if (!selectedDocument) {
        setSelectedDocument(documents[0]);
      }
    }
  }, [docId, documents]);

  const handleSelectDocument = (doc: DocumentItem) => {
    setSelectedDocument(doc);
    setIsDrawerOpen(true);
  };

  const handleFilterChange = (newFilters: Partial<DocumentFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const handleResetFilters = () => {
    setFilters(initialFilters);
  };

  return (
    <div className="relative space-y-4 animate-fadeIn pb-10 min-h-screen">
      {/* Confined Warship Silhouette Overlay in Header Banner */}
      <div
        className="pointer-events-none absolute top-0 right-0 w-[550px] h-[190px] opacity-25 mix-blend-screen bg-contain bg-no-repeat bg-right-top z-0"
        style={{
          backgroundImage: `url('/Login_BG.png')`,
          maskImage: 'linear-gradient(to bottom, black 30%, transparent 95%)',
          WebkitMaskImage: 'linear-gradient(to bottom, black 30%, transparent 95%)',
        }}
      />

      {/* Page Header */}
      <DocumentHeader onDistributeClick={() => navigate('/distribute')} />

      {/* 4 Stat Cards Row */}
      <DocumentStatCards />

      {/* 4-Control Filter Bar */}
      <DocumentFilterBar
        filters={filters}
        onChange={handleFilterChange}
        onReset={handleResetFilters}
        totalResults={response?.totalCount || 0}
      />

      {/* Main Workspace Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start relative z-10">
        {/* Documents Table Column */}
        <div className={`transition-all duration-300 ${isDrawerOpen && selectedDocument ? 'lg:col-span-7 xl:col-span-7 2xl:col-span-8' : 'lg:col-span-12'}`}>
          <DocumentTable
            documents={documents}
            selectedDocId={selectedDocument?.id || null}
            onSelectDocument={handleSelectDocument}
            isLoading={isLoading}
          />
        </div>

        {/* Document Detail Drawer Column */}
        {isDrawerOpen && selectedDocument && (
          <div className="lg:col-span-5 xl:col-span-5 2xl:col-span-4 sticky top-20 h-[calc(100vh-100px)] min-h-[580px]">
            <DocumentDetailDrawer
              document={selectedDocument}
              onClose={() => setIsDrawerOpen(false)}
              onDistribute={() => navigate('/distribute')}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentsPage;
